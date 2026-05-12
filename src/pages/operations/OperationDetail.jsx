import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { operationService, userService } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { ArrowLeft, User, Calendar, FileText, CheckCircle } from 'lucide-react'
import { OPERATION_STATUS_LABELS } from '../../constants'
import toast from 'react-hot-toast'

const OperationDetail = () => {
  const { id } = useParams()
  const { hasRole } = useAuth()
  const [operation, setOperation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [opsUsers, setOpsUsers] = useState([])
  const [assignModal, setAssignModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [formData, setFormData] = useState({ assigned_to: '', deadline: '', notes: '', status: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      const [opRes, usersRes] = await Promise.all([operationService.getById(id), userService.getOpsList()])
      setOperation(opRes.data.data)
      setOpsUsers(usersRes.data.data)
    } catch (error) {
      toast.error('Failed to fetch operation')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!formData.assigned_to) { toast.error('Please select assignee'); return }
    setSubmitting(true)
    try {
      await operationService.assign(id, formData)
      toast.success('Operation assigned')
      setAssignModal(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to assign')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!formData.status) return
    setSubmitting(true)
    try {
      await operationService.updateStatus(id, { status: formData.status, notes: formData.notes })
      toast.success('Status updated')
      setStatusModal(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const statusVariant = (status) => {
    const variants = { pending: 'secondary', in_progress: 'primary', waiting_client: 'warning', completed: 'success', rejected: 'danger', on_hold: 'secondary' }
    return variants[status] || 'secondary'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  if (!operation) return <div className="text-center py-12">Operation not found</div>

  return (
    <div>
      <PageHeader title={`Operation: ${operation.bookingService?.service?.service_name}`} breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Operations', href: '/operations' }, { label: 'Detail' }]} actions={<Link to="/operations" className="btn-outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between"><h3 className="font-semibold">Operation Details</h3><Badge variant={statusVariant(operation.status)}>{OPERATION_STATUS_LABELS[operation.status]}</Badge></div>
            <div className="card-body grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-secondary-400" /><div><p className="text-xs text-secondary-500">Service</p><p className="font-medium">{operation.bookingService?.service?.service_name}</p></div></div>
              <div className="flex items-center gap-3"><User className="w-5 h-5 text-secondary-400" /><div><p className="text-xs text-secondary-500">Assigned To</p><p className="font-medium">{operation.assignee?.full_name || 'Not assigned'}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-secondary-400" /><div><p className="text-xs text-secondary-500">Deadline</p><p className="font-medium">{operation.deadline ? new Date(operation.deadline).toLocaleDateString() : 'Not set'}</p></div></div>
              <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-secondary-400" /><div><p className="text-xs text-secondary-500">Completed</p><p className="font-medium">{operation.completed_at ? new Date(operation.completed_at).toLocaleString() : '-'}</p></div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Booking Information</h3></div>
            <div className="card-body">
              <div className="flex items-center justify-between"><div><Link to={`/bookings/${operation.bookingService?.booking?.id}`} className="font-semibold text-primary-600 hover:underline">{operation.bookingService?.booking?.booking_number}</Link><p className="text-secondary-900">{operation.bookingService?.booking?.client_name}</p></div></div>
            </div>
          </div>

          {operation.notes && <div className="card"><div className="card-header"><h3 className="font-semibold">Notes</h3></div><div className="card-body"><p className="text-secondary-700">{operation.notes}</p></div></div>}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Actions</h3></div>
            <div className="card-body space-y-3">
              {hasRole('super_admin', 'ops_manager') && <button onClick={() => { setFormData({ ...formData, assigned_to: operation.assigned_to || '' }); setAssignModal(true) }} className="btn-primary w-full">Assign / Reassign</button>}
              <button onClick={() => { setFormData({ ...formData, status: operation.status }); setStatusModal(true) }} className="btn-outline w-full">Update Status</button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Operation">
        <div className="space-y-4">
          <div><label className="label">Assign To *</label><select value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} className="input"><option value="">Select User</option>{opsUsers.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
          <div><label className="label">Deadline</label><input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="input" /></div>
          <div><label className="label">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input" rows={3} /></div>
          <div className="flex justify-end gap-3"><button onClick={() => setAssignModal(false)} className="btn-outline">Cancel</button><button onClick={handleAssign} disabled={submitting} className="btn-primary">{submitting ? 'Assigning...' : 'Assign'}</button></div>
        </div>
      </Modal>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Status">
        <div className="space-y-4">
          <div><label className="label">Status *</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input">{Object.entries(OPERATION_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><label className="label">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input" rows={3} /></div>
          <div className="flex justify-end gap-3"><button onClick={() => setStatusModal(false)} className="btn-outline">Cancel</button><button onClick={handleStatusUpdate} disabled={submitting} className="btn-primary">{submitting ? 'Updating...' : 'Update'}</button></div>
        </div>
      </Modal>
    </div>
  )
}

export default OperationDetail
