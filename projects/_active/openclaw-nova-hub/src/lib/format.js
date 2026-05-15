export function timeAgo(iso) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const s = Math.max(1, Math.round(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w}w ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export function fmtTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function fmtDate(date = new Date()) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncate(str, n) {
  if (!str) return '';
  if (str.length <= n) return str;
  return str.slice(0, n - 1) + '…';
}

export function prettyPath(p) {
  if (!p) return '';
  return p.replace(/^projects\//, '');
}

export function openInFinder(absolutePath) {
  // Best-effort: this opens in the user's default handler via file:// — the
  // browser may block depending on security settings. Show the path either way.
  const url = `file://${absolutePath}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
