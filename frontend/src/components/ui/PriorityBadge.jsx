import { PRIORITY_COLORS } from '../../utils/format'

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${PRIORITY_COLORS[priority] || 'bg-slate-100 text-slate-700 ring-slate-600/20'}`}
    >
      {priority}
    </span>
  )
}
