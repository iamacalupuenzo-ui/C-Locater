import type { Vehicle } from './data';
import { FLEET_KNOWLEDGE } from './fleetKnowledge';

// ─── Types ─────────────────────────────────────────────────────────────────

type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string };

const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';
// const MODEL = 'llama-3.3-70b-versatile';                    // 12K TPM
// const MODEL = 'llama-3.1-8b-instant';                       //  6K TPM
const MODEL     = 'meta-llama/llama-4-scout-17b-16e-instruct'; // 30K TPM ← mejor opción

// ─── Tool definitions ───────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'navigate_to_vehicle',
      description: 'Navega el mapa a la ubicación de un vehículo específico y lo selecciona visualmente.',
      parameters: {
        type: 'object',
        properties: {
          plate: { type: 'string', description: 'Placa del vehículo, ej: MOT-901 o ABC123' },
        },
        required: ['plate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_vehicle_info',
      description: 'Obtiene información completa de un vehículo: estado, propietario, tipo, alertas.',
      parameters: {
        type: 'object',
        properties: {
          plate: { type: 'string', description: 'Placa del vehículo' },
        },
        required: ['plate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_fleet_summary',
      description: 'Obtiene un resumen general del estado de toda la flota: total, activos, detenidos, sin señal, alertas.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_vehicles_by_status',
      description: 'Lista los vehículos filtrados por un estado específico.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'stopped', 'offline'],
            description: 'active = en ruta, stopped = detenido, offline = sin señal',
          },
        },
        required: ['status'],
      },
    },
  },
] as const;

// ─── Vehicle lookup ─────────────────────────────────────────────────────────

function findVehicle(plate: string, vehicles: Vehicle[]): Vehicle | null {
  const clean = plate.toLowerCase().replace(/[-\s]/g, '');
  return vehicles.find(v => {
    const vp = v.plate.toLowerCase().replace(/[-\s]/g, '');
    return vp === clean || vp.includes(clean) || clean.includes(vp);
  }) ?? null;
}

function statusLabel(status: Vehicle['status']) {
  return status === 'active' ? 'activo en ruta' : status === 'stopped' ? 'detenido' : 'sin señal';
}

// ─── Tool executor ──────────────────────────────────────────────────────────

function executeTool(name: string, args: Record<string, string>, vehicles: Vehicle[]): string {
  switch (name) {
    case 'navigate_to_vehicle': {
      const v = findVehicle(args.plate, vehicles);
      if (!v) return `No encontré ningún vehículo con placa "${args.plate}". Verifica el número de placa.`;
      window.dispatchEvent(new CustomEvent('flyToVehicle', { detail: { position: v.position, offsetX: 0 } }));
      window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: v.id, source: 'monitor' } }));
      const alerts = v.alarmCount ? ` Tiene ${v.alarmCount} alerta${v.alarmCount > 1 ? 's' : ''} activa${v.alarmCount > 1 ? 's' : ''}.` : '';
      return `Vehículo ${v.plate} (${v.name}) ubicado. Estado: ${statusLabel(v.status)}.${alerts} El mapa ya navegó a su posición.`;
    }

    case 'get_vehicle_info': {
      const v = findVehicle(args.plate, vehicles);
      if (!v) return `No encontré ningún vehículo con placa "${args.plate}".`;
      const gps  = v.gpsDevices?.[0];
      const speed = gps?.speed ?? v.speed ?? '0 km/h';
      const ign  = gps?.ignition === 'on' ? 'encendido' : 'apagado';
      return `${v.plate} - ${v.name}. Propietario: ${v.owner}. Tipo: ${v.type}. Estado: ${statusLabel(v.status)}. Motor: ${ign}. Velocidad: ${speed}.${v.alarmCount ? ` Alertas: ${v.alarmCount}.` : ''}`;
    }

    case 'get_fleet_summary': {
      const active  = vehicles.filter(v => v.status === 'active').length;
      const stopped = vehicles.filter(v => v.status === 'stopped').length;
      const offline = vehicles.filter(v => v.status === 'offline').length;
      const alarmed = vehicles.filter(v => (v.alarmCount ?? 0) > 0).length;
      return `Flota: ${vehicles.length} unidades totales. Activos: ${active}. Detenidos: ${stopped}. Sin señal: ${offline}.${alarmed > 0 ? ` Con alertas: ${alarmed}.` : ' Sin alertas activas.'}`;
    }

    case 'list_vehicles_by_status': {
      const filtered = vehicles.filter(v => v.status === args.status);
      if (filtered.length === 0) return `No hay vehículos ${statusLabel(args.status as Vehicle['status'])} en este momento.`;
      const names = filtered.slice(0, 6).map(v => v.plate).join(', ');
      const extra = filtered.length > 6 ? ` y ${filtered.length - 6} más` : '';
      return `${filtered.length} vehículo${filtered.length > 1 ? 's' : ''} ${statusLabel(args.status as Vehicle['status'])}: ${names}${extra}.`;
    }

    default:
      return 'Herramienta no reconocida.';
  }
}

