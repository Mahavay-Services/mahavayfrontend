import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { invoiceService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ArrowLeft, Printer, Edit, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

const LOGO_URL = "/logo.png";
const AUTHSIGN_URL = "/authsign.png";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await invoiceService.getById(id);
      const data = res.data.data;
      let parsedItems = data.items;
      if (typeof parsedItems === "string") {
        try {
          parsedItems = JSON.parse(parsedItems);
        } catch (e) {
          parsedItems = [];
        }
      }
      setInvoice({ ...data, items: parsedItems });
    } catch (error) {
      toast.error("Failed to fetch invoice");
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
    html = html.replace(/src="\/logo\.png"/g, `src="${origin}/logo.png"`);
    html = html.replace(
      /src="\/authsign\.png"/g,
      `src="${origin}/authsign.png"`,
    );
    printWindow.document.write(`
      <html>
        <head>
          <title>${invoice.invoice_type === "proforma" ? "Proforma" : "Tax"} Invoice - ${invoice.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #1e293b; font-size: 11px; }
            .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; }
            .header { padding: 20px; border-bottom: 2px solid #1e293b; display: flex; justify-content: space-between; align-items: flex-start; }
            .header img { height: 60px; }
            .header-right { text-align: right; }
            .header-right h2 { font-size: 20px; color: #1e293b; font-weight: 700; text-transform: uppercase; }
            .header-right p { color: #64748b; font-size: 10px; margin-top: 2px; }
            .info-row { display: flex; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; }
            .info-row .left { flex: 1; padding-right: 20px; }
            .info-row .right { flex: 1; padding-left: 20px; border-left: 1px solid #e2e8f0; }
            .info-row h3 { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
            .info-row p { line-height: 1.4; color: #475569; font-size: 10px; }
            .info-row .name { font-weight: 600; color: #1e293b; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 0; }
            thead th { background: #f1f5f9; padding: 8px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e2e8f0; }
            tbody td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 10px; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-section { padding: 12px 20px; border-top: 1px solid #e2e8f0; }
            .totals-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .amount-words { background: #f0fdf4; padding: 10px; border-left: 3px solid #16a34a; }
            .amount-words label { font-size: 8px; color: #16a34a; font-weight: 700; text-transform: uppercase; }
            .amount-words p { font-size: 10px; color: #1e293b; margin-top: 4px; }
            .tax-table { width: 100%; border-collapse: collapse; }
            .tax-table th { background: #f1f5f9; padding: 6px 8px; font-size: 8px; text-transform: uppercase; border: 1px solid #e2e8f0; }
            .tax-table td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 9px; }
            .bank-details { padding: 12px 20px; border-top: 1px solid #e2e8f0; }
            .bank-details h4 { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 8px; }
            .bank-details p { font-size: 9px; color: #475569; line-height: 1.5; }
            .footer { padding: 15px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
            .footer p { font-size: 9px; color: #94a3b8; }
            .signatory { text-align: right; }
            .signatory img { height: 50px; display: block; margin-left: auto; }
            .signatory p { font-size: 10px; color: #1e293b; font-weight: 600; margin-top: 4px; }
            .signatory .line { border-top: 1px solid #1e293b; width: 150px; margin-left: auto; margin-top: 2px; }
            @media print { body { padding: 0; } .invoice-container { border: none; } }
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

  const handleDelete = async () => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted");
      navigate("/invoices");
    } catch (error) {
      toast.error("Failed to delete");
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
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${invoice.invoice_type === "proforma" ? "Proforma" : "Tax"} Invoice - ${invoice.invoice_number}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices", href: "/invoices" },
          { label: invoice.invoice_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="btn-outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <Link to={`/invoices/${id}/edit`} className="btn-outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="btn-outline text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        }
      />

      <div
        ref={printRef}
        className="invoice-container bg-white rounded-lg shadow-sm"
      >
        {/* Header */}
        <div className="header">
          <div>
            <img src={LOGO_URL} alt="Logo" />
          </div>
          <div className="header-right">
            <h2>
              {invoice.invoice_type === "proforma"
                ? "Proforma Invoice"
                : "Tax Invoice"}
            </h2>
            <p>Dated: {formatDate(invoice.invoice_date)}</p>
            <p className="mt-1">Invoice No: {invoice.invoice_number}</p>
          </div>
        </div>

        {/* Seller & Buyer Info */}
        <div className="info-row">
          <div className="left">
            <h3>Seller (Bill to)</h3>
            <p className="name">{invoice.seller_name}</p>
            <p style={{ whiteSpace: "pre-line" }}>{invoice.seller_address}</p>
            <p>GSTIN/UIN: {invoice.seller_gstin}</p>
            <p>
              State Name: {invoice.seller_state}, Code:{" "}
              {invoice.seller_state_code}
            </p>
          </div>
          <div className="right">
            <h3>Buyer (Bill to)</h3>
            <p className="name">{invoice.buyer_name}</p>
            {invoice.buyer_company && <p>{invoice.buyer_company}</p>}
            <p style={{ whiteSpace: "pre-line" }}>{invoice.buyer_address}</p>
            <p>GSTIN/UIN: {invoice.buyer_gstin}</p>
            <p>
              State Name: {invoice.buyer_state}, Code:{" "}
              {invoice.buyer_state_code}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table>
          <thead>
            <tr>
              <th className="text-center">Sl No</th>
              <th>Particulars</th>
              <th>HSN/SAC</th>
              <th className="text-center">Qty</th>
              <th className="text-center">Rate</th>
              <th className="text-center">Per</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="text-center">{item.sl_no || idx + 1}</td>
                <td>{item.description}</td>
                <td>{item.hsn_sac}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{formatCurrency(item.rate)}</td>
                <td className="text-center">{item.per || "No"}</td>
                <td className="text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} className="text-right font-bold">
                Total
              </td>
              <td className="text-right font-bold">
                {formatCurrency(invoice.subtotal)}
              </td>
            </tr>
            <tr>
              <td colSpan={6} className="text-right">
                {invoice.igst_amount > 0 ? "IGST" : "CGST + SGST"}
              </td>
              <td className="text-right">
                {invoice.igst_amount > 0
                  ? `${invoice.igst_rate}%`
                  : `${invoice.cgst_rate}% + ${invoice.sgst_rate}%`}
              </td>
            </tr>
            <tr>
              <td colSpan={6} className="text-right">
                Tax Amount
              </td>
              <td className="text-right">
                {formatCurrency(invoice.total_tax)}
              </td>
            </tr>
            <tr>
              <td colSpan={6} className="text-right font-bold text-lg">
                Amount Chargeable (in words)
              </td>
              <td className="text-right font-bold">
                {invoice.amount_in_words}
              </td>
            </tr>
            <tr>
              <td
                colSpan={6}
                className="text-right font-bold text-lg text-green-700"
              >
                E. & O.E
              </td>
              <td className="text-right font-bold text-lg text-green-700">
                {formatCurrency(invoice.grand_total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="totals-section">
          <div className="totals-grid">
            <div className="amount-words">
              <label>Tax Amount (in words)</label>
              <p>{invoice.tax_amount_in_words}</p>
            </div>
            <div>
              <table className="tax-table">
                <thead>
                  <tr>
                    <th>HSN/SAC</th>
                    <th className="text-right">Taxable Value</th>
                    <th className="text-center">Rate</th>
                    <th className="text-right">Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.hsn_sac}</td>
                      <td className="text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="text-center">
                        {invoice.igst_amount > 0
                          ? invoice.igst_rate
                          : invoice.cgst_rate * 2}
                        %
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          (item.amount *
                            (invoice.igst_amount > 0
                              ? invoice.igst_rate
                              : invoice.cgst_rate * 2)) /
                            100,
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="font-bold">Total</td>
                    <td className="text-right font-bold">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td className="text-center font-bold">
                      {invoice.igst_amount > 0
                        ? invoice.igst_rate
                        : invoice.cgst_rate * 2}
                      %
                    </td>
                    <td className="text-right font-bold">
                      {formatCurrency(invoice.total_tax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bank-details">
          <h4>Company's Bank Details</h4>
          <p>A/c Holder's Name: {invoice.bank_holder_name}</p>
          <p>Bank Name: {invoice.bank_name}</p>
          <p>A/c No: {invoice.bank_account_no}</p>
          <p>Branch & IFS Code: {invoice.bank_branch_ifsc}</p>
          {invoice.bank_swift_code && (
            <p>SWIFT Code: {invoice.bank_swift_code}</p>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <div>
            <p>This is a Computer Generated Invoice</p>
            <p>for {invoice.seller_name}</p>
          </div>
          <div className="signatory">
            <img src={AUTHSIGN_URL} alt="Authorized Signatory" />
            <p>Authorised Signatory</p>
            <div className="line"></div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="p-4 bg-secondary-50">
            <p
              className="text-xs text-secondary-600"
              style={{ whiteSpace: "pre-line" }}
            >
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
