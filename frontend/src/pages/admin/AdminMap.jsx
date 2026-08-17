import { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { complaintApi, analyticsApi } from '../../api/endpoints'
import ComplaintMap from '../../components/map/ComplaintMap'
import HeatmapLayer from '../../components/map/HeatmapLayer'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const DEFAULT_CENTER = [17.385, 78.4867]

const LEGEND = [
  { color: '#dc2626', label: 'High / Critical' },
  { color: '#eab308', label: 'Medium' },
  { color: '#16a34a', label: 'Low' },
  { color: '#2563eb', label: 'Resolved / Closed' },
]

export default function AdminMap() {
  const [complaints, setComplaints] = useState([])
  const [heatPoints, setHeatPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('markers')

  useEffect(() => {
    Promise.all([complaintApi.map(), analyticsApi.heatmap()])
      .then(([c, h]) => {
        setComplaints(c.data.complaints)
        setHeatPoints(h.data.points)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const center = complaints[0]?.location ? [complaints[0].location.lat, complaints[0].location.lng] : DEFAULT_CENTER

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">City Map</h1>
          <p className="mt-1 text-sm text-slate-500">All civic complaints — switch to heat map to spot problem-prone areas.</p>
        </div>
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setMode('markers')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === 'markers' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Markers
          </button>
          <button
            onClick={() => setMode('heat')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === 'heat' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Heat Map
          </button>
        </div>
      </div>

      {mode === 'markers' && (
        <div className="flex flex-wrap gap-3">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      {complaints.length === 0 ? (
        <EmptyState title="No complaints to display yet" />
      ) : mode === 'markers' ? (
        <ComplaintMap complaints={complaints} height="65vh" detailBasePath="/complaints" />
      ) : (
        <div style={{ height: '65vh' }} className="overflow-hidden rounded-2xl border border-slate-200">
          <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HeatmapLayer points={heatPoints} />
          </MapContainer>
        </div>
      )}
    </div>
  )
}
