import api from './client'

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
}

// AI
export const aiApi = {
  analyze: (formData) =>
    api.post('/ai/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// Complaints
export const complaintApi = {
  create: (data) => api.post('/complaints', data),
  mine: () => api.get('/complaints/mine'),
  assigned: () => api.get('/complaints/assigned'),
  all: (params) => api.get('/complaints', { params }),
  map: () => api.get('/complaints/map'),
  citizenStats: () => api.get('/complaints/stats/citizen'),
  workerStats: () => api.get('/complaints/stats/worker'),
  getById: (id) => api.get(`/complaints/${id}`),
  verify: (id) => api.put(`/complaints/${id}/verify`),
  assign: (id, workerId) => api.put(`/complaints/${id}/assign`, { workerId }),
  updatePriority: (id, data) => api.put(`/complaints/${id}/priority`, data),
  accept: (id) => api.put(`/complaints/${id}/accept`),
  start: (id) => api.put(`/complaints/${id}/start`),
  uploadPhoto: (id, type, formData) =>
    api.put(`/complaints/${id}/photo/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  resolve: (id) => api.put(`/complaints/${id}/resolve`),
  verifyResolution: (id, resolved) => api.put(`/complaints/${id}/verify-resolution`, { resolved }),
}

// Users (admin)
export const userApi = {
  citizens: () => api.get('/users/citizens'),
  workers: () => api.get('/users/workers'),
  createWorker: (data) => api.post('/users/workers', data),
  setStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  remove: (id) => api.delete(`/users/${id}`),
}

// Departments
export const departmentApi = {
  list: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id) => api.delete(`/departments/${id}`),
}

// Notifications
export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Analytics
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  breakdown: () => api.get('/analytics/breakdown'),
  performance: () => api.get('/analytics/performance'),
  heatmap: () => api.get('/analytics/heatmap'),
}
