import { useEffect, useState } from 'react'
import { userApi, departmentApi } from '../../api/endpoints'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', departmentCode: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([userApi.workers(), departmentApi.list()]).then(([w, d]) => {
      setWorkers(w.data.workers)
      setDepartments(d.data.departments)
    })
  }

  useEffect(() => {
    load()
    setLoading(false)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await userApi.createWorker(form)
      setForm({ name: '', email: '', password: '', phone: '', departmentCode: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create worker')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (w) => {
    await userApi.setStatus(w._id, !w.isActive)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Municipal Workers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage worker accounts and view their performance.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showForm ? 'Cancel' : '+ Add Worker'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          {error && <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>}
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <input required type="password" minLength={6} placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <select required value={form.departmentCode} onChange={(e) => setForm({ ...form, departmentCode: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm sm:col-span-2">
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          <button disabled={saving} type="submit" className="rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:col-span-2">
            {saving ? 'Creating…' : 'Create Worker Account'}
          </button>
        </form>
      )}

      {workers.length === 0 ? (
        <EmptyState title="No municipal workers yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers.map((w) => (
                <tr key={w._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{w.name}</p>
                    <p className="text-xs text-slate-500">{w.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{w.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{w.stats.total}</td>
                  <td className="px-4 py-3 text-emerald-600">{w.stats.completed}</td>
                  <td className="px-4 py-3 text-amber-600">{w.stats.pending}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${w.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {w.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleStatus(w)} className="text-xs font-medium text-brand-600 hover:underline">
                      {w.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