// ─── Main agent call ────────────────────────────────────────────────────────

export async function processVoiceQuery(
  userQuery: string,
  vehicles: Vehicle[],
  history: ChatMessage[],
  apiKey: string,
): Promise<{ response: string; updatedHistory: ChatMessage[] }> {

  const vehicleIndex = vehicles
    .map(v => `${v.plate}|${v.name}|${v.type}|${v.status}|${v.owner}`)
    .join('\n');

  const systemPrompt = `Eres CLocater IA, asistente de voz para gestión de flotas vehiculares en el Perú.
Ayudas al operador a monitorear su flota en tiempo real usando herramientas del sistema.
Responde siempre en español peruano, de forma concisa y natural (máximo 2 oraciones cortas).
Cuando el usuario mencione una placa o vehículo, usa las herramientas disponibles para buscarla y actuar inmediatamente.
No inventes información que no esté en los datos reales de la flota.
Si el usuario pregunta por métricas o datos de un vehículo, usa get_vehicle_info y luego navega con navigate_to_vehicle.

${FLEET_KNOWLEDGE}

Flota actual (${vehicles.length} vehículos):
${vehicleIndex}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userQuery },
  ];

  // ── Primera llamada a Groq ──
  const res1 = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 512,
      temperature: 0.5,
    }),
  });

  if (!res1.ok) {
    if (res1.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(`Groq error ${res1.status}: ${await res1.text()}`);
  }

  const data1 = await res1.json();
  const assistantMsg = data1.choices[0].message as { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] };

  const updatedHistory: ChatMessage[] = [
    ...history,
    { role: 'user', content: userQuery },
  ];

  // ── Sin tool calls → respuesta directa ──
  if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
    const text = assistantMsg.content ?? 'No tengo información sobre eso.';
    updatedHistory.push({ role: 'assistant', content: text });
    return { response: text, updatedHistory };
  }

  // ── Con tool calls → ejecutar + segunda llamada ──
  updatedHistory.push({ role: 'assistant', content: assistantMsg.content, tool_calls: assistantMsg.tool_calls });

  const toolResults: ChatMessage[] = assistantMsg.tool_calls.map(tc => {
    let args: Record<string, string> = {};
    try { args = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
    const result = executeTool(tc.function.name, args, vehicles);
    return { role: 'tool' as const, content: result, tool_call_id: tc.id };
  });

  updatedHistory.push(...toolResults);

  const res2 = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...updatedHistory],
      max_tokens: 300,
      temperature: 0.5,
    }),
  });

  if (!res2.ok) {
    if (res2.status === 429) {
      // El tool ya se ejecutó (mapa navegó, datos disponibles).
      // Usar el resultado del tool directamente como respuesta — sin otra llamada al LLM.
      const fallback = toolResults.map(r => r.content).join(' ');
      updatedHistory.push({ role: 'assistant', content: fallback });
      return { response: fallback, updatedHistory };
    }
    throw new Error(`Groq error ${res2.status}: ${await res2.text()}`);
  }

  const data2 = await res2.json();
  const finalText: string = data2.choices[0].message.content ?? 'Listo.';
  updatedHistory.push({ role: 'assistant', content: finalText });

  return { response: finalText, updatedHistory };
}
