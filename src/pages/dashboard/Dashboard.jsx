import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { dashboardService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  FileText, 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Scale
} from 'lucide-react'
import { ROLES } from '../../constants'

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [user?.role])

  const fetchDashboard = async () => {
    try {
      let response
      switch (user?.role) {
        case ROLES.SUPER_ADMIN:
          response = await dashboardService.getSuperAdmin()
          break
        case ROLES.SALES:
          response = await dashboardService.getSales()
          break
        case ROLES.ACCOUNTS:
          response = await dashboardService.getAccounts()
          break
        case ROLES.LEGAL:
          response = await dashboardService.getLegal()
          break
        case ROLES.OPS_MANAGER:
        case ROLES.OPS_MEMBER:
          response = await dashboardService.getOperations()
          break
        default:
          response = await dashboardService.getSales()
      }
      setData(response.data.data)
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.full_name?.split(' ')[0]}!`}
        subtitle={`Here's your ${user?.role?.replace('_', ' ')} dashboard overview`}
      />

      {user?.role === ROLES.SUPER_ADMIN && data && (
        <SuperAdminDashboard data={data} formatCurrency={formatCurrency} />
      )}

      {user?.role === ROLES.SALES && data && (
        <SalesDashboard data={data} formatCurrency={formatCurrency} />
      )}

      {user?.role === ROLES.ACCOUNTS && data && (
        <AccountsDashboard data={data} formatCurrency={formatCurrency} />
      )}

      {user?.role === ROLES.LEGAL && data && (
        <LegalDashboard data={data} />
      )}

      {(user?.role === ROLES.OPS_MANAGER || user?.role === ROLES.OPS_MEMBER) && data && (
        <OperationsDashboard data={data} />
      )}
    </div>
  )
}

const SuperAdminDashboard = ({ data, formatCurrency }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Bookings"
        value={data.overview?.totalBookings || 0}
        change={`${data.overview?.monthlyBookings || 0} this month`}
        icon={FileText}
        iconColor="primary"
      />
      <StatCard
        title="Total Collections"
        value={formatCurrency(data.overview?.totalCollections)}
        change={`${formatCurrency(data.overview?.monthlyCollections)} this month`}
        icon={IndianRupee}
        iconColor="success"
      />
      <StatCard
        title="Pending Approvals"
        value={(data.pending?.payments || 0) + (data.pending?.legal || 0)}
        change={`${data.pending?.payments || 0} payments, ${data.pending?.legal || 0} legal`}
        icon={Clock}
        iconColor="warning"
      />
      <StatCard
        title="Completed"
        value={data.overview?.completedBookings || 0}
        icon={CheckCircle}
        iconColor="success"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-secondary-900">Booking Stage Distribution</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {data.stageStats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 capitalize">
                  {stat.current_stage?.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-secondary-900">Top BDMs This Month</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {data.topBDMs?.map((bdm, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {bdm.bdm?.full_name?.charAt(0)}
                  </div>
                  <span className="text-sm text-secondary-900">{bdm.bdm?.full_name}</span>
                </div>
                <span className="font-semibold text-primary-600">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bdm.total_value || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
)

const SalesDashboard = ({ data, formatCurrency }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="My Bookings"
        value={data.overview?.totalBookings || 0}
        change={`${data.overview?.monthlyBookings || 0} this month`}
        icon={FileText}
        iconColor="primary"
      />
      <StatCard
        title="Total Value"
        value={formatCurrency(data.overview?.totalValue)}
        icon={IndianRupee}
        iconColor="success"
      />
      <StatCard
        title="Collected"
        value={formatCurrency(data.overview?.collectedAmount)}
        icon={CheckCircle}
        iconColor="success"
      />
      <StatCard
        title="Pending"
        value={formatCurrency(data.overview?.pendingAmount)}
        icon={Clock}
        iconColor="warning"
      />
    </div>

    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary-900">Recent Bookings</h3>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {data.recentBookings?.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">{booking.client_name}</p>
                <p className="text-sm text-secondary-500">{booking.booking_number}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(booking.total_amount)}</p>
                <span className="text-xs capitalize px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                  {booking.current_stage?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)

const AccountsDashboard = ({ data, formatCurrency }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Pending Verifications"
        value={data.overview?.pendingVerifications || 0}
        icon={Clock}
        iconColor="warning"
      />
      <StatCard
        title="Today's Collections"
        value={formatCurrency(data.overview?.todayCollections)}
        icon={IndianRupee}
        iconColor="success"
      />
      <StatCard
        title="Monthly Collections"
        value={formatCurrency(data.overview?.monthlyCollections)}
        icon={TrendingUp}
        iconColor="primary"
      />
      <StatCard
        title="Verified Today"
        value={data.overview?.verifiedToday || 0}
        icon={CheckCircle}
        iconColor="success"
      />
    </div>

    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary-900">Pending Payment Verifications</h3>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {data.pendingPayments?.slice(0, 5).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-secondary-900">{payment.booking?.client_name}</p>
                <p className="text-sm text-secondary-500">{payment.booking?.booking_number}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-600">{formatCurrency(payment.received_amount)}</p>
                <p className="text-xs text-secondary-500">by {payment.creator?.full_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)

const LegalDashboard = ({ data }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Pending Approvals"
        value={data.overview?.pendingApprovals || 0}
        icon={Clock}
        iconColor="warning"
      />
      <StatCard
        title="Approved This Month"
        value={data.overview?.approvedThisMonth || 0}
        icon={CheckCircle}
        iconColor="success"
      />
      <StatCard
        title="Rejected This Month"
        value={data.overview?.rejectedThisMonth || 0}
        icon={AlertTriangle}
        iconColor="danger"
      />
    </div>

    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary-900">Pending Legal Approvals</h3>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {data.pendingBookings?.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">{booking.client_name}</p>
                <p className="text-sm text-secondary-500">{booking.booking_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Awaiting Review</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)

const OperationsDashboard = ({ data }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      <StatCard
        title="Total Operations"
        value={data.overview?.totalOperations || 0}
        icon={FileText}
        iconColor="primary"
      />
      <StatCard
        title="Pending"
        value={data.overview?.pendingOperations || 0}
        icon={Clock}
        iconColor="warning"
      />
      <StatCard
        title="In Progress"
        value={data.overview?.inProgressOperations || 0}
        icon={TrendingUp}
        iconColor="primary"
      />
      <StatCard
        title="Completed"
        value={data.overview?.completedOperations || 0}
        icon={CheckCircle}
        iconColor="success"
      />
      <StatCard
        title="Overdue"
        value={data.overview?.overdueOperations || 0}
        icon={AlertTriangle}
        iconColor="danger"
      />
    </div>

    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-secondary-900">Upcoming Deadlines</h3>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {data.upcomingDeadlines?.map((op) => (
            <div key={op.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">{op.bookingService?.service?.service_name}</p>
                <p className="text-sm text-secondary-500">{op.bookingService?.booking?.booking_number} - {op.bookingService?.booking?.client_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-red-600">
                  {new Date(op.deadline).toLocaleDateString()}
                </p>
                <span className="text-xs capitalize px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                  {op.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
)

export default Dashboard
