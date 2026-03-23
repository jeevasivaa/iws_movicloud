import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit, Eye, Package2, Plus, Search, Trash2 } from 'lucide-react'
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

function getStatusClasses(status) {
  if (status === 'Active') return 'bg-green-100 text-green-700'
  if (status === 'Low Stock') return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN')}`
}

function formatDate(value) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Products() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const isModalOpen = isAddModalOpen || Boolean(editingProduct)
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
        if (signal?.aborted) {
          return
        }
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

    return () => {
      controller.abort()
    }
  }, [fetchProducts])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.sku, product.category, product.status].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [query, products])

  const closeModal = () => {
    setIsAddModalOpen(false)
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
  }

  const openDeleteWarning = (product) => {
    setDeletingProduct(product)
  }

  const closeDeleteWarning = () => {
    setDeletingProduct(null)
  }

  const openAddModal = () => {
    setViewingProduct(null)
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setIsAddModalOpen(true)
  }

  const openEditModal = (product) => {
    setViewingProduct(null)
    setIsAddModalOpen(false)
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || CATEGORY_OPTIONS[0],
      price: product.price ?? '',
      stock: product.stock ?? '',
      status: product.status || STATUS_OPTIONS[0],
    })
  }

  const openViewModal = (product) => {
    setIsAddModalOpen(false)
    setEditingProduct(null)
    setViewingProduct(product)
  }

  const closeViewModal = () => {
    setViewingProduct(null)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleDeleteProduct = async (product) => {
    if (!product?._id) {
      toast.error('Unable to delete product')
      return
    }

    try {
      setIsDeleting(true)
      await apiClient.delete(`/api/products/${product._id}`, authConfig)
      toast.success('Product deleted successfully')
      closeDeleteWarning()
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

    if (!payload.name || !payload.sku || !payload.category || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-base text-gray-500">Manage your product catalogue and inventory</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus size={16} />
          Add Product
        </button>
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

      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-emerald-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Product</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">SKU</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Category</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Price (₹)</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Stock</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={7}>
                  Loading products...
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
              <tr key={row._id || row.sku} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100">
                      <Package2 size={15} className="text-emerald-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{row.name}</span>
                  </div>
                </td>

                <td className="px-6 py-5 text-sm text-gray-500">{row.sku}</td>
                <td className="px-6 py-5 text-sm text-gray-900">{row.category}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-900">{formatCurrency(row.price)}</td>
                <td className="px-6 py-5 text-sm text-gray-900">{(Number(row.stock) || 0).toLocaleString('en-IN')}</td>

                <td className="px-6 py-5">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openViewModal(row)}
                      className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                      aria-label={`View ${row.name}`}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(row)}
                      className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      aria-label={`Edit ${row.name}`}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteWarning(row)}
                      className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No products found for this search.</div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(deletingProduct)}
        title="Warning: Delete Product"
        onClose={closeDeleteWarning}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            You are about to delete{' '}
            <span className="font-semibold">{deletingProduct?.name || 'this product'}</span>.
            {' '}This action cannot be undone.
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDeleteWarning}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteProduct(deletingProduct)}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(viewingProduct)}
        title="Product Properties"
        onClose={closeViewModal}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-sm text-emerald-800">{viewingProduct?.name || 'Product'}</p>
            <p className="mt-1 text-lg font-semibold text-emerald-900">{viewingProduct?.sku || 'N/A'}</p>
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Category</dt>
              <dd className="mt-1 font-medium text-gray-900">{viewingProduct?.category || 'N/A'}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Price</dt>
              <dd className="mt-1 font-medium text-gray-900">{formatCurrency(viewingProduct?.price)}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Current Stock</dt>
              <dd className="mt-1 font-medium text-gray-900">{(Number(viewingProduct?.stock) || 0).toLocaleString('en-IN')}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(viewingProduct?.status)}`}>
                  {viewingProduct?.status || 'N/A'}
                </span>
              </dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3 sm:col-span-2">
              <dt className="text-gray-500">Product ID</dt>
              <dd className="mt-1 break-all font-medium text-gray-900">{viewingProduct?._id || 'N/A'}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Created</dt>
              <dd className="mt-1 font-medium text-gray-900">{formatDate(viewingProduct?.created_at)}</dd>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="mt-1 font-medium text-gray-900">{formatDate(viewingProduct?.updated_at)}</dd>
            </div>
          </dl>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={closeViewModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onClose={closeModal}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="product-name" className="text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-sku" className="text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              id="product-sku"
              type="text"
              value={formData.sku}
              onChange={(event) => handleChange('sku', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-category" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="product-category"
              value={formData.category}
              onChange={(event) => handleChange('category', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              <label htmlFor="product-price" className="text-sm font-medium text-gray-700">
                Price (₹)
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(event) => handleChange('price', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-stock" className="text-sm font-medium text-gray-700">
                Current Stock
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) => handleChange('stock', event.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="product-status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="product-status"
              value={formData.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default Products
