import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { complaintApi } from '../../api/endpoints'
import StatCard from '../../components/ui/StatCard'
import ComplaintCard from '../../components/ComplaintCard'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([complaintApi.workerStats(), complaintApi.assigned()])
      .then(([s, c]) => {
        setStats(s.data.stats)
        setComplaints(c.data.complaints)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active = complaints.filter((c) => !['resolved', 'closed'].includes(c.status)).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome, {user?.name?.split(' ')[0]} 🛠️</h1>
        <p className="mt-1 text-sm text-slate-500">{user?.department?.name} · Here's your workload overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assigned Issues" value={stats.assigned} icon="📋" tone="brand" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" tone="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon="🛠️" tone="indigo" />
        <StatCard label="Completed" value={stats.completed} icon="✅" tone="emerald" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Active Assignments</h2>
          <Link to="/worker/assigned" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {active.length === 0 ? (
          <EmptyState title="No active assignments" description="New complaints assigned to you will appear here." />
        ) : (
          <div className="space-y-3">
            {active.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
