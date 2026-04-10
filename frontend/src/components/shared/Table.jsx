function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Table({ minWidth = 980, className = '', children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className={joinClasses('w-full text-left', className)} style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }) {
  return <thead className="bg-slate-50">{children}</thead>
}

export function TableHeaderCell({ className = '', children }) {
  return (
    <th className={joinClasses('px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500', className)}>
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ className = '', children }) {
  return <tr className={joinClasses('border-t border-slate-100', className)}>{children}</tr>
}

export function TableCell({ className = '', children, colSpan }) {
  return (
    <td className={joinClasses('px-6 py-4 text-sm text-slate-700', className)} colSpan={colSpan}>
      {children}
    </td>
  )
}

export default Table
