import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

import CitizenDashboard from './pages/citizen/CitizenDashboard'
import ReportIssue from './pages/citizen/ReportIssue'
import MyComplaints from './pages/citizen/MyComplaints'

import WorkerDashboard from './pages/worker/WorkerDashboard'
import AssignedIssues from './pages/worker/AssignedIssues'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminWorkers from './pages/admin/AdminWorkers'
import AdminCitizens from './pages/admin/AdminCitizens'
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminMap from './pages/admin/AdminMap'

import MapView from './pages/shared/MapView'
import Notifications from './pages/shared/Notifications'
import Profile from './pages/shared/Profile'
import ComplaintDetail from './pages/shared/ComplaintDetail'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={`/${user.role}`} replace />
  return <Landing />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />

        <Route
          path="/citizen"
          element={
            <ProtectedRoute roles={['citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute roles={['citizen']}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints"
          element={
            <ProtectedRoute roles={['citizen']}>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/map"
          element={
            <ProtectedRoute roles={['citizen']}>
              <MapView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worker"
          element={
            <ProtectedRoute roles={['worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/assigned"
          element={
            <ProtectedRoute roles={['worker']}>
              <AssignedIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/completed"
          element={
            <ProtectedRoute roles={['worker']}>
              <AssignedIssues onlyCompleted />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/map"
          element={
            <ProtectedRoute roles={['worker']}>
              <MapView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workers"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminWorkers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/citizens"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminCitizens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/map"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
