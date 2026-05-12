import { useState, useEffect } from 'react'
import { documentService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, FileText, Scale } from 'lucide-react'
import toast from 'react-hot-toast'

const LegalApprovals = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionModal, setActionModal] = useState({ open: false, type: null })
  const [remarks, setRemarks] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchPendingApprovals() }, [])

  const fetchPendingApprovals = async () => {
    try {
      const response = await documentService.getPendingLegal()
      setBookings(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      await documentService.approveLegal(selectedBooking.id, { remarks })
      toast.success('Legal approval granted')
      closeModal()
      fetchPendingApprovals()
    } catch (error) {
      toast.error('Failed to approve')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide rejection reason'); return }
    setSubmitting(true)
    try {
      await documentService.rejectLegal(selectedBooking.id, { rejection_reason: rejectionReason, remarks })
      toast.success('Legal approval rejected')
      closeModal()
      fetchPendingApprovals()
    } catch (error) {
      toast.error('Failed to reject')
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setActionModal({ open: false, type: null })
    setSelectedBooking(null)
    setRemarks('')
    setRejectionReason('')
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <PageHeader title="Legal Approvals" subtitle={`${bookings.length} bookings pending legal approval`} breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Legal Approvals' }]} />

      {bookings.length === 0 ? (
        <div className="card p-12 text-center"><Scale className="w-12 h-12 text-green-500 mx-auto mb-4" /><h3 className="text-lg font-semibold">All caught up!</h3><p className="text-secondary-500">No bookings pending legal approval</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div><Link to={`/bookings/${booking.id}`} className="font-semibold text-primary-600 hover:underline">{booking.booking_number}</Link><p className="text-secondary-900 mt-1">{booking.client_name}</p><p className="text-sm text-secondary-500">{booking.company_name}</p></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-secondary-500">Total Value</span><span className="font-semibold">{formatCurrency(booking.total_amount)}</span></div>
                  <div className="flex justify-between"><span className="text-secondary-500">BDM</span><span>{booking.bdm?.full_name}</span></div>
                  <div className="flex justify-between"><span className="text-secondary-500">Documents</span><span>{booking.documents?.length || 0} uploaded</span></div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button onClick={() => { setSelectedBooking(booking); setActionModal({ open: true, type: 'approve' }) }} className="btn-success btn-sm flex-1"><CheckCircle className="w-4 h-4 mr-1" />Approve</button>
                  <button onClick={() => { setSelectedBooking(booking); setActionModal({ open: true, type: 'reject' }) }} className="btn-danger btn-sm flex-1"><XCircle className="w-4 h-4 mr-1" />Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={actionModal.open} onClose={closeModal} title={actionModal.type === 'approve' ? 'Approve Legal' : 'Reject Legal'}>
        {selectedBooking && (
          <div>
            <div className="p-4 bg-secondary-50 rounded-lg mb-4"><p className="font-semibold">{selectedBooking.booking_number}</p><p className="text-secondary-600">{selectedBooking.client_name}</p></div>
            {actionModal.type === 'reject' && <div className="mb-4"><label className="label">Rejection Reason *</label><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input" rows={3} /></div>}
            <div className="mb-4"><label className="label">Remarks</label><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="input" rows={2} /></div>
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="btn-outline">Cancel</button>
              <button onClick={actionModal.type === 'approve' ? handleApprove : handleReject} disabled={submitting} className={actionModal.type === 'approve' ? 'btn-success' : 'btn-danger'}>{submitting ? 'Processing...' : actionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LegalApprovals
