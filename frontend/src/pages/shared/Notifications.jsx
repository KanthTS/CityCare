import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationApi } from '../../api/endpoints'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { timeAgo } from '../../utils/format'

const TYPE_STYLES = {
  info: { icon: 'ℹ️', bg: 'bg-sky-50' },
  success: { icon: '✅', bg: 'bg-emerald-50' },
  warning: { icon: '⚠️', bg: 'bg-amber-50' },
  critical: { icon: '🚨', bg: 'bg-rose-50' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi
      .list()
      .then(({ data }) => setNotifications(data.notifications))
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleClick = async (n) => {
    if (!n.read) {
      await notificationApi.markRead(n._id)
      setNotifications((prev) => prev.map((p) => (p._id === n._id ? { ...p, read: true } : p)))
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-sm font-medium text-brand-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="New updates about your complaints will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info
            const content = (
              <div
                className={`flex gap-3 rounded-2xl border p-4 transition-colors ${
                  n.read ? 'border-slate-200 bg-white' : `border-slate-200 ${style.bg}`
                }`}
              >
                <span className="text-lg">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />}
              </div>
            )
            return n.relatedComplaint ? (
              <Link key={n._id} to={`/complaints/${n.relatedComplaint}`} onClick={() => handleClick(n)}>
                {content}
              </Link>
            ) : (
              <div key={n._id} onClick={() => handleClick(n)}>
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
