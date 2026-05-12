export function getBatteryColor(fuel: string): string {
  const pct = parseInt(fuel) || 0;
  if (pct <= 20) return 'text-red-500';
  if (pct <= 60) return 'text-amber-500';
  return 'text-emerald-500';
}
