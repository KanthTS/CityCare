import { useEffect, useState } from 'react'
import { complaintApi } from '../../api/endpoints'
import ComplaintCard from '../../components/ComplaintCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { STATUS_LABELS } from '../../utils/format'

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', severity: '', q: '' })

  const load = () => {
    setLoading(true)
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.severity) params.severity = filters.severity
    if (filters.q) params.q = filters.q
    complaintApi
      .all(params)
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">All Complaints</h1>
        <p className="mt-1 text-sm text-slate-500">Verify, assign and monitor every civic complaint.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Search complaint ID, issue, description…"
          className="min-w-56 flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
        >
          <option value="">All severities</option>
          {['Low', 'Medium', 'High', 'Critical'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints match these filters" />
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  )
}
