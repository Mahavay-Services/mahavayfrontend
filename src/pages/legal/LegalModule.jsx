import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { documentService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import StatCard from "../../components/ui/StatCard";
import {
  CheckCircle,
  XCircle,
  FileText,
  Scale,
  Upload,
  Download,
  Trash2,
  Eye,
  RotateCcw,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { DOCUMENT_TYPES } from "../../constants";
import toast from "react-hot-toast";

const LegalModule = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "pending",
  );
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null });
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [historyModal, setHistoryModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await documentService.getLegalStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await documentService.getLegalBookings({
        status: activeTab === "all" ? "" : activeTab,
        page,
        limit: 20,
      });
      setBookings(response.data.data.bookings);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openActionModal = (booking, type) => {
    setSelectedBooking(booking);
    setActionModal({ open: true, type });
    setRemarks("");
    setRejectionReason("");
    setCorrectionNotes("");
  };

  const closeModal = () => {
    setActionModal({ open: false, type: null });
    setSelectedBooking(null);
    setRemarks("");
    setRejectionReason("");
    setCorrectionNotes("");
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await documentService.approveLegal(selectedBooking.id, { remarks });
      toast.success("Legal approval granted");
      closeModal();
      fetchStats();
      fetchBookings();
    } catch (error) {
      toast.error("Failed to approve");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    setSubmitting(true);
    try {
      await documentService.rejectLegal(selectedBooking.id, {
        rejection_reason: rejectionReason,
        remarks,
      });
      toast.success("Legal approval rejected");
      closeModal();
      fetchStats();
      fetchBookings();
    } catch (error) {
      toast.error("Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBack = async () => {
    if (!correctionNotes.trim()) {
      toast.error("Please provide correction notes");
      return;
    }
    setSubmitting(true);
    try {
      await documentService.sendBackForCorrections(selectedBooking.id, {
        correction_notes: correctionNotes,
        remarks,
      });
      toast.success("Sent back for corrections");
      closeModal();
      fetchStats();
      fetchBookings();
    } catch (error) {
      toast.error("Failed to send back");
    } finally {
      setSubmitting(false);
    }
  };

  const viewApprovalHistory = async (booking) => {
    try {
      const response = await documentService.getApprovalHistory(booking.id);
      setApprovalHistory(response.data.data);
      setSelectedBooking(booking);
      setHistoryModal(true);
    } catch (error) {
      toast.error("Failed to fetch approval history");
    }
  };

  const downloadDocument = async (doc) => {
    try {
      const response = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getStatusBadge = (booking) => {
    if (booking.legal_verified)
      return <Badge variant="success">Approved</Badge>;
    if (booking.current_stage === "legal_pending")
      return <Badge variant="warning">Pending</Badge>;
    const latestApproval = booking.approvals?.[0];
    if (latestApproval?.status === "rejected")
      return <Badge variant="danger">Rejected</Badge>;
    if (latestApproval?.status === "correction_needed")
      return <Badge variant="warning">Needs Correction</Badge>;
    return <Badge variant="secondary">N/A</Badge>;
  };

  const columns = [
    {
      header: "Booking",
      render: (row) => (
        <div>
          <Link
            to={`/bookings/${row.id}`}
            className="font-semibold text-primary-600 hover:underline"
          >
            {row.booking_number}
          </Link>
          <p className="text-sm text-secondary-500">{row.client_name}</p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: "company_name",
      render: (row) => row.company_name || "-",
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">
          {formatCurrency(row.total_amount)}
        </span>
      ),
    },
    {
      header: "BDM",
      render: (row) => row.bdm?.full_name || "-",
    },
    {
      header: "Documents",
      render: (row) => (
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-secondary-400" />
          <span>{row.documents?.length || 0}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => getStatusBadge(row),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => viewApprovalHistory(row)}
            className="p-2 hover:bg-secondary-100 rounded-lg"
            title="View History"
          >
            <Clock className="w-4 h-4 text-secondary-600" />
          </button>
          {row.current_stage === "legal_pending" && (
            <>
              <button
                onClick={() => openActionModal(row, "approve")}
                className="p-2 hover:bg-primary-100 rounded-lg"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4 text-primary-600" />
              </button>
              <button
                onClick={() => openActionModal(row, "corrections")}
                className="p-2 hover:bg-yellow-100 rounded-lg"
                title="Send Back"
              >
                <RotateCcw className="w-4 h-4 text-yellow-600" />
              </button>
              <button
                onClick={() => openActionModal(row, "reject")}
                className="p-2 hover:bg-red-100 rounded-lg"
                title="Reject"
              >
                <XCircle className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "pending", label: "Pending", count: stats?.pending },
    { id: "approved", label: "Approved", count: stats?.approved },
    { id: "all", label: "Accounts Verified" },
  ];

  return (
    <div>
      <PageHeader
        title="Legal Module"
        subtitle="Manage legal approvals and documents"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Legal" },
        ]}
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Pending Approvals"
            value={stats.pending}
            icon={Clock}
            iconColor="warning"
          />
          <StatCard
            title="Approved This Month"
            value={stats.approved}
            icon={CheckCircle}
            iconColor="success"
          />
          <StatCard
            title="Rejected This Month"
            value={stats.rejected}
            icon={XCircle}
            iconColor="danger"
          />
          <StatCard
            title="Sent for Corrections"
            value={stats.corrections}
            icon={RotateCcw}
            iconColor="warning"
          />
        </div>
      )}

      <div className="card">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-600"
                        : "bg-secondary-100 text-secondary-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-0">
          <DataTable
            columns={columns}
            data={bookings}
            loading={loading}
            pagination={pagination}
            onPageChange={fetchBookings}
            emptyMessage="No bookings found"
          />
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={closeModal}
        title={
          actionModal.type === "approve"
            ? "Approve Legal"
            : actionModal.type === "reject"
              ? "Reject Legal"
              : "Send Back for Corrections"
        }
        size="md"
      >
        {selectedBooking && (
          <div>
            <div className="p-4 bg-secondary-50 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-secondary-500">Booking</span>
                <span className="font-semibold">
                  {selectedBooking.booking_number}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-secondary-500">Client</span>
                <span>{selectedBooking.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Amount</span>
                <span className="font-semibold text-primary-600">
                  {formatCurrency(selectedBooking.total_amount)}
                </span>
              </div>
            </div>

            {selectedBooking.documents?.length > 0 && (
              <div className="mb-4">
                <label className="label">Attached Documents</label>
                <div className="space-y-2">
                  {selectedBooking.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm">{doc.file_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {doc.document_type}
                        </Badge>
                      </div>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="p-1 hover:bg-secondary-200 rounded"
                      >
                        <Download className="w-4 h-4 text-primary-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actionModal.type === "reject" && (
              <div className="mb-4">
                <label className="label">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Explain why this is being rejected..."
                />
              </div>
            )}

            {actionModal.type === "corrections" && (
              <div className="mb-4">
                <label className="label">Correction Notes *</label>
                <textarea
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Describe what corrections are needed..."
                />
              </div>
            )}

            <div className="mb-4">
              <label className="label">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input"
                rows={2}
                placeholder="Additional remarks..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={
                  actionModal.type === "approve"
                    ? handleApprove
                    : actionModal.type === "reject"
                      ? handleReject
                      : handleSendBack
                }
                disabled={submitting}
                className={
                  actionModal.type === "approve"
                    ? "btn-success"
                    : actionModal.type === "reject"
                      ? "btn-danger"
                      : "btn-warning"
                }
              >
                {submitting
                  ? "Processing..."
                  : actionModal.type === "approve"
                    ? "Confirm Approval"
                    : actionModal.type === "reject"
                      ? "Confirm Rejection"
                      : "Send Back"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval History Modal */}
      <Modal
        isOpen={historyModal}
        onClose={() => setHistoryModal(false)}
        title="Approval History"
        size="md"
      >
        {selectedBooking && (
          <div>
            <div className="p-3 bg-secondary-50 rounded-lg mb-4">
              <p className="font-semibold">{selectedBooking.booking_number}</p>
              <p className="text-sm text-secondary-500">
                {selectedBooking.client_name}
              </p>
            </div>

            {approvalHistory.length === 0 ? (
              <p className="text-center text-secondary-500 py-4">
                No approval history
              </p>
            ) : (
              <div className="space-y-3">
                {approvalHistory.map((approval, index) => (
                  <div
                    key={approval.id}
                    className="relative pl-6 pb-4 border-l-2 border-secondary-200 last:border-l-0"
                  >
                    <div
                      className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${
                        approval.status === "verified"
                          ? "bg-primary-500"
                          : approval.status === "rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            approval.status === "verified"
                              ? "success"
                              : approval.status === "rejected"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {approval.status === "verified"
                            ? "Approved"
                            : approval.status === "rejected"
                              ? "Rejected"
                              : "Correction Needed"}
                        </Badge>
                        <span className="text-xs text-secondary-500">
                          {new Date(approval.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        By: {approval.approver?.full_name}
                      </p>
                      {approval.rejection_reason && (
                        <p className="text-sm mt-2 text-secondary-700">
                          <strong>Reason:</strong> {approval.rejection_reason}
                        </p>
                      )}
                      {approval.remarks && (
                        <p className="text-sm mt-1 text-secondary-600">
                          <strong>Remarks:</strong> {approval.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalModule;
