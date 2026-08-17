import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

const SEVERITY_WEIGHT = { Low: 0.4, Medium: 0.6, High: 0.85, Critical: 1 }

export default function HeatmapLayer({ points = [] }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return undefined
    const layer = L.heatLayer(
      points.map((p) => [p.lat, p.lng, SEVERITY_WEIGHT[p.severity] || 0.5]),
      { radius: 28, blur: 22, maxZoom: 17 }
    )
    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}
