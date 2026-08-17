import L from 'leaflet'
import { MAP_MARKER_COLORS } from '../../utils/format'

export function markerColorFor(complaint) {
  if (['resolved', 'closed'].includes(complaint.status)) return MAP_MARKER_COLORS.resolved
  return MAP_MARKER_COLORS[complaint.severity] || MAP_MARKER_COLORS[complaint.priority] || '#64748b'
}

export function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 20px; height: 20px; border-radius: 9999px; background:${color};
      border: 3px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  })
}
