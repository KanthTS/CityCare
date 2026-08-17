import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { complaintApi, userApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import ComplaintMap from '../../components/map/ComplaintMap'
import StatusBadge from '../../components/ui/StatusBadge'
import PriorityBadge from '../../components/ui/PriorityBadge'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/format'

const LIFECYCLE = [
  { key: 'reported', label: 'Reported' },
  { key: 'verified', label: 'Verification' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Worker Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
]

function LifecycleTracker({ status }) {
  const activeIndex = status === 'reopened' ? 2 : LIFECYCLE.findIndex((s) => s.key === status)
  return (
    <div className="flex items-center overflow-x-auto pb-2">
      {LIFECYCLE.map((s, i) => (
        <div key={s.key} className="flex flex-shrink-0 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= activeIndex ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {i < activeIndex ? '✓' : i + 1}
            </div>
            <span className={`w-20 text-center text-[11px] font-medium ${i <= activeIndex ? 'text-slate-800' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < LIFECYCLE.length - 1 && (
            <div className={`mx-1 h-0.5 w-8 sm:w-14 ${i < activeIndex ? 'bg-brand-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState('')
  const beforeInputRef = useRef(null)
  const afterInputRef = useRef(null)

  const load = () => {
    complaintApi
      .getById(id)
      .then(({ data }) => setComplaint(data.complaint))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load complaint'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (user?.role === 'admin') {
      userApi.workers().then(({ data }) => setWorkers(data.workers)).catch(() => {})
    }
  }, [user])

  const runAction = async (fn) => {
    setActionLoading(true)
    setError('')
    try {
      const { data } = await fn()
      setComplaint(data.complaint)
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const uploadPhoto = async (type, file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    await runAction(() => complaintApi.uploadPhoto(id, type, formData))
  }

  if (loading) return <Spinner />
  if (!complaint) return <p className="text-sm text-rose-600">{error || 'Complaint not found'}</p>

  const isOwnWorkerTask = user?.role === 'worker' && String(complaint.worker?._id) === String(user._id)
  const isAffectedCitizen =
    user?.role === 'citizen' && complaint.affectedCitizens?.some((a) => String(a.citizen?._id || a.citizen) === String(user._id))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{complaint.issueType}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{complaint.complaintId} · Reported {formatDate(complaint.createdAt)}</p>
        </div>
        <PriorityBadge priority={complaint.priority} />
      </div>

      {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{error}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <LifecycleTracker status={complaint.status} />
        {complaint.status === 'reopened' && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            ⚠️ Citizen reported this is not actually resolved — reopened for the municipal team.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Photo</h3>
            <img src={complaint.image} alt="issue" className="mt-2 h-56 w-full rounded-xl object-cover" />
          </div>
          {(complaint.beforeImage || complaint.afterImage) && (
            <div className="grid grid-cols-2 gap-3">
              {complaint.beforeImage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Before</p>
                  <img src={complaint.beforeImage} alt="before" className="mt-1 h-28 w-full rounded-lg object-cover" />
                </div>
              )}
              {complaint.afterImage && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">After</p>
                  <img src={complaint.afterImage} alt="after" className="mt-1 h-28 w-full rounded-lg object-cover" />
                </div>
              )}
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            <p className="mt-1 text-sm text-slate-600">{complaint.description || 'No description provided.'}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-medium text-slate-800">{complaint.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="font-medium text-slate-800">{complaint.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reported By</p>
                <p className="font-medium text-slate-800">{complaint.citizen?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Assigned Worker</p>
                <p className="font-medium text-slate-800">{complaint.worker?.name || 'Not yet assigned'}</p>
              </div>
              {complaint.affectedCitizens?.length > 1 && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Affected Citizens</p>
                  <p className="font-medium text-slate-800">
                    {complaint.affectedCitizens.length} citizens tracking this issue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Location</h3>
            <p className="mb-2 text-xs text-slate-500">{complaint.location?.address || 'No address provided'}</p>
            <ComplaintMap complaints={[complaint]} height="220px" zoom={16} />
            <a
              href={`https://www.openstreetmap.org/directions?to=${complaint.location.lat}%2C${complaint.location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              🧭 Navigate to location
            </a>
          </div>

          {complaint.aiAnalysis?.detectedIssue && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">🤖 AI Analysis</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Severity</p>
                  <PriorityBadge priority={complaint.aiAnalysis.severity} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">AI Confidence</p>
                  <p className="font-medium text-slate-800">{complaint.aiAnalysis.confidence}%</p>
                </div>
              </div>
              {complaint.selfFixAttempted && (
                <p className="mt-3 text-xs text-slate-500">Citizen attempted a self-fix before escalating this complaint.</p>
              )}
            </div>
          )}

          {/* ADMIN ACTIONS */}
          {user?.role === 'admin' && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Admin Actions</h3>
              {complaint.status === 'reported' && (
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(() => complaintApi.verify(id))}
                  className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  Verify Complaint
                </button>
              )}
              {['verified', 'reported', 'reopened'].includes(complaint.status) && (() => {
                const inDept = workers.filter(
                  (w) => !complaint.department || String(w.department?._id) === String(complaint.department?._id)
                )
                const options = inDept.length > 0 ? inDept : workers
                return (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <select
                        value={selectedWorker}
                        onChange={(e) => setSelectedWorker(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                      >
                        <option value="">Select worker to assign…</option>
                        {options.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name} ({w.department?.name || 'no dept'}) · {w.stats.pending} pending
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!selectedWorker || actionLoading}
                        onClick={() => runAction(() => complaintApi.assign(id, selectedWorker))}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                      >
                        Assign
                      </button>
                    </div>
                    {inDept.length === 0 && workers.length > 0 && (
                      <p className="text-xs text-amber-600">
                        No worker is registered in {complaint.department?.name || 'this department'} yet — showing all workers instead.
                      </p>
                    )}
                    {workers.length === 0 && (
                      <p className="text-xs text-rose-600">
                        No municipal workers exist yet. Add one under Admin → Workers first.
                      </p>
                    )}
                  </div>
                )
              })()}
              <div className="flex gap-2">
                <select
                  defaultValue={complaint.priority}
                  onChange={(e) => runAction(() => complaintApi.updatePriority(id, { priority: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                >
                  {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                    <option key={p} value={p}>
                      Priority: {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* WORKER ACTIONS */}
          {isOwnWorkerTask && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Worker Actions</h3>
              {complaint.status === 'assigned' && (
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(() => complaintApi.accept(id))}
                  className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  Accept Complaint
                </button>
              )}
              {complaint.status === 'accepted' && (
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(() => complaintApi.start(id))}
                  className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  Start Work
                </button>
              )}
              {['accepted', 'in_progress'].includes(complaint.status) && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => beforeInputRef.current?.click()}
                    className="rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Upload Before Photo
                  </button>
                  <button
                    onClick={() => afterInputRef.current?.click()}
                    disabled={complaint.status !== 'in_progress'}
                    className="rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Upload After Photo
                  </button>
                  <input
                    ref={beforeInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => uploadPhoto('before', e.target.files[0])}
                  />
                  <input
                    ref={afterInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => uploadPhoto('after', e.target.files[0])}
                  />
                </div>
              )}
              {complaint.status === 'in_progress' && (
                <button
                  disabled={actionLoading || !complaint.afterImage}
                  onClick={() => runAction(() => complaintApi.resolve(id))}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  title={!complaint.afterImage ? 'Upload an after photo first' : ''}
                >
                  Mark Resolved
                </button>
              )}
            </div>
          )}

          {/* CITIZEN VERIFICATION */}
          {isAffectedCitizen && complaint.status === 'resolved' && (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold text-amber-900">Has this issue been fixed?</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(() => complaintApi.verifyResolution(id, true))}
                  className="rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Yes, Resolved
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(() => complaintApi.verifyResolution(id, false))}
                  className="rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  No, Still Exists
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Complaint History</h3>
        <div className="space-y-3">
          {[...complaint.history].reverse().map((h, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-brand-600" />
                {i < complaint.history.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-3">
                <p className="text-slate-800">{h.note}</p>
                <p className="text-xs text-slate-400">{formatDate(h.timestamp)} · {h.actorRole}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
