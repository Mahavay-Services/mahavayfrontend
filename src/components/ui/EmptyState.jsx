import { FolderOpen } from 'lucide-react'

const EmptyState = ({ 
  icon: Icon = FolderOpen, 
  title = 'No data found', 
  description, 
  action 
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-secondary-400" />
      <h3 className="mt-4 text-lg font-medium text-secondary-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-secondary-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
