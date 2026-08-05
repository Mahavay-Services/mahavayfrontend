import { useState, useEffect } from "react";
import { paymentService } from "../../api/services";
import { API_BASE_URL } from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { CheckCircle, XCircle, Image, Download, FileText } from "lucide-react";
import { PAYMENT_MODE_LABELS } from "../../constants";
import toast from "react-hot-toast";

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null });
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await paymentService.getPending();
      setPayments(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch pending payments");
    } finally {
      setLoading(false);
    }
  };

  const openVerifyModal = (payment) => {
    setSelectedPayment(payment);
    setVerifiedAmount(payment.received_amount);
    setActionModal({ open: true, type: "verify" });
  };

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await paymentService.verify(selectedPayment.id, {
        verification_status: "verified",
        verified_amount: parseFloat(verifiedAmount),
        remarks,
      });
      toast.success("Payment verified successfully");
      setActionModal({ open: false, type: null });
      setSelectedPayment(null);
      setRemarks("");
      setVerifiedAmount("");
      fetchPendingPayments();
    } catch (error) {
      toast.error("Failed to verify payment");
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
      await paymentService.verify(selectedPayment.id, {
        verification_status: "rejected",
        rejection_reason: rejectionReason,
        remarks,
      });
      toast.success("Payment rejected");
      setActionModal({ open: false, type: null });
      setSelectedPayment(null);
      setRemarks("");
      setRejectionReason("");
      fetchPendingPayments();
    } catch (error) {
      toast.error("Failed to reject payment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Payment Verification"
        subtitle={`${payments.length} payments pending verification`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Payment Verification" },
        ]}
      />

      {payments.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-secondary-500">No payments pending verification</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-secondary-900">
                      {payment.booking?.client_name}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {payment.booking?.booking_number}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(payment.received_amount)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Mode</span>
                    <span>{PAYMENT_MODE_LABELS[payment.payment_mode]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Date</span>
                    <span>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Added by</span>
                    <span>{payment.creator?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Booking Total</span>
                    <span>{formatCurrency(payment.booking?.total_amount)}</span>
                  </div>
                </div>
                {payment.screenshots?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-secondary-500 mb-2 flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      Screenshots ({payment.screenshots.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {payment.screenshots.map((ss) => (
                        <button
                          key={ss.id}
                          onClick={() => {
                            const token = localStorage.getItem("accessToken");
                            window.open(
                              `${API_BASE_URL}/payments/screenshot/${ss.id}?token=${token}`,
                              "_blank",
                            );
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-secondary-100 rounded text-xs hover:bg-secondary-200"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">
                            {ss.original_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => openVerifyModal(payment)}
                    className="btn-success btn-sm flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setActionModal({ open: true, type: "reject" });
                    }}
                    className="btn-danger btn-sm flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: null })}
        title={
          actionModal.type === "verify" ? "Verify Payment" : "Reject Payment"
        }
        size="md"
      >
        {selectedPayment && (
          <div>
            <div className="p-4 bg-secondary-50 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-secondary-500">Claimed Amount</span>
                <span className="font-semibold">
                  {formatCurrency(selectedPayment.received_amount)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-secondary-500">Payment Mode</span>
                <span>{PAYMENT_MODE_LABELS[selectedPayment.payment_mode]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Booking</span>
                <span>{selectedPayment.booking?.booking_number}</span>
              </div>
            </div>
            {actionModal.type === "verify" && (
              <div className="mb-4">
                <label className="label">Verified Amount</label>
                <input
                  type="number"
                  value={verifiedAmount}
                  onChange={(e) => setVerifiedAmount(e.target.value)}
                  className="input"
                  placeholder="Enter verified amount"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Adjust if the actual received amount differs from claimed
                </p>
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
                  placeholder="Explain why this payment is being rejected"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="label">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input"
                rows={2}
                placeholder="Optional remarks"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ open: false, type: null })}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={
                  actionModal.type === "verify" ? handleVerify : handleReject
                }
                disabled={submitting}
                className={
                  actionModal.type === "verify" ? "btn-success" : "btn-danger"
                }
              >
                {submitting
                  ? "Processing..."
                  : actionModal.type === "verify"
                    ? "Confirm Verification"
                    : "Confirm Rejection"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentVerification;
