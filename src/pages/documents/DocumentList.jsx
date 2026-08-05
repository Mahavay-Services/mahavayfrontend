import { useState, useEffect } from 'react'
import { documentService } from '../../api/services'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Link } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { DOCUMENT_TYPES } from '../../constants'
import toast from 'react-hot-toast'

const DocumentList = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDocuments() }, [])

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getAll()
      setDocuments(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await documentService.download(doc.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = doc.file_name
      link.click()
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const getTypeLabel = (type) => DOCUMENT_TYPES.find(t => t.value === type)?.label || type

  const columns = [
    { header: 'Document', render: (row) => <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-secondary-400" /><div><p className="font-medium">{row.file_name}</p><p className="text-xs text-secondary-500">{getTypeLabel(row.document_type)}</p></div></div> },
    { header: 'Booking', render: (row) => <Link to={`/bookings/${row.booking_id}`} className="text-primary-600 hover:underline">{row.booking?.booking_number}</Link> },
    { header: 'Uploaded By', render: (row) => row.uploader?.full_name },
    { header: 'Version', render: (row) => <Badge variant="secondary">v{row.version_number}</Badge> },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { header: 'Actions', render: (row) => <button onClick={() => handleDownload(row)} className="btn-outline btn-sm"><Download className="w-4 h-4 mr-1" />Download</button> }
  ]

  return (
    <div>
      <PageHeader title="Documents" subtitle="All uploaded documents" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Documents' }]} />
      <DataTable columns={columns} data={documents} loading={loading} emptyMessage="No documents found" />
    </div>
  )
}

export default DocumentList
