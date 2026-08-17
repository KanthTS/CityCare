import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { complaintApi } from '../../api/endpoints'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/format'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending', statuses: ['reported', 'verified', 'assigned'] },
  { key: 'progress', label: 'In Progress', statuses: ['accepted', 'in_progress'] },
  { key: 'resolved', label: 'Resolved', statuses: ['resolved', 'closed'] },
]

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    complaintApi
      .mine()
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const activeTab = TABS.find((t) => t.key === tab)
  const filtered = activeTab.statuses ? complaints.filter((c) => activeTab.statuses.includes(c.status)) : complaints

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My Complaints</h1>
        <p className="mt-1 text-sm text-slate-500">Track every issue you've reported, from submission to resolution.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No complaints in this category" description="Complaints you report will show up here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c._id}
              to={`/complaints/${c._id}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <img src={c.image} alt="" className="h-36 w-full object-cover bg-slate-100" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{c.issueType}</p>
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{c.complaintId}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.location?.address || `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}`}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
