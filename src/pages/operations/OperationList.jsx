import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { operationService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Eye, Clock, AlertTriangle } from 'lucide-react'
import { OPERATION_STATUS_LABELS } from '../../constants'
import toast from 'react-hot-toast'

const statusVariant = (status) => {
  const variants = { pending: 'secondary', in_progress: 'primary', waiting_client: 'warning', completed: 'success', rejected: 'danger', on_hold: 'secondary' }
  return variants[status] || 'secondary'
}

const OperationList = () => {
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({ status: '', overdue: '' })

  useEffect(() => { fetchOperations() }, [filters])

  const fetchOperations = async (page = 1) => {
    setLoading(true)
    try {
      const response = await operationService.getAll({ page, limit: 20, ...filters })
      setOperations(response.data.data.operations)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch operations')
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (op) => op.deadline && new Date(op.deadline) < new Date() && !['completed', 'rejected'].includes(op.status)

  const columns = [
    { header: 'Service', render: (row) => <div><p className="font-medium">{row.bookingService?.service?.service_name}</p><p className="text-xs text-secondary-500">{row.bookingService?.service?.service_code}</p></div> },
    { header: 'Booking', render: (row) => <Link to={`/bookings/${row.bookingService?.booking?.id}`} className="text-primary-600 hover:underline">{row.bookingService?.booking?.booking_number}</Link> },
    { header: 'Client', render: (row) => row.bookingService?.booking?.client_name },
    { header: 'Assigned To', render: (row) => row.assignee?.full_name || <span className="text-secondary-400">Unassigned</span> },
    { header: 'Deadline', render: (row) => <div className={`flex items-center gap-1 ${isOverdue(row) ? 'text-red-600' : ''}`}>{isOverdue(row) && <AlertTriangle className="w-4 h-4" />}{row.deadline ? new Date(row.deadline).toLocaleDateString() : '-'}</div> },
    { header: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{OPERATION_STATUS_LABELS[row.status]}</Badge> },
    { header: 'Actions', render: (row) => <Link to={`/operations/${row.id}`} className="btn-outline btn-sm"><Eye className="w-4 h-4 mr-1" />View</Link> }
  ]

  return (
    <div>
      <PageHeader title="Operations" subtitle="Manage service operations" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Operations' }]} />

      <div className="card mb-6">
        <div className="p-4 flex flex-wrap gap-4">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input w-48">
            <option value="">All Status</option>
            {Object.entries(OPERATION_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.overdue === 'true'} onChange={(e) => setFilters({ ...filters, overdue: e.target.checked ? 'true' : '' })} className="rounded border-secondary-300" />
            <span className="text-sm">Show overdue only</span>
          </label>
        </div>
      </div>

      <DataTable columns={columns} data={operations} loading={loading} pagination={pagination} onPageChange={fetchOperations} emptyMessage="No operations found" />
    </div>
  )
}

export default OperationList
