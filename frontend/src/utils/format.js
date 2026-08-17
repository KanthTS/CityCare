export const STATUS_LABELS = {
  reported: 'Reported',
  verified: 'Verified',
  assigned: 'Assigned',
  accepted: 'Worker Accepted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
}

export const STATUS_COLORS = {
  reported: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  verified: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  assigned: 'bg-indigo-100 text-indigo-700 ring-indigo-600/20',
  accepted: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  in_progress: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-teal-100 text-teal-700 ring-teal-600/20',
  reopened: 'bg-rose-100 text-rose-700 ring-rose-600/20',
}

export const PRIORITY_COLORS = {
  Low: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Medium: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  High: 'bg-orange-100 text-orange-700 ring-orange-600/20',
  Critical: 'bg-rose-100 text-rose-700 ring-rose-600/20',
}

export const MAP_MARKER_COLORS = {
  Low: '#16a34a',
  Medium: '#eab308',
  High: '#f97316',
  Critical: '#dc2626',
  resolved: '#2563eb',
}

export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(date) {
  if (!date) return '-'
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function imageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path
}
