/**
 * Mock Order Service
 * Simulates async API calls for orders management.
 */

const MOCK_ORDERS = [
  {
    id: '#ORD-2023-0891',
    clientName: 'Apex Retail Group',
    clientLocation: 'New York, US',
    status: 'New',
    statusColor: 'blue',
    amount: '$12,450.00',
    sparklineData: [10, 15, 8, 12, 20, 18, 25],
    sparklineColor: '#0ea5e9',
  },
  {
    id: '#ORD-2023-0888',
    clientName: 'Refresh Market',
    clientLocation: 'London, UK',
    status: 'Processing',
    statusColor: 'amber',
    amount: '$8,210.50',
    sparklineData: [5, 12, 10, 30, 25, 35, 32],
    sparklineColor: '#f59e0b',
  },
  {
    id: '#ORD-2023-0875',
    clientName: 'Main Street Bev',
    clientLocation: 'Toronto, CA',
    status: 'Dispatched',
    statusColor: 'purple',
    amount: '$4,500.00',
    sparklineData: [40, 38, 35, 20, 15, 10, 5],
    sparklineColor: '#a855f7',
  },
  {
    id: '#ORD-2023-0866',
    clientName: 'Westside Distribution',
    clientLocation: 'Los Angeles, US',
    status: 'Delivered',
    statusColor: 'emerald',
    amount: '$18,900.20',
    sparklineData: [2, 5, 8, 12, 18, 25, 40],
    sparklineColor: '#10b981',
  },
]

const STATUS_COUNTS = {
  New: 12,
  Processing: 8,
  Dispatched: 15,
  Delivered: 45,
}

/**
 * Fetches orders, optionally filtered by status.
 * @param {string|null} statusFilter
 * @returns {Promise<object>}
 */
export const getOrders = (statusFilter = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = statusFilter
        ? MOCK_ORDERS.filter((o) => o.status === statusFilter)
        : MOCK_ORDERS
      resolve({ success: true, orders, statusCounts: STATUS_COUNTS, total: 80 })
    }, 300)
  })
}

/**
 * Creates a new order.
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createOrder = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, order: { id: '#ORD-2023-0900', ...data } })
    }, 500)
  })
}
