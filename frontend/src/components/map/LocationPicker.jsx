import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { coloredIcon } from './markerIcon'

const DEFAULT_CENTER = [17.385, 78.4867]

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  const captureLocation = () => {
    setError('')
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        setError(err.message || 'Unable to fetch your location. You can click the map to set it manually.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const center = value ? [value.lat, value.lng] : DEFAULT_CENTER

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={captureLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          📍 {locating ? 'Locating…' : 'Capture Current Location'}
        </button>
        {value && (
          <span className="text-xs text-slate-500">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
      {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}
      <div style={{ height: '280px' }} className="overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={center} zoom={value ? 16 : 12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={onChange} />
          {value && <Marker position={[value.lat, value.lng]} icon={coloredIcon('#2563eb')} />}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-slate-400">Tip: you can also click anywhere on the map to fine-tune the pin.</p>
    </div>
  )
}
