import { useEffect, useState } from 'react'
import { complaintApi } from '../../api/endpoints'
import ComplaintCard from '../../components/ComplaintCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const TABS = [
  { key: 'active', label: 'Active', statuses: ['assigned', 'accepted', 'in_progress'] },
  { key: 'all', label: 'All' },
]

export default function AssignedIssues({ onlyCompleted = false }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(onlyCompleted ? 'all' : 'active')

  useEffect(() => {
    complaintApi
      .assigned()
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  let filtered = complaints
  if (onlyCompleted) {
    filtered = complaints.filter((c) => ['resolved', 'closed'].includes(c.status))
  } else {
    const activeTab = TABS.find((t) => t.key === tab)
    filtered = activeTab.statuses ? complaints.filter((c) => activeTab.statuses.includes(c.status)) : complaints
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {onlyCompleted ? 'Completed Work' : 'Assigned Issues'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {onlyCompleted ? 'Complaints you have resolved.' : 'Complaints assigned to you across the workflow.'}
        </p>
      </div>

      {!onlyCompleted && (
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  )
}
