import { STATUS_LABELS, STATUS_COLORS } from '../../utils/format'

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}
