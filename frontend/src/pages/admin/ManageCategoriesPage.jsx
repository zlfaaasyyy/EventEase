import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { categoriesAPI } from '../../services/api'

const MOCK_CATEGORIES = [
  { category_id: 1, category_name: 'Conference', description: 'Large-scale professional conferences', event_count: 12 },
  { category_id: 2, category_name: 'Workshop', description: 'Hands-on skill-building sessions', event_count: 8 },
  { category_id: 3, category_name: 'Seminar', description: 'Educational presentations and talks', event_count: 15 },
  { category_id: 4, category_name: 'Webinar', description: 'Online live sessions', event_count: 20 },
  { category_id: 5, category_name: 'Training', description: 'Structured learning programs', event_count: 6 },
]

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ category_name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => setCategories(MOCK_CATEGORIES))
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ category_name: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditTarget(cat)
    setForm({ category_name: cat.category_name, description: cat.description || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editTarget) {
        await categoriesAPI.update(editTarget.category_id, form)
        setCategories((prev) =>
          prev.map((c) => c.category_id === editTarget.category_id ? { ...c, ...form } : c)
        )
      } else {
        const res = await categoriesAPI.create(form)
        setCategories((prev) => [...prev, res.data])
      }
      setShowForm(false)
    } catch {
      // optimistic update for demo
      if (editTarget) {
        setCategories((prev) =>
          prev.map((c) => c.category_id === editTarget.category_id ? { ...c, ...form } : c)
        )
      } else {
        setCategories((prev) => [
          ...prev,
          { category_id: Date.now(), ...form, event_count: 0 },
        ])
      }
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id)
    } catch {}
    setCategories((prev) => prev.filter((c) => c.category_id !== id))
    setDeleteConfirm(null)
  }

  return (
    <DashboardLayout title="Manage Categories">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-xl">
          <p className="text-body-md text-on-surface-variant">
            Manage event categories. Total: <span className="font-bold text-on-surface">{categories.length}</span> categories.
          </p>
          <button
            onClick={openCreate}
            className="bg-primary text-on-primary px-lg py-2 rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add Category
          </button>
        </div>

        {/* Form card */}
        {showForm && (
          <div className="bg-surface rounded-xl border border-primary-container shadow-sm p-lg mb-xl">
            <h3 className="text-title-lg font-bold text-on-surface mb-lg">
              {editTarget ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Category Name *</label>
                <input
                  required
                  placeholder="e.g., Conference"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of this category..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-md py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md resize-none"
                />
              </div>
              <div className="flex gap-md">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-xl py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm disabled:opacity-60"
                >
                  {loading
                    ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                    : <span className="material-symbols-outlined text-[16px]">save</span>
                  }
                  {editTarget ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-xl py-2 border border-outline-variant text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories list */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant">
            <h2 className="text-title-lg font-bold text-on-surface">All Categories</h2>
          </div>
          <div className="divide-y divide-outline-variant">
            {categories.map((cat) => (
              <div key={cat.category_id} className="flex items-center justify-between px-lg py-md hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                  </div>
                  <div>
                    <p className="text-body-md font-bold text-on-surface">{cat.category_name}</p>
                    {cat.description && <p className="text-label-md text-on-surface-variant">{cat.description}</p>}
                    <p className="text-label-sm text-outline mt-xs">
                      {cat.event_count ?? 0} events
                    </p>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat)}
                    className="p-2 rounded-lg hover:bg-error-container transition-all text-error"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-xl">
                <span className="material-symbols-outlined text-[48px] text-outline">category</span>
                <p className="text-body-md text-on-surface-variant mt-md">Belum ada kategori. Tambahkan sekarang!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-on-background/40 flex items-center justify-center z-50 p-md backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl border border-outline-variant p-xl max-w-sm w-full">
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">Delete Category</h3>
                <p className="text-body-md text-on-surface-variant">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-body-md text-on-surface mb-xl">
              Are you sure you want to delete <span className="font-bold">"{deleteConfirm.category_name}"</span>?
            </p>
            <div className="flex gap-md">
              <button
                onClick={() => handleDelete(deleteConfirm.category_id)}
                className="flex-1 py-2 bg-error text-on-error rounded-lg font-bold text-label-md hover:opacity-90 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}