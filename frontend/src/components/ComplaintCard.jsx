import { Link } from 'react-router-dom'
import StatusBadge from './ui/StatusBadge'
import PriorityBadge from './ui/PriorityBadge'
import { formatDate } from '../utils/format'

export default function ComplaintCard({ complaint: c }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      <img src={c.image} alt="" className="h-32 w-full flex-shrink-0 rounded-xl object-cover sm:w-32" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{c.issueType}</p>
            <p className="text-xs text-slate-500">{c.complaintId}</p>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </div>
        </div>
        <p className="mt-2 line-clamp-1 text-xs text-slate-500">
          📍 {c.location?.address || `${c.location?.lat?.toFixed(4)}, ${c.location?.lng?.toFixed(4)}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Reported {formatDate(c.createdAt)}</span>
          {c.citizen?.name && <span>By {c.citizen.name}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to={`/complaints/${c._id}`}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            View Details
          </Link>
          <a
            href={`https://www.openstreetmap.org/directions?to=${c.location.lat}%2C${c.location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            🧭 Navigate
          </a>
        </div>
      </div>
    </div>
  )
}
