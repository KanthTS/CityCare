import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { analyticsApi, complaintApi } from '../../api/endpoints'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import { formatDate } from '../../utils/format'

const STATUS_CHART_COLORS = ['#94a3b8', '#38bdf8', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#14b8a6', '#f43f5e']

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [breakdown, setBreakdown] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.overview(), analyticsApi.breakdown(), complaintApi.all()])
      .then(([o, b, c]) => {
        setOverview(o.data.overview)
        setBreakdown(b.data)
        setRecent(c.data.complaints.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">City-wide overview of civic issue management.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Complaints" value={overview.total} icon="📋" tone="brand" />
        <StatCard label="Resolved" value={overview.resolved} icon="✅" tone="emerald" />
        <StatCard label="Pending" value={overview.pending} icon="⏳" tone="amber" />
        <StatCard label="In Progress" value={overview.inProgress} icon="🛠️" tone="indigo" />
        <StatCard label="Critical Issues" value={overview.critical} icon="🚨" tone="rose" />
        <StatCard label="Active Workers" value={overview.activeWorkers} icon="🧑‍🔧" tone="slate" />
        <StatCard label="Citizens" value={overview.citizens} icon="👥" tone="slate" />
        <StatCard label="Departments" value={overview.departments} icon="🏛️" tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Complaints by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={breakdown.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={(d) => d.status}>
                {breakdown.byStatus.map((entry, i) => (
                  <Cell key={entry.status} fill={STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={breakdown.byCategory} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Complaints</h2>
          <Link to="/admin/complaints" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.map((c) => (
            <Link key={c._id} to={`/complaints/${c._id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <img src={c.image} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover bg-slate-100" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{c.issueType}</p>
                  <p className="text-xs text-slate-500">{c.complaintId} · {formatDate(c.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
