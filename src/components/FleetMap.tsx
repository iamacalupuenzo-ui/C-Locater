import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import { FLEET_DATA } from '../lib/data';

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

function FlyToUpdater() {
  const map = useMap();
  useEffect(() => {
    const handleFlyTo = (e: any) => {
      const position = e.detail;
      if (position) {
        map.flyTo(position, 17, { animate: true, duration: 1.2 });
      }
    };
    window.addEventListener('flyToVehicle', handleFlyTo);
    return () => window.removeEventListener('flyToVehicle', handleFlyTo);
  }, [map]);
  return null;
}

const createCustomIcon = (vehicle: typeof FLEET_DATA[0]) => {
  const getStatusAppleColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759'; // Apple Green
      case 'stopped': return '#FF3B30'; // Apple Red
      case 'offline': return '#8E8E93'; // Apple Gray
      default: return '#34C759';
    }
  };
  
  const getIconSvg = (type: string) => {
    if (type === 'motorcycle') {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16v-3a4 4 0 0 1 4-4h5M18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 9V7a2 2 0 0 0-2-2H8"/></svg>`;
    }
    if (type === 'truck') {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="13" x="4" y="8" rx="2"/><path d="M20 8v6M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="8" cy="21" r="2"/><circle cx="16" cy="21" r="2"/></svg>`;
    }
    // car
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`;
  };

  const dotColor = getStatusAppleColor(vehicle.status);

  const html = `
    <div class="flex flex-col items-center justify-center translate-y-[-50%] group">
      <div class="bg-white/90 backdrop-blur-2xl rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-white p-1 flex items-center gap-1.5 pr-2.5 transform transition-transform group-hover:scale-105">
        <div class="w-[26px] h-[26px] rounded-full bg-gray-50 flex items-center justify-center text-gray-700 border border-gray-200 shrink-0 relative">
          ${getIconSvg(vehicle.type)}
          <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style="background-color: ${dotColor};"></div>
        </div>
        <div class="flex flex-col justify-center gap-0.5">
          <span class="text-[11px] font-semibold text-gray-900 leading-none tracking-tight">${vehicle.name}</span>
          <span class="text-[9px] font-medium text-gray-500 leading-none">${vehicle.plate}</span>
        </div>
      </div>
      <div class="w-px h-3 bg-gray-400 mt-1"></div>
      <div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-fleet-marker',
    iconSize: [80, 50],
    iconAnchor: [40, 50],
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

  useEffect(() => {
    setMounted(true);
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
        <FlyToUpdater />
        <MapEvents onMapClick={onMapClick} isDrawingMode={isDrawingMode} />
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
            icon={createCustomIcon(vehicle)}
          >
            <Popup className="rounded-xl">
              <div className="p-1">
                <h3 className="font-bold text-sm">{vehicle.name}</h3>
                <p className="text-xs text-gray-500">{vehicle.plate}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapEvents({ onMapClick, isDrawingMode }: { onMapClick?: (lat: number, lng: number) => void; isDrawingMode?: boolean }) {
  useMapEvents({
    click(e) {
      if (isDrawingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}
