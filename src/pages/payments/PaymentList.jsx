import { useState, useEffect } from 'react'
import { paymentService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { PAYMENT_MODE_LABELS, VERIFICATION_STATUS } from '../../constants'
import toast from 'react-hot-toast'

const PaymentList = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async (page = 1) => {
    setLoading(true)
    try {
      const response = await paymentService.getAll({ page, limit: 20 })
      setPayments(response.data.data.payments)
      setPagination(response.data.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

  const columns = [
    { header: 'Booking', render: (row) => <Link to={`/bookings/${row.booking_id}`} className="text-primary-600 hover:underline">{row.booking?.booking_number}</Link> },
    { header: 'Client', render: (row) => row.booking?.client_name },
    { header: 'Amount', render: (row) => <span className="font-semibold text-primary-600">{formatCurrency(row.received_amount)}</span> },
    { header: 'Mode', render: (row) => PAYMENT_MODE_LABELS[row.payment_mode] || row.payment_mode },
    { header: 'Date', render: (row) => new Date(row.payment_date).toLocaleDateString() },
    { header: 'Status', render: (row) => <Badge variant={row.verification_status === VERIFICATION_STATUS.VERIFIED ? 'success' : row.verification_status === VERIFICATION_STATUS.REJECTED ? 'danger' : 'warning'}>{row.verification_status}</Badge> },
    { header: 'By', render: (row) => row.creator?.full_name }
  ]

  return (
    <div>
      <PageHeader title="Payments" subtitle="View all payment records" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Payments' }]} />
      <DataTable columns={columns} data={payments} loading={loading} pagination={pagination} onPageChange={fetchPayments} emptyMessage="No payments found" />
    </div>
  )
}

export default PaymentList
