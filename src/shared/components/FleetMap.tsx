import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import { FLEET_DATA } from '../lib/data';
import { formatLastSeen } from '../lib/utils';

function BoundsUpdater({ points }: { points?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points ? points.length > 0 : false]);
  return null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':  return '#34C759';
    case 'stopped': return '#FF3B30';
    case 'offline': return '#8E8E93';
    default:        return '#34C759';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':  return 'Activo';
    case 'stopped': return 'Detenido';
    case 'offline': return 'Sin señal';
    default:        return '';
  }
};


const getIconSvg = (type: string, size = 14) => {
  if (type === 'motorcycle') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17h3l2-5h5l2 3h2"/><path d="M13 12l-2-4h-2"/></svg>`;
  }
  if (type === 'truck') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
  }
  if (type === 'bus') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>`;
  }
  if (type === 'machinery') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M3 17V9l4-4h6l4 4v8"/><path d="M9 17V9m6 8V9"/><rect x="7" y="5" width="10" height="4" rx="1"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-3h6l3 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/></svg>`;
};

// Pill has border:2px on all sides → outer height = 2+4+26+4+2 = 38px (not 34)
const COLLAPSED_ANCHOR_Y = 58; // pill_outer(38) + gap(2) + stem(12) + dot(6)

const createCustomIcon = (vehicle: typeof FLEET_DATA[0], isSelected: boolean = false, isHighlighted: boolean = false) => {
  const dotColor = getStatusColor(vehicle.status);

  if (isSelected) {
    const statusLabel = getStatusLabel(vehicle.status);
    const lastSeen = vehicle.lastSeen ?? '—';
    const cardW = 220;
    const stemH = 12;
    // All text has explicit line-height:1 to block Tailwind's inherited 1.5.
    // Layout (line-height:1 everywhere):
    //   header row  = max(34px icon, 13.5+5+14badge) = 34px
    //   margin      = 10px
    //   divider     = 1px
    //   margin      = 10px
    //   last-seen   = max(12svg, 9label+11value) = 22px
    //   margin      = 8px
    //   address     = max(12svg, 9label+11value) = 22px
    //   content     = 107px
    //   card outer  = 1.5border + 12pad + 107 + 12pad + 1.5border = 134px
    const cardH = 134;
    const anchorY = cardH + 2 + stemH + 6;
    const totalH = anchorY + 4;

    const formattedLastSeen = formatLastSeen(lastSeen);
  const html = `
      <div style="display:flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;line-height:1;">
        <div class="marker-card-anim" style="position:relative;width:${cardW}px;background:white;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.13),0 2px 6px rgba(0,0,0,0.07);border:1.5px solid rgba(0,82,204,0.18);padding:12px;box-sizing:border-box;">
          <!-- close button -->
          <button onclick="event.stopPropagation();if(window._closeFleetMarker)window._closeFleetMarker();" style="position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:#f3f4f6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:13px;padding:0;line-height:1;z-index:10;font-family:inherit;">×</button>
          <!-- header row -->
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px;padding-right:20px;">
            <div style="width:34px;height:34px;border-radius:10px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#374151;position:relative;flex-shrink:0;">
              ${getIconSvg(vehicle.type, 17)}
              <div style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:${dotColor};border:2px solid white;"></div>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-size:13.5px;font-weight:700;color:#111827;line-height:1;">${vehicle.name}</span>
                <span style="font-size:9.5px;font-weight:600;color:#6b7280;background:#f3f4f6;border-radius:4px;padding:2px 5px;line-height:1;">${vehicle.plate}</span>
              </div>
              <div style="margin-top:5px;display:inline-flex;align-items:center;gap:4px;background:${dotColor}22;border-radius:20px;padding:2px 8px;">
                <div style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
                <span style="font-size:10px;font-weight:600;color:${dotColor};line-height:1;">${statusLabel}</span>
              </div>
            </div>
          </div>
          <!-- divider -->
          <div style="height:1px;background:#f3f4f6;margin-bottom:8px;"></div>
          <!-- last seen with formatted date -->
          <div style="margin-bottom:6px;">
            <div style="font-size:9px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:11px;line-height:1;">Última ubicación</div>
            <div style="display:flex;align-items:center;gap:7px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div style="font-size:11px;font-weight:600;color:#374151;line-height:1;">${formattedLastSeen}</div>
            </div>
          </div>
          <!-- address -->
          <div style="display:flex;align-items:flex-start;gap:7px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0052CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:1px;flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div style="font-size:11px;font-weight:600;color:#374151;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;">${vehicle.address}</div>
          </div>
        </div>
        <div style="width:1px;height:${stemH}px;background:#94a3b8;margin-top:2px;"></div>
        <div style="width:6px;height:6px;background:#94a3b8;border-radius:50%;"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-fleet-marker',
      iconSize: [cardW, totalH],
      iconAnchor: [cardW / 2, anchorY],
    });
  }

  const pillBorder = isHighlighted ? '2px solid #0052CC' : '2px solid white';
  const pillShadow = isHighlighted
    ? '0 0 0 3px rgba(0,82,204,0.2), 0 4px 16px rgba(0,0,0,0.08)'
    : '0 4px 16px rgba(0,0,0,0.08)';

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
      <div style="background:rgba(255,255,255,0.96);backdrop-filter:blur(16px);border-radius:999px;box-shadow:${pillShadow};border:${pillBorder};padding:4px 10px 4px 4px;display:flex;align-items:center;gap:7px;">
        <div style="width:26px;height:26px;border-radius:50%;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#374151;border:1px solid #e5e7eb;flex-shrink:0;position:relative;">
          ${getIconSvg(vehicle.type)}
          <div style="position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:${dotColor};border:2px solid white;"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:11.5px;font-weight:700;color:#111827;line-height:1;white-space:nowrap;">${vehicle.name}</span>
          <span style="font-size:9.5px;font-weight:600;color:#6b7280;line-height:1;white-space:nowrap;">${vehicle.plate}</span>
        </div>
      </div>
      <div style="width:1px;height:12px;background:#9ca3af;margin-top:2px;"></div>
      <div style="width:6px;height:6px;background:#9ca3af;border-radius:50%;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-fleet-marker',
    iconSize: [160, COLLAPSED_ANCHOR_Y + 6],
    iconAnchor: [80, COLLAPSED_ANCHOR_Y],
  });
};

export function FleetMap({
  isDrawingMode,
  drawingPoints,
  onMapClick,
  groupRoutes,
  selectedRouteId
}: {
  isDrawingMode?: boolean;
  drawingPoints?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
  groupRoutes?: any[];
  selectedRouteId?: string | null;
} = {}) {
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string | null; source?: string }>;
      const { id, source } = customEvent.detail;
      if (source === 'monitor') {
        setHighlightedId(id);
        setExpandedId(null);
      }
      // source === 'marker' is handled directly in the click handler
    };

    window.addEventListener('vehicleSelected', handleSelect);

    (window as any)._closeFleetMarker = () => {
      setExpandedId(null);
      setHighlightedId(null);
      window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'marker' } }));
    };

    return () => {
      window.removeEventListener('vehicleSelected', handleSelect);
      delete (window as any)._closeFleetMarker;
    };
  }, []);

  if (!mounted) return null;

  const selectedRoute = groupRoutes?.find(r => r.id === selectedRouteId);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[-12.0464, -77.0428]}
        zoom={15}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#f5f5f5', cursor: isDrawingMode ? 'crosshair' : 'grab' }}
      >
        <BoundsUpdater points={drawingPoints?.length ? drawingPoints : selectedRoute?.coordinates} />
        <MapEvents
          onMapClick={onMapClick}
          isDrawingMode={isDrawingMode}
          onDeselect={() => {
            setExpandedId(null);
            setHighlightedId(null);
            window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: null, source: 'map' } }));
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <ZoomControl position="bottomright" />

        {/* Selected Route rendering */}
        {!isDrawingMode && selectedRoute && selectedRoute.coordinates && selectedRoute.coordinates.length > 0 && (
          <>
            <Polyline positions={selectedRoute.coordinates} color="#0052CC" weight={6} opacity={0.8} />
            {selectedRoute.coordinates.map((pt: [number, number], i: number) => (
              <Marker key={`selected-${i}`} position={pt} icon={L.divIcon({
                className: 'custom-dot',
                html: `<div class="w-3 h-3 bg-[#0052CC] border-2 border-white rounded-full shadow-md"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })} />
            ))}
          </>
        )}

        {isDrawingMode && drawingPoints && drawingPoints.length > 0 && (
          <>
            <Polyline positions={drawingPoints} color="#0052CC" weight={4} dashArray="8, 8" />
            {drawingPoints.map((pt, i) => (
              <Marker key={i} position={pt} icon={L.divIcon({
                className: 'custom-dot',
                html: `<div class="w-3 h-3 bg-white border-2 border-[#0052CC] rounded-full shadow-md"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })} />
            ))}
          </>
        )}

        {!isDrawingMode && FLEET_DATA.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
            icon={createCustomIcon(
              vehicle,
              expandedId === vehicle.id,
              highlightedId === vehicle.id
            )}
            zIndexOffset={expandedId === vehicle.id || highlightedId === vehicle.id ? 1000 : 0}
            eventHandlers={{
              click: () => {
                (window as any)._markerJustClicked = true;
                setTimeout(() => { (window as any)._markerJustClicked = false; }, 50);
                const newId = expandedId === vehicle.id ? null : vehicle.id;
                setExpandedId(newId);
                setHighlightedId(null);
                window.dispatchEvent(new CustomEvent('vehicleSelected', { detail: { id: newId, source: 'marker' } }));
              }
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

function MapEvents({ onMapClick, isDrawingMode, onDeselect }: { onMapClick?: (lat: number, lng: number) => void; isDrawingMode?: boolean; onDeselect?: () => void }) {
  const map = useMap();

  useEffect(() => {
    const handleFlyTo = (e: Event) => {
      const customEvent = e as CustomEvent<{ position: [number, number] }>;
      const { position } = customEvent.detail;
      if (position && position.length === 2) {
        map.flyTo(position, 18, {
          animate: true,
          duration: 2.0
        });
      }
    };

    window.addEventListener('flyToVehicle', handleFlyTo);
    return () => {
      window.removeEventListener('flyToVehicle', handleFlyTo);
    };
  }, [map]);

  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      } else if (!isDrawingMode && !(window as any)._markerJustClicked) {
        onDeselect?.();
      }
    },
    movestart() {
      window.dispatchEvent(new CustomEvent('mapMoveStart'));
    },
    moveend() {
      window.dispatchEvent(new CustomEvent('mapMoveEnd'));
    },
    dragstart() {
      window.dispatchEvent(new CustomEvent('mapMoveStart'));
    },
  });
  return null;
}
