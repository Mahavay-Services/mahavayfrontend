import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-900 mt-4">Page Not Found</h2>
        <p className="text-secondary-500 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
