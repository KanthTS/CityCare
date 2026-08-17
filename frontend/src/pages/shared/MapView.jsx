import { useEffect, useState } from 'react'
import { complaintApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import ComplaintMap from '../../components/map/ComplaintMap'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const LEGEND = [
  { color: '#dc2626', label: 'High / Critical' },
  { color: '#eab308', label: 'Medium' },
  { color: '#16a34a', label: 'Low' },
  { color: '#2563eb', label: 'Resolved / Closed' },
]

export default function MapView() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    complaintApi
      .map()
      .then(({ data }) => setComplaints(data.complaints))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Complaint Map</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === 'citizen' && 'All locations of issues you have reported.'}
            {user?.role === 'worker' && 'Locations of complaints assigned to you.'}
            {user?.role === 'admin' && 'All civic complaints across the city.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints to show on the map yet" />
      ) : (
        <ComplaintMap complaints={complaints} height="65vh" detailBasePath="/complaints" />
      )}
    </div>
  )
}
