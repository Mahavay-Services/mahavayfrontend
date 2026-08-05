import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  return (
    <div className="page-header">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-secondary-500 mb-2">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {item.href ? (
                <Link to={item.href} className="hover:text-primary-600">
                  {item.label}
                </Link>
              ) : (
                <span className="text-secondary-900">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
