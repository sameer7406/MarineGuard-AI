export const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'HIGH RISK':
      return '#ff0055'; // Neon Pink/Red
    case 'MEDIUM':
    case 'MEDIUM RISK':
      return '#ffb700'; // Amber
    case 'LOW':
    case 'LOW RISK':
      return '#00ffa3'; // Neon Cyan/Green
    default:
      return '#00f0ff'; // Electric Cyan
  }
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'HIGH RISK':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'MEDIUM':
    case 'MEDIUM RISK':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'LOW':
    case 'LOW RISK':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }
};

export const formatCoordinates = (lat, lon) => {
  if (!lat || !lon) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
};

export const formatArea = (areaM2) => {
  if (!areaM2) return '0 m²';
  if (areaM2 >= 10000) {
    return `${(areaM2 / 10000).toFixed(2)} ha (${(areaM2 / 1000000).toFixed(3)} km²)`;
  }
  return `${Number(areaM2).toLocaleString()} m²`;
};
