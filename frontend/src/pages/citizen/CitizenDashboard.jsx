import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { complaintApi } from '../../api/endpoints'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { timeAgo } from '../../utils/format'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([complaintApi.citizenStats(), complaintApi.mine()])
      .then(([s, c]) => {
        setStats(s.data.stats)
        setComplaints(c.data.complaints)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const recent = complaints.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening with your civic reports.</p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          📷 Report an Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Complaints" value={stats.total} icon="📋" tone="brand" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" tone="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon="🛠️" tone="indigo" />
        <StatCard label="Resolved" value={stats.resolved} icon="✅" tone="emerald" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Complaints</h2>
          <Link to="/citizen/complaints" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Report your first civic issue and CivicFix's AI will classify it automatically."
            action={
              <Link to="/citizen/report" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Report an Issue
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((c) => (
              <Link
                key={c._id}
                to={`/complaints/${c._id}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={c.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover bg-slate-100" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{c.issueType}</p>
                    <p className="text-xs text-slate-500">{c.complaintId} · {timeAgo(c.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
