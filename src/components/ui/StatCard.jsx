import { TrendingUp, TrendingDown } from 'lucide-react'

const StatCard = ({ title, value, change, changeType, icon: Icon, iconColor = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    secondary: 'bg-secondary-100 text-secondary-600'
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          
          {change !== undefined && (
            <div className={`stat-card-change flex items-center gap-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-secondary-500'
            }`}>
              {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[iconColor]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
