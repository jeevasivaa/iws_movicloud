function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Card({ as: Component = 'article', className = '', children, ...props }) {
  return (
    <Component
      className={joinClasses('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={joinClasses('p-5', className)}>{children}</div>
}

export default Card
