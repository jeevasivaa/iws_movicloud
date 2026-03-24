import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useAuth } from '../context/useAuth'
import { apiGet, getErrorMessage } from '../services/apiClient'

const SALES_DATA = [
  { name: 'Jan', value: 42000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 55000 },
  { name: 'Apr', value: 47000 },
  { name: 'May', value: 62000 },
  { name: 'Jun', value: 58000 },
]

const PRODUCTION_DATA = [
  { name: 'Mon', value: 120 },
  { name: 'Tue', value: 145 },
  { name: 'Wed', value: 133 },
  { name: 'Thu', value: 162 },
  { name: 'Fri', value: 142 },
  { name: 'Sat', value: 95 },
]

const REPORT_CARDS = [
  {
    title: 'Inventory Report',
    subtitle: 'Stock levels, movement logs, expiry tracking',
  },
  {
    title: 'Supplier Performance',
    subtitle: 'Ratings, delivery times, order history',
  },
  {
    title: 'Payroll Summary',
    subtitle: 'Salary disbursements, tax deductions',
  },
]

function ExecutiveAnalyticsDashboard() {
  const { token } = useAuth()

  const downloadTextFile = (filename, content, mimeType = 'text/plain;charset=utf-8;') => {
    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  }

  const toCsv = (rows) =>
    rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')

  const handleExportAll = () => {
    const salesRows = SALES_DATA.map((row) => [row.name, row.value])
    const efficiencyRows = PRODUCTION_DATA.map((row) => [row.name, row.value])
    const reportRows = REPORT_CARDS.map((card) => [card.title, card.subtitle])

    const csv = toCsv([
      ['Report', 'Metric', 'Value'],
      ...salesRows.map(([month, sales]) => ['Sales Report', month, sales]),
      ...efficiencyRows.map(([month, efficiency]) => ['Production Efficiency', month, efficiency]),
      ...reportRows.map(([title, subtitle]) => [title, 'Summary', subtitle]),
    ])

    downloadTextFile('executive-analytics-report.csv', csv, 'text/csv;charset=utf-8;')
  }

  const addWrappedText = (pdf, text, x, y, width, lineHeight = 18) => {
    const lines = pdf.splitTextToSize(String(text || ''), width)
    pdf.text(lines, x, y)
    return y + (lines.length * lineHeight)
  }

  const ensurePageSpace = (pdf, y, requiredHeight = 24) => {
    if (y + requiredHeight > 780) {
      pdf.addPage()
      return 60
    }
    return y
  }

  const drawTableHeader = (pdf, y, columns) => {
    let cursorX = 40
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    columns.forEach((col) => {
      pdf.text(col.label, cursorX, y)
      cursorX += col.width
    })
    pdf.setDrawColor(220, 220, 220)
    pdf.line(40, y + 8, 555, y + 8)
    return y + 24
  }

  const drawTableRows = (pdf, y, columns, rows) => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)

    rows.forEach((row) => {
      let cursorX = 40
      y = ensurePageSpace(pdf, y, 20)
      columns.forEach((col) => {
        const value = row[col.key]
        const text = value === null || value === undefined ? '-' : String(value)
        pdf.text(text, cursorX, y)
        cursorX += col.width
      })
      y += 18
    })

    return y
  }

  const buildInventoryRows = async () => {
    const items = await apiGet('/api/inventory', token)
    return (Array.isArray(items) ? items : []).slice(0, 20).map((item) => ({
      item_name: item.item_name,
      current_stock: item.current_stock,
      max_capacity: item.max_capacity,
      status: item.status,
    }))
  }

  const buildSupplierRows = async () => {
    const suppliers = await apiGet('/api/suppliers', token)
    return (Array.isArray(suppliers) ? suppliers : []).slice(0, 20).map((supplier) => ({
      name: supplier.name,
      location: supplier.location,
      rating: supplier.rating,
      total_orders: supplier.total_orders,
      status: supplier.status,
    }))
  }

  const buildPayrollRows = async () => {
    const payrollRows = await apiGet('/api/payroll', token)
    return (Array.isArray(payrollRows) ? payrollRows : []).slice(0, 20).map((row) => ({
      month: row.month,
      net_pay: Number(row.net_pay || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      deductions: Number(row.deductions || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      status: row.status,
    }))
  }

  const handleExportPDF = async (reportCard) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const reportName = reportCard.title
    const reportSummary = reportCard.subtitle
    const exportedAt = new Date().toLocaleString()
    let y = 60

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text(reportName, 40, y)
    y += 28

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text('Executive Analytics Dashboard', 40, y)
    y += 20
    pdf.text(`Exported: ${exportedAt}`, 40, y)
    y += 16

    pdf.setDrawColor(220, 220, 220)
    pdf.line(40, y + 8, 555, y + 8)
    y += 38

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.text('Summary', 40, y)
    y += 22

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    y = addWrappedText(pdf, reportSummary, 40, y, 500, 18)
    y += 18

    try {
      let rows = []
      let columns = []

      if (reportName === 'Inventory Report') {
        columns = [
          { key: 'item_name', label: 'Item', width: 160 },
          { key: 'current_stock', label: 'Current', width: 90 },
          { key: 'max_capacity', label: 'Capacity', width: 90 },
          { key: 'status', label: 'Status', width: 90 },
        ]
        rows = await buildInventoryRows()
      } else if (reportName === 'Supplier Performance') {
        columns = [
          { key: 'name', label: 'Supplier', width: 140 },
          { key: 'location', label: 'Location', width: 110 },
          { key: 'rating', label: 'Rating', width: 60 },
          { key: 'total_orders', label: 'Orders', width: 70 },
          { key: 'status', label: 'Status', width: 90 },
        ]
        rows = await buildSupplierRows()
      } else if (reportName === 'Payroll Summary') {
        columns = [
          { key: 'month', label: 'Month', width: 120 },
          { key: 'net_pay', label: 'Net Pay', width: 140 },
          { key: 'deductions', label: 'Deductions', width: 140 },
          { key: 'status', label: 'Status', width: 90 },
        ]
        rows = await buildPayrollRows()
      }

      y = ensurePageSpace(pdf, y, 50)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.text('Data', 40, y)
      y += 22

      if (!rows.length) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.text('No rows available for this report.', 40, y)
      } else {
        y = drawTableHeader(pdf, y, columns)
        drawTableRows(pdf, y, columns, rows)
      }
    } catch (error) {
      y = ensurePageSpace(pdf, y, 40)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Data', 40, y)
      y += 20
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Unable to load report rows: ${getErrorMessage(error, 'Request failed')}`, 40, y)
    }

    const safeFileName = reportName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    pdf.save(`${safeFileName || 'report'}.pdf`)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-base text-gray-500">Generate and export business reports</p>
        </div>

        <button
          type="button"
          onClick={handleExportAll}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download size={17} />
          Export All
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-5xl leading-none font-semibold text-slate-800">Monthly Sales</h2>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  domain={[0, 80000]}
                  ticks={[0, 20000, 40000, 60000, 80000]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" fill="#43a979" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-5xl leading-none font-semibold text-slate-800">Production Output</h2>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTION_DATA}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={false}
                  domain={[0, 160]}
                  ticks={[0, 40, 80, 120, 160]}
                  tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3f7fc3"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#3f7fc3' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {REPORT_CARDS.map((card) => (
          <article key={card.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>

            <button
              type="button"
              onClick={() => handleExportPDF(card)}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download size={16} />
              Export PDF
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExecutiveAnalyticsDashboard
