import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 'admin' | 'esad' | 'operator' | 'client';

// ---------- helpers internos ----------

function parseParts(lastSeen: string) {
  const parts = lastSeen.split(' ');
  if (parts.length < 3) return null;
  const [dateStr, timeStr, ampmStr] = parts;
  const [day, month, year] = dateStr.split('/');
  const timeParts = timeStr.split(':');
  const hours   = timeParts[0];
  const minutes = timeParts[1];
  const seconds = timeParts[2] ?? '00';
  const days    = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months  = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const date    = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
  const hour12  = parseInt(hours) === 0 ? 12 : parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
  const ampm    = ampmStr.toLowerCase().includes('a') ? 'AM' : 'PM';
  return { day, month, year, hours, minutes, seconds, days, months, date, hour12, ampm, intDay: parseInt(day) };
}

// ---------- sin segundos (operator / client) ----------

export function formatLastSeenMini(lastSeen: string): string {
  const p = parseParts(lastSeen);
  if (!p) return lastSeen;
  return `${p.intDay} ${p.months[p.date.getMonth()]} · ${p.hour12}:${p.minutes} ${p.ampm}`;
}

export function formatLastSeenShort(lastSeen: string): string {
  const p = parseParts(lastSeen);
  if (!p) return lastSeen;
  return `${p.days[p.date.getDay()]} ${p.intDay} ${p.months[parseInt(p.month) - 1]} · ${p.hour12}:${p.minutes} ${p.ampm}`;
}

export function formatLastSeen(lastSeen: string): string {
  const p = parseParts(lastSeen);
  if (!p) return lastSeen;
  return `${p.days[p.date.getDay()]} ${p.intDay} ${p.months[parseInt(p.month) - 1]} ${p.year} • ${p.hour12}:${p.minutes} ${p.ampm}`;
}

// ---------- con segundos (admin / esad) ----------

export function formatLastSeenMiniSecs(lastSeen: string): string {
  const p = parseParts(lastSeen);
  if (!p) return lastSeen;
  const h = parseInt(p.hours);
  const hour24 = p.ampm === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
  const hour24Str = String(hour24).padStart(2, '0');
  return `${p.intDay} ${p.months[p.date.getMonth()]} · ${hour24Str}:${p.minutes}:${p.seconds}`;
}

export function formatLastSeenWithSecs(lastSeen: string): string {
  const p = parseParts(lastSeen);
  if (!p) return lastSeen;
  return `${p.days[p.date.getDay()]} ${p.intDay} ${p.months[parseInt(p.month) - 1]} ${p.year} • ${p.hour12}:${p.minutes}:${p.seconds} ${p.ampm}`;
}
