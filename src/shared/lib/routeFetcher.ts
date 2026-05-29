const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;
  const coordsStr = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_BASE}/${coordsStr}?geometries=geojson&overview=full&alternatives=false&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) return null;

    const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
      ([lng, lat]: number[]) => [lat, lng] as [number, number]
    );
    return coords;
  } catch {
    return null;
  }
}

export async function fetchAllRoutes(
  paths: Record<string, [number, number][]>
): Promise<Record<string, [number, number][]>> {
  const entries = Object.entries(paths);
  const results: Record<string, [number, number][]> = {};

  const promises = entries.map(async ([id, waypoints]) => {
    const route = await fetchRoute(waypoints);
    if (route) results[id] = route;
  });

  await Promise.allSettled(promises);
  return results;
}
