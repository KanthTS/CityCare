import { useEffect, useState } from 'react'
import { departmentApi } from '../../api/endpoints'
import Spinner from '../../components/ui/Spinner'

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '', categories: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => departmentApi.list().then(({ data }) => setDepartments(data.departments))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await departmentApi.create({
        ...form,
        categories: form.categories.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setForm({ name: '', code: '', description: '', categories: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await departmentApi.remove(id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Departments</h1>
          <p className="mt-1 text-sm text-slate-500">Municipal departments that complaints are routed to.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          {error && <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>}
          <input required placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <input required placeholder="Code (e.g. ROAD)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm" />
          <input placeholder="Categories (comma separated)" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm sm:col-span-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm sm:col-span-2" />
          <button disabled={saving} type="submit" className="rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:col-span-2">
            {saving ? 'Creating…' : 'Create Department'}
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <div key={d._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{d.code}</span>
              </div>
              <button onClick={() => handleDelete(d._id)} className="text-xs font-medium text-rose-500 hover:underline">
                Remove
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{d.description}</p>
            {d.categories?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.categories.map((c) => (
                  <span key={c} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
