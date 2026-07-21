const FABRIC_COLOR_MAP: Record<string, string> = {
  'fab-1': '#1B2A4A', // Dark Navy
  'fab-2': '#7E8895', // Textured Light Grey
  'fab-3': '#141416', // Classic Black
  'fab-4': '#203763', // Light Navy
  'fab-5': '#4A3525', // Brown Wool
  'fab-6': '#2E353F', // Textured Charcoal
  'fab-7': '#C2B280', // Khaki Linen
  'fab-8': '#C9BFAD', // Beige Wool
  'fab-9': '#3E4A38', // Green Taupe
  'fab-10': '#EAE5DB', // Off White
};

export function hashColor(id: string, name?: string): string {
  if (FABRIC_COLOR_MAP[id]) return FABRIC_COLOR_MAP[id];

  const n = (name || id).toLowerCase();
  if (n.includes('dark navy') || n.includes('navy')) return '#1B2A4A';
  if (n.includes('light grey') || n.includes('silver')) return '#7E8895';
  if (n.includes('black')) return '#141416';
  if (n.includes('charcoal')) return '#2E353F';
  if (n.includes('brown') || n.includes('camel')) return '#4A3525';
  if (n.includes('khaki')) return '#C2B280';
  if (n.includes('beige') || n.includes('sand')) return '#C9BFAD';
  if (n.includes('green') || n.includes('taupe')) return '#3E4A38';
  if (n.includes('white') || n.includes('cream')) return '#EAE5DB';

  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const hue = 210 + (Math.abs(hash) % 40); // Lock to dark navy/slate hue range
  return `hsl(${hue}, 45%, 22%)`;
}

