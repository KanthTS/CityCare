import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { coloredIcon, markerColorFor } from './markerIcon'
import StatusBadge from '../ui/StatusBadge'

const DEFAULT_CENTER = [17.385, 78.4867] // fallback: Hyderabad, India

export default function ComplaintMap({ complaints = [], height = '480px', center, zoom = 12, detailBasePath }) {
  const navigate = useNavigate()

  const validComplaints = complaints.filter((c) => c.location?.lat && c.location?.lng)
  const mapCenter =
    center ||
    (validComplaints.length
      ? [validComplaints[0].location.lat, validComplaints[0].location.lng]
      : DEFAULT_CENTER)

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validComplaints.map((c) => (
          <Marker
            key={c._id}
            position={[c.location.lat, c.location.lng]}
            icon={coloredIcon(markerColorFor(c))}
          >
            <Popup>
              <div className="min-w-40 space-y-1">
                <p className="text-xs font-semibold text-slate-500">{c.complaintId}</p>
                <p className="text-sm font-medium text-slate-900">{c.issueType}</p>
                <StatusBadge status={c.status} />
                {detailBasePath && (
                  <button
                    onClick={() => navigate(`${detailBasePath}/${c._id}`)}
                    className="mt-1 block text-xs font-medium text-brand-600 hover:underline"
                  >
                    View details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
