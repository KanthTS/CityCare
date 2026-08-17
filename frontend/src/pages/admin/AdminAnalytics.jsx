import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { analyticsApi } from '../../api/endpoints'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'

const SEVERITY_CHART_COLORS = { Low: '#16a34a', Medium: '#eab308', High: '#f97316', Critical: '#dc2626' }

export default function AdminAnalytics() {
  const [breakdown, setBreakdown] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.breakdown(), analyticsApi.performance()])
      .then(([b, p]) => {
        setBreakdown(b.data)
        setPerformance(p.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Resolution performance, hotspots and department insights.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Avg. Resolution Time" value={`${performance.avgResolutionHours}h`} icon="⏱️" tone="brand" />
        <StatCard label="Most Reported" value={performance.mostReported[0]?.issueType || '—'} icon="🔥" tone="rose" />
        <StatCard label="Top Hotspot Reports" value={performance.topAreas[0]?.count || 0} icon="📍" tone="amber" />
        <StatCard label="Departments Tracked" value={breakdown.byDepartment.length} icon="🏛️" tone="indigo" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Complaints by Severity</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={breakdown.bySeverity} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={90} label={(d) => d.severity}>
                {breakdown.bySeverity.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_CHART_COLORS[entry.severity] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Complaints by Department</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={breakdown.byDepartment} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="department" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Most Reported Issues</h2>
          <div className="space-y-2">
            {performance.mostReported.map((m, i) => (
              <div key={m.issueType} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">
                  <span className="mr-2 font-semibold text-slate-400">{i + 1}.</span>
                  {m.issueType}
                </span>
                <span className="text-sm font-semibold text-slate-900">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Highest Complaint Areas</h2>
          <div className="space-y-2">
            {performance.topAreas.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="truncate text-sm text-slate-700">
                  {a.address || `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`}
                </span>
                <span className="text-sm font-semibold text-slate-900">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Worker Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Worker</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Assigned</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Avg. Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.workerPerformance.map((w) => (
                <tr key={w.workerId}>
                  <td className="py-2 pr-4 font-medium text-slate-800">{w.name}</td>
                  <td className="py-2 pr-4 text-slate-600">{w.department || '—'}</td>
                  <td className="py-2 pr-4 text-slate-600">{w.assigned}</td>
                  <td className="py-2 pr-4 text-emerald-600">{w.completed}</td>
                  <td className="py-2 pr-4 text-slate-600">{w.avgResolutionHours ? `${w.avgResolutionHours}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
