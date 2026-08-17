export const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', to: '/citizen', icon: '🏠', end: true },
    { label: 'Report Issue', to: '/citizen/report', icon: '📷' },
    { label: 'My Complaints', to: '/citizen/complaints', icon: '📋' },
    { label: 'Map', to: '/citizen/map', icon: '🗺️' },
    { label: 'Notifications', to: '/notifications', icon: '🔔' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ],
  worker: [
    { label: 'Dashboard', to: '/worker', icon: '🏠', end: true },
    { label: 'Assigned Issues', to: '/worker/assigned', icon: '🛠️' },
    { label: 'Map', to: '/worker/map', icon: '🗺️' },
    { label: 'Completed Work', to: '/worker/completed', icon: '✅' },
    { label: 'Notifications', to: '/notifications', icon: '🔔' },
    { label: 'Profile', to: '/profile', icon: '👤' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: '🏠', end: true },
    { label: 'Complaints', to: '/admin/complaints', icon: '📋' },
    { label: 'Workers', to: '/admin/workers', icon: '🧑‍🔧' },
    { label: 'Citizens', to: '/admin/citizens', icon: '👥' },
    { label: 'Departments', to: '/admin/departments', icon: '🏛️' },
    { label: 'Map', to: '/admin/map', icon: '🗺️' },
    { label: 'Analytics', to: '/admin/analytics', icon: '📊' },
    { label: 'Settings', to: '/profile', icon: '⚙️' },
  ],
}
