const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-primary-100 text-primary-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-secondary-100 text-secondary-800'
  }

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
