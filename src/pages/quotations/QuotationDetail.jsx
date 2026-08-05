import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { quotationService } from "../../api/services";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft,
  Edit,
  Send,
  Printer,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const LOGO_URL = "/Mahavaylogo.png";
const AUTH_SIGN_URL = "/authsign2.png";

const statusVariant = {
  draft: "secondary",
  sent: "primary",
  accepted: "success",
  rejected: "danger",
  expired: "warning",
};

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quotationService.getById(id);
      const data = res.data.data;
      // Ensure items is always an array
      if (typeof data.items === "string") {
        try {
          data.items = JSON.parse(data.items);
        } catch (e) {
          data.items = [];
        }
      }
      if (!Array.isArray(data.items)) data.items = [];
      setQuotation(data);
    } catch (err) {
      console.error("Failed to fetch quotation:", err);
      setError("Failed to load quotation");
      toast.error("Failed to fetch quotation");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    const origin = window.location.origin;
    let html = content.innerHTML;
    html = html.replace(/src="\/Mahavaylogo\.png"/g, `src="${origin}/Mahavaylogo.png"`);
    html = html.replace(
      /src="\/authsign2\.png"/g,
      `src="${origin}/authsign2.png"`,
    );
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation - ${quotation.quotation_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; font-size: 13px; }
            .q-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #16a34a; }
            .q-header img { height: 52px; }
            .q-header .q-title { text-align: right; }
            .q-header .q-title h2 { font-size: 22px; color: #1e293b; text-transform: uppercase; }
            .q-header .q-title p { color: #64748b; font-size: 12px; margin-top: 2px; }
            .q-info { display: flex; justify-content: space-between; margin-bottom: 28px; }
            .q-info h3 { font-size: 10px; text-transform: uppercase; color: #16a34a; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
            .q-info p { line-height: 1.6; color: #475569; }
            .q-info .name { font-weight: 600; color: #1e293b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead th { background: #16a34a; color: white; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            thead th.text-left { text-align: left; }
            thead th.text-center { text-align: center; }
            thead th.text-right { text-align: right; }
            tbody td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .q-totals { margin-left: auto; width: 300px; }
            .q-totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
            .q-totals .row.grand { border-top: 2px solid #16a34a; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 700; color: #16a34a; }
            .q-notes { margin-top: 28px; padding: 14px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px; }
            .q-notes h4 { font-size: 10px; text-transform: uppercase; color: #16a34a; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px; }
            .q-notes p { font-size: 12px; color: #475569; white-space: pre-line; line-height: 1.5; }
            .q-terms { margin-top: 14px; padding: 14px; background: #f8fafc; border-radius: 4px; }
            .q-terms h4 { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
            .q-terms p { font-size: 11px; color: #64748b; white-space: pre-line; line-height: 1.5; }
            .q-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
            .q-footer p { font-size: 10px; color: #94a3b8; }
            .q-stamp img { height: 60px; margin-left: auto; display: block; }
            .q-stamp p.sig { font-weight: 600; color: #1e293b; font-size: 13px; }
            .q-stamp .line { border-top: 1px solid #1e293b; width: 180px; margin-left: auto; margin-top: 3px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await quotationService.updateStatus(id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchQuotation();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500 mb-4">
          {error || "Quotation not found"}
        </p>
        <button onClick={() => navigate("/quotations")} className="btn-outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotations
        </button>
      </div>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/quotations")}
            className="btn-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-secondary-900">
              {quotation.quotation_number}
            </h1>
            <Badge variant={statusVariant[quotation.status] || "secondary"}>
              {quotation.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quotation.status === "draft" && (
            <button
              onClick={() => handleStatusChange("sent")}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Mark Sent
            </button>
          )}
          {quotation.status === "sent" && (
            <>
              <button
                onClick={() => handleStatusChange("accepted")}
                className="btn-success"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </button>
              <button
                onClick={() => handleStatusChange("rejected")}
                className="btn-danger"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
          <Link to={`/quotations/${id}/edit`} className="btn-outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button onClick={handlePrint} className="btn-outline">
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Printable Quotation */}
      <div className="card p-8" ref={printRef}>
        {/* Header with Logo */}
        <div
          className="q-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "3px solid #16a34a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={LOGO_URL}
              alt="Mahavay"
              style={{ height: "82px" }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: "22px",
                color: "#1e293b",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Quotation
            </h2>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0" }}>
              {quotation.quotation_number}
            </p>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0" }}>
              Date: {formatDate(quotation.quotation_date)}
            </p>
            {quotation.valid_until && (
              <p
                style={{ color: "#64748b", fontSize: "12px", margin: "2px 0" }}
              >
                Valid Until: {formatDate(quotation.valid_until)}
              </p>
            )}
          </div>
        </div>

        {/* Client & Company Info */}
        <div
          className="q-info"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                color: "#16a34a",
                fontWeight: "700",
                letterSpacing: "1px",
                marginBottom: "6px",
              }}
            >
              Bill To
            </h3>
            <p
              style={{
                fontWeight: "600",
                fontSize: "14px",
                color: "#1e293b",
                margin: 0,
              }}
            >
              {quotation.client_name}
            </p>
            {quotation.company_name && (
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                {quotation.company_name}
              </p>
            )}
            {quotation.email && (
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                {quotation.email}
              </p>
            )}
            {quotation.phone && (
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                {quotation.phone}
              </p>
            )}
            {(quotation.address || quotation.city || quotation.state) && (
              <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                {[quotation.address, quotation.city, quotation.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h3
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                color: "#16a34a",
                fontWeight: "700",
                letterSpacing: "1px",
                marginBottom: "6px",
              }}
            >
              From
            </h3>
            <p
              style={{
                fontWeight: "600",
                fontSize: "14px",
                color: "#1e293b",
                margin: 0,
              }}
            >
              MAHAVAY SERVICES PRIVATE LIMITED
            </p>
            <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
              Created by: {quotation.creator?.full_name || "-"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "left",
                }}
              >
                #
              </th>
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "left",
                }}
              >
                Service / Item
              </th>
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "right",
                }}
              >
                Unit Price
              </th>
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "right",
                }}
              >
                Discount
              </th>
              {quotation.include_gst && (
                <th
                  style={{
                    background: "#16a34a",
                    color: "white",
                    padding: "10px 12px",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  GST
                </th>
              )}
              <th
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  textAlign: "right",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 12px", fontSize: "13px" }}>
                  {index + 1}
                </td>
                <td style={{ padding: "10px 12px", fontSize: "13px" }}>
                  <strong>{item.service_name}</strong>
                  {item.description && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#64748b",
                      }}
                    >
                      {item.description}
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(item.unit_price)}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    textAlign: "right",
                  }}
                >
                  {parseFloat(item.discount_percent) > 0
                    ? `${item.discount_percent}%`
                    : "-"}
                </td>
                {quotation.include_gst && (
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(item.gst_amount)}
                  </td>
                )}
                <td
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={quotation.include_gst ? 7 : 6}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div
          className="q-totals"
          style={{ marginLeft: "auto", width: "300px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
            }}
          >
            <span>Subtotal</span>
            <span>{formatCurrency(quotation.subtotal)}</span>
          </div>
          {parseFloat(quotation.total_discount) > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: "13px",
                color: "#dc2626",
              }}
            >
              <span>Discount</span>
              <span>-{formatCurrency(quotation.total_discount)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
            }}
          >
            <span>Taxable Amount</span>
            <span>{formatCurrency(quotation.taxable_amount)}</span>
          </div>
          {quotation.include_gst && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: "13px",
              }}
            >
              <span>GST</span>
              <span>{formatCurrency(quotation.total_gst)}</span>
            </div>
          )}
          <div
            className="grand"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderTop: "2px solid #16a34a",
              marginTop: "6px",
              fontSize: "16px",
              fontWeight: "700",
              color: "#16a34a",
            }}
          >
            <span>Grand Total</span>
            <span>{formatCurrency(quotation.grand_total)}</span>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div
            className="q-notes"
            style={{
              marginTop: "24px",
              padding: "14px",
              background: "#f0fdf4",
              borderLeft: "4px solid #16a34a",
              borderRadius: "4px",
            }}
          >
            <h4
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                color: "#16a34a",
                fontWeight: "700",
                marginBottom: "6px",
              }}
            >
              Notes
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "#475569",
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {quotation.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {quotation.terms_conditions && (
          <div
            className="q-terms"
            style={{
              marginTop: "14px",
              padding: "14px",
              background: "#f8fafc",
              borderRadius: "4px",
            }}
          >
            <h4
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                color: "#64748b",
                fontWeight: "700",
                marginBottom: "6px",
              }}
            >
              Terms & Conditions
            </h4>
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {quotation.terms_conditions}
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="q-footer"
          style={{
            marginTop: "40px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>
            This is a computer-generated quotation.
          </p>
          <div className="q-stamp" style={{ textAlign: "right" }}>
            <img
              src={AUTH_SIGN_URL}
              alt="Authorized Signature"
              style={{ height: "60px", marginLeft: "auto", display: "block" }}
            />
            <p
              style={{
                fontSize: "13px",
                marginTop: "4px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Authorized Signatory
            </p>
            <div
              style={{
                borderTop: "1px solid #1e293b",
                width: "180px",
                marginLeft: "auto",
                marginTop: "3px",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;
