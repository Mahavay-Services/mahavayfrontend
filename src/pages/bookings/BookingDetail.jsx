import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  bookingService,
  paymentService,
  documentService,
} from "../../api/services";
import { API_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import {
  Edit,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  CreditCard,
  Image,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Home,
} from "lucide-react";
import {
  STAGE_LABELS,
  PAYMENT_MODE_LABELS,
  PAYMENT_MODES,
  VERIFICATION_STATUS_LABELS,
  DOCUMENT_TYPES,
} from "../../constants";
import toast from "react-hot-toast";

const ALL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "payments", label: "Payments" },
  { id: "documents", label: "Documents", hideForSales: true },
  { id: "activity", label: "Activity" },
];

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const isSales = user?.role === "sales";
  const TABS = ALL_TABS.filter((tab) => !(tab.hideForSales && isSales));
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [remarkModal, setRemarkModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    received_amount: "",
    payment_mode: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_reference: "",
    remarks: "",
  });
  const [paymentScreenshots, setPaymentScreenshots] = useState([]);
  const [documentModal, setDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState({
    document_type: "agreement",
    remarks: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const documentInputRef = useRef(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingService.getById(id);
      setBooking(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch booking");
    } finally {
      setLoading(false);
    }
  };

  const addRemark = async () => {
    if (!remark.trim()) return;
    setSubmitting(true);
    try {
      await bookingService.addRemark(id, { remark });
      toast.success("Remark added");
      setRemarkModal(false);
      setRemark("");
      fetchBooking();
    } catch (error) {
      toast.error("Failed to add remark");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile) {
      toast.error("Please select a file");
      return;
    }
    setSubmitting(true);
    try {
      await documentService.upload({
        booking_id: id,
        document_type: documentData.document_type,
        remarks: documentData.remarks,
        file: documentFile,
      });
      toast.success("Document uploaded successfully");
      setDocumentModal(false);
      setDocumentFile(null);
      setDocumentData({ document_type: "agreement", remarks: "" });
      if (documentInputRef.current) documentInputRef.current.value = "";
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
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

  const handleAddPayment = async () => {
    if (!paymentData.received_amount || !paymentData.payment_mode) {
      toast.error("Amount and payment mode are required");
      return;
    }
    setSubmitting(true);
    try {
      await paymentService.addRemainingPayment(
        { ...paymentData, booking_id: id },
        paymentScreenshots,
      );
      toast.success("Payment added successfully");
      setPaymentModal(false);
      setPaymentData({
        received_amount: "",
        payment_mode: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_reference: "",
        remarks: "",
      });
      setPaymentScreenshots([]);
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBooking = async () => {
    setSubmitting(true);
    try {
      await bookingService.delete(id);
      toast.success("Booking deleted");
      navigate("/bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const files = Array.from(e.target.files);
    setPaymentScreenshots((prev) => [...prev, ...files]);
  };

  const removeScreenshot = (index) => {
    setPaymentScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const stageBadgeVariant = (stage) => {
    const variants = {
      sales_created: "primary",
      accounts_verification_pending: "warning",
      accounts_verified: "success",
      legal_pending: "warning",
      legal_verified: "success",
      operations_started: "primary",
      partially_completed: "warning",
      completed: "success",
      cancelled: "danger",
      on_hold: "secondary",
    };
    return variants[stage] || "secondary";
  };

  const verificationBadge = (status) => {
    if (status === "verified")
      return (
        <Badge variant="success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    if (status === "rejected")
      return (
        <Badge variant="danger">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    return (
      <Badge variant="warning">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!booking)
    return <div className="text-center py-12">Booking not found</div>;

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.booking_number}`}
        subtitle={
          <Badge variant={stageBadgeVariant(booking.current_stage)}>
            {STAGE_LABELS[booking.current_stage]}
          </Badge>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bookings", href: "/bookings" },
          { label: booking.booking_number },
        ]}
        actions={
          <div className="flex gap-3">
            {hasRole("super_admin", "sales") &&
              parseFloat(booking.pending_amount) > 0 && (
                <button
                  onClick={() => setPaymentModal(true)}
                  className="btn-outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </button>
              )}
            <button
              onClick={() => setRemarkModal(true)}
              className="btn-outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Remark
            </button>
            {hasRole("super_admin", "sales") && (
              <Link to={`/bookings/${id}/edit`} className="btn-primary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            )}
            {hasRole("super_admin") && (
              <button
                onClick={() => setDeleteModal(true)}
                className="btn-danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        }
      />

      <div className="mb-6 border-b border-secondary-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-primary-500 text-primary-600" : "border-transparent text-secondary-500 hover:text-secondary-700"}`}
            >
              {tab.label}
              {tab.id === "payments" && booking.payments?.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-secondary-100 rounded-full">
                  {booking.payments.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Client Information</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">Client Name</p>
                    <p className="font-medium">{booking.client_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">Company</p>
                    <p className="font-medium">{booking.company_name || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">Mobile</p>
                    <p className="font-medium">{booking.mobile}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">Email</p>
                    <p className="font-medium">{booking.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <Home className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">Full Address</p>
                    <p className="font-medium">{booking.address || "-"}</p>
                    <p className="text-sm text-secondary-600">
                      {[booking.city, booking.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">PAN Number</p>
                    <p className="font-medium">{booking.pan_number || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-secondary-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-secondary-500">GST Number</p>
                    <p className="font-medium">{booking.gst_number || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Sales Team</h3>
              </div>
              <div className="card-body flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {booking.bdm?.full_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{booking.bdm?.full_name}</p>
                    <p className="text-sm text-secondary-500">
                      Primary BDM
                      {booking.bdmSplits?.find(
                        (s) => s.user_id === booking.bdm_id,
                      )?.split_percentage &&
                        ` (${booking.bdmSplits.find((s) => s.user_id === booking.bdm_id).split_percentage}%)`}
                    </p>
                  </div>
                </div>
                {booking.bdm2 && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                      <span className="text-secondary-700 font-semibold text-lg">
                        {booking.bdm2?.full_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{booking.bdm2?.full_name}</p>
                      <p className="text-sm text-secondary-500">
                        Secondary BDM (50%)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Payment Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Subtotal</span>
                    <span>{formatCurrency(booking.subtotal_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">GST</span>
                    <span>{formatCurrency(booking.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total</span>
                    <span className="text-lg">
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Received</span>
                    <span className="font-semibold">
                      {formatCurrency(booking.received_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Pending</span>
                    <span className="font-semibold">
                      {formatCurrency(booking.pending_amount)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Payment Terms</span>
                    <span className="capitalize">{booking.payment_terms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Agreement</span>
                    <span className="capitalize">
                      {booking.agreement_type?.replace("_", " ") || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Quick Stats</h3>
              </div>
              <div className="card-body grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {booking.bookingServices?.length || 0}
                  </p>
                  <p className="text-xs text-secondary-500">Services</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {booking.payments?.filter(
                      (p) => p.verification_status === "verified",
                    ).length || 0}
                  </p>
                  <p className="text-xs text-secondary-500">
                    Verified Payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">
              Services ({booking.bookingServices?.length || 0})
            </h3>
          </div>
          <div className="card-body">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-secondary-500 border-b">
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">GST %</th>
                  <th className="pb-3">GST Amount</th>
                  <th className="pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {booking.bookingServices?.map((bs) => (
                  <tr key={bs.id}>
                    <td className="py-4">
                      <p className="font-medium">{bs.service?.service_name}</p>
                      <p className="text-sm text-secondary-500">
                        {bs.service?.service_code}
                      </p>
                    </td>
                    <td className="py-4">{formatCurrency(bs.custom_price)}</td>
                    <td className="py-4">{bs.gst_percentage}%</td>
                    <td className="py-4">{formatCurrency(bs.gst_amount)}</td>
                    <td className="py-4 font-semibold">
                      {formatCurrency(bs.final_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <td colSpan="4" className="py-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="py-3 font-bold text-lg">
                    {formatCurrency(booking.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-6">
          {booking.payments?.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-12 text-secondary-500">
                No payments recorded yet
              </div>
            </div>
          )}
          {booking.payments?.map((payment, idx) => (
            <div key={payment.id} className="card">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  <div>
                    <h4 className="font-semibold">
                      {payment.payment_type === "remaining"
                        ? "Remaining Payment"
                        : "Initial Payment"}{" "}
                      #{idx + 1}
                    </h4>
                    <p className="text-sm text-secondary-500">
                      {new Date(payment.payment_date).toLocaleDateString()} •{" "}
                      {PAYMENT_MODE_LABELS[payment.payment_mode]}
                    </p>
                  </div>
                </div>
                {verificationBadge(payment.verification_status)}
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-secondary-500">Amount</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(payment.received_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">
                      Verified Amount
                    </p>
                    <p className="font-semibold">
                      {payment.verified_amount
                        ? formatCurrency(payment.verified_amount)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Reference</p>
                    <p className="font-medium">
                      {payment.payment_reference || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-500">Created By</p>
                    <p className="font-medium">{payment.creator?.full_name}</p>
                  </div>
                </div>
                {payment.verification_status === "verified" &&
                  payment.verifier && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded mb-4">
                      Verified by {payment.verifier.full_name} on{" "}
                      {new Date(payment.verified_at).toLocaleString()}
                    </div>
                  )}
                {payment.verification_status === "rejected" && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">
                    <strong>Rejection Reason:</strong>{" "}
                    {payment.rejection_reason}
                  </div>
                )}
                {payment.remarks && (
                  <div className="text-sm text-secondary-600 mb-4">
                    <strong>Remarks:</strong> {payment.remarks}
                  </div>
                )}
                {payment.screenshots?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Screenshots ({payment.screenshots.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {payment.screenshots.map((ss) => (
                        <div
                          key={ss.id}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary-50 rounded-lg text-sm"
                        >
                          <FileText className="w-4 h-4 text-secondary-400" />
                          <span className="truncate max-w-[150px]">
                            {ss.original_name}
                          </span>
                          <button
                            onClick={() => {
                              const token = localStorage.getItem("accessToken");
                              window.open(
                                `${API_BASE_URL}/payments/screenshot/${ss.id}?token=${token}`,
                                "_blank",
                              );
                            }}
                            className="text-primary-500 hover:text-primary-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold">Documents</h3>
            <button
              onClick={() => setDocumentModal(true)}
              className="btn-primary btn-sm"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload Document
            </button>
          </div>
          <div className="card-body">
            {booking.documents?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">No documents uploaded</p>
                <p className="text-sm text-secondary-400 mt-1">
                  Upload an agreement to move this booking to Legal Pending
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {booking.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-secondary-400" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-secondary-500">
                          {DOCUMENT_TYPES.find(
                            (t) => t.value === doc.document_type,
                          )?.label || doc.document_type}{" "}
                          • Uploaded by {doc.uploader?.full_name} •
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="btn-outline btn-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Stage History</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {booking.stageLogs?.map((log, idx) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${idx === 0 ? "bg-primary-500" : "bg-secondary-300"}`}
                      />
                      {idx < booking.stageLogs.length - 1 && (
                        <div className="w-0.5 h-full bg-secondary-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">
                        {STAGE_LABELS[log.to_stage]}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {log.changer?.full_name} •{" "}
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.reason && (
                        <p className="text-sm text-secondary-600 mt-1">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold">Remarks</h3>
              <button
                onClick={() => setRemarkModal(true)}
                className="btn-outline btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            <div className="card-body max-h-96 overflow-y-auto">
              {booking.remarks?.length === 0 && (
                <p className="text-center py-8 text-secondary-500">
                  No remarks yet
                </p>
              )}
              <div className="space-y-4">
                {booking.remarks?.map((r) => (
                  <div
                    key={r.id}
                    className="flex gap-3 p-3 bg-secondary-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 text-xs font-semibold">
                        {r.creator?.full_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm">{r.remark}</p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {r.creator?.full_name} •{" "}
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={remarkModal}
        onClose={() => setRemarkModal(false)}
        title="Add Remark"
      >
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="input"
          rows={4}
          placeholder="Enter your remark..."
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setRemarkModal(false)} className="btn-outline">
            Cancel
          </button>
          <button
            onClick={addRemark}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Adding..." : "Add Remark"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Add Remaining Payment"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input
                type="number"
                value={paymentData.received_amount}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    received_amount: e.target.value,
                  })
                }
                className="input"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="label">Payment Mode *</label>
              <select
                value={paymentData.payment_mode}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_mode: e.target.value,
                  })
                }
                className="input"
              >
                {<option value="">Select mode</option>}
                {Object.entries(PAYMENT_MODES).map(([key, val]) => (
                  <option key={key} value={val}>
                    {PAYMENT_MODE_LABELS[val]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Date</label>
              <input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_date: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">Reference</label>
              <input
                type="text"
                value={paymentData.payment_reference}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_reference: e.target.value,
                  })
                }
                className="input"
                placeholder="Transaction ID"
              />
            </div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea
              value={paymentData.remarks}
              onChange={(e) =>
                setPaymentData({ ...paymentData, remarks: e.target.value })
              }
              className="input"
              rows={2}
              placeholder="Optional remarks"
            />
          </div>
          <div>
            <label className="label">Payment Screenshots</label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleScreenshotChange}
              className="input"
            />
            {paymentScreenshots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentScreenshots.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2 py-1 bg-secondary-100 rounded text-sm"
                  >
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      onClick={() => removeScreenshot(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-secondary-50 p-3 rounded-lg text-sm">
            <strong>Pending Amount:</strong>{" "}
            {formatCurrency(booking.pending_amount)}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setPaymentModal(false)}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPayment}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Adding..." : "Add Payment"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Booking"
      >
        <p className="text-secondary-600">
          Are you sure you want to delete booking{" "}
          <strong>{booking.booking_number}</strong>? This action cannot be
          undone.
        </p>
        <p className="text-sm text-red-500 mt-2">
          All associated payments, documents, and records will be permanently
          deleted.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteModal(false)} className="btn-outline">
            Cancel
          </button>
          <button
            onClick={handleDeleteBooking}
            disabled={submitting}
            className="btn-danger"
          >
            {submitting ? "Deleting..." : "Delete Booking"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={documentModal}
        onClose={() => {
          setDocumentModal(false);
          setDocumentFile(null);
          setDocumentData({ document_type: "agreement", remarks: "" });
        }}
        title="Upload Document"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Document Type *</label>
            <select
              value={documentData.document_type}
              onChange={(e) =>
                setDocumentData({
                  ...documentData,
                  document_type: e.target.value,
                })
              }
              className="input"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Select File *</label>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              className="input"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
            </p>
          </div>
          {documentFile && (
            <div className="p-3 bg-secondary-50 rounded-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary-400" />
              <span className="text-sm">{documentFile.name}</span>
              <span className="text-xs text-secondary-400">
                ({(documentFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
          <div>
            <label className="label">Remarks (Optional)</label>
            <textarea
              value={documentData.remarks}
              onChange={(e) =>
                setDocumentData({ ...documentData, remarks: e.target.value })
              }
              className="input"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>
          {booking.current_stage === "accounts_verified" &&
            documentData.document_type === "agreement" && (
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-sm text-primary-700">
                  <strong>Note:</strong> Uploading an agreement will move this
                  booking to "Legal Pending" stage.
                </p>
              </div>
            )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setDocumentModal(false);
              setDocumentFile(null);
            }}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadDocument}
            disabled={submitting || !documentFile}
            className="btn-primary"
          >
            {submitting ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetail;
