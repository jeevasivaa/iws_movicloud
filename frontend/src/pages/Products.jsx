import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/shared/Modal'
import { useAuth } from '../context/useAuth'
import apiClient, { getErrorMessage } from '../services/apiClient'

const CATEGORY_OPTIONS = ['Cold Pressed Oils', 'Essential Oils', 'Refined Oils', 'Blended Oils', 'Other']
const STATUS_OPTIONS = ['Active', 'Low Stock', 'Out of Stock']

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: CATEGORY_OPTIONS[0],
  price: '',
  stock: '',
  status: STATUS_OPTIONS[0],
}

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=80&q=80',
  'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=80&q=80',
]

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Low Stock') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `INR ${amount.toLocaleString('en-IN')}`
}

function buildCsv(rows) {
  const header = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status']
  const body = rows.map((row) => [row.name, row.sku, row.category, row.price, row.stock, row.status])
  return [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function Products() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const authConfig = useMemo(() => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}), [token])

  const fetchProducts = useCallback(
    async (signal) => {
      if (!token) {
        setProducts([])
        setError('Authentication token missing. Please sign in again.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const response = await apiClient.get('/api/products', { ...authConfig, signal })
        setProducts(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        if (signal?.aborted) return
        setProducts([])
        setError(getErrorMessage(err, 'Failed to load products'))
      } finally {
        setIsLoading(false)
      }
    },
    [authConfig, token],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [fetchProducts])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((row) =>
      [row.name, row.sku, row.category, row.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [products, query])

  const stats = useMemo(
    () => [
      {
        title: 'Total Menu Items',
        value: products.length,
        iconWrap: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Active Products',
        value: products.filter((row) => row.status === 'Active').length,
        iconWrap: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'Low Stock Alerts',
        value: products.filter((row) => row.status === 'Low Stock').length,
        iconWrap: 'bg-amber-100 text-amber-700',
      },
      {
        title: 'Out of Stock',
        value: products.filter((row) => row.status === 'Out of Stock').length,
        iconWrap: 'bg-red-100 text-red-700',
      },
    ],
    [products],
  )

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || CATEGORY_OPTIONS[0],
      price: product.price ?? '',
      stock: product.stock ?? '',
      status: product.status || STATUS_OPTIONS[0],
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setIsModalOpen(false)
  }

  const exportCsv = () => {
    const csv = buildCsv(filteredRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-export.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct?._id) {
      toast.error('Unable to delete product')
      return
    }

    try {
      setIsDeleting(true)
      await apiClient.delete(`/api/products/${deletingProduct._id}`, authConfig)
      toast.success('Product deleted successfully')
      setDeletingProduct(null)
      fetchProducts()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete product'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      status: formData.status,
    }

    if (!payload.name || !payload.sku || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      toast.error('Please fill all required product fields')
      return
    }

    try {
      setIsSaving(true)
      if (editingProduct?._id) {
        await apiClient.put(`/api/products/${editingProduct._id}`, payload, authConfig)
        toast.success('Product updated successfully')
      } else {
        await apiClient.post('/api/products', payload, authConfig)
        toast.success('Product added successfully')
      }

      closeModal()
      fetchProducts()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save product'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Products Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage menu catalog, pricing, and stock posture from one workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Upload size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="rounded-md border border-red-200 bg-white px-3 py-1 font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search menu items, SKUs..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Item Image</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Item Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Selling Price</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Stock Level</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={7}>
                  Loading products...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={7}>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={row._id || row.sku} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <img
                      src={IMAGE_POOL[index % IMAGE_POOL.length]}
                      alt={row.name || 'Food item'}
                      className="h-11 w-11 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{row.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(row.price)}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{Number(row.stock || 0)} portions</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Edit ${row.name}`}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(row)}
                        className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        aria-label={`Delete ${row.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={Boolean(deletingProduct)}
        title="Delete Product"
        description="This permanently removes the selected item."
        onClose={() => setDeletingProduct(null)}
      >
        <div className="space-y-4">
          <div className="modal-panel border-red-200 bg-red-50 text-sm text-red-700">
            You are about to delete <span className="font-semibold">{deletingProduct?.name || 'this product'}</span>.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setDeletingProduct(null)} className="modal-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleDeleteProduct} disabled={isDeleting} className="modal-btn-danger">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        description="Manage menu item details and stock status."
        onClose={closeModal}
      >
        <form onSubmit={handleSaveProduct} className="space-y-5">
          <div className="modal-shell space-y-4">
            <div className="space-y-2">
              <label htmlFor="product-name" className="modal-label">
                Item Name
              </label>
              <input
                id="product-name"
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-sku" className="modal-label">
                SKU
              </label>
              <input
                id="product-sku"
                type="text"
                value={formData.sku}
                onChange={(event) => handleChange('sku', event.target.value)}
                className="modal-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-category" className="modal-label">
                Category
              </label>
              <select
                id="product-category"
                value={formData.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="modal-input"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="product-price" className="modal-label">
                  Selling Price
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => handleChange('price', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-stock" className="modal-label">
                  Stock Level
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(event) => handleChange('stock', event.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-status" className="modal-label">
                Status
              </label>
              <select
                id="product-status"
                value={formData.status}
                onChange={(event) => handleChange('status', event.target.value)}
                className="modal-input"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={closeModal} className="modal-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="modal-btn-primary">
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Products
