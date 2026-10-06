/** Relative age for launch freshness (e.g. "3d ago"). Shared by leads/prospect tables. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(s) || s < 0) return 'just now';
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d > 30) return `${Math.floor(d / 30)}mo ago`;
  return d === 1 ? 'yesterday' : `${d}d ago`;
}
