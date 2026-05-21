import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { INDIAN_STATES, STATE_CODES } from "../../constants";
import toast from "react-hot-toast";

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    invoice_type: "tax",
    invoice_date: new Date().toISOString().split("T")[0],
    // Seller details
    seller_name: "Satya Sankalp Services Private Limited",
    seller_address:
      "306 Heer Aasha Arcade, Opp.sagar-sangeet-1, Sola, Sola, Ahmedabad, Ahmedabad, Gujarat, India, 380060.",
    seller_gstin: "24ABTCS5773M1ZE",
    seller_state: "Gujarat",
    seller_state_code: "24",
    // Buyer details
    buyer_name: "",
    buyer_company: "",
    buyer_address: "",
    buyer_gstin: "",
    buyer_state: "",
    buyer_state_code: "",
    buyer_email: "",
    buyer_phone: "",
    // Reference fields
    delivery_note: "",
    payment_terms: "",
    buyer_order_no: "",
    other_references: "",
    dispatch_doc_no: "",
    dispatched_through: "",
    destination: "",
    terms_of_delivery: "",
    // Bank details
    bank_holder_name: "Satya Sankalp Services Private Limited",
    bank_name: "IDFC First Bank",
    bank_account_no: "81838587898",
    bank_branch_ifsc: "IDFB0040347",
    bank_swift_code: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      sl_no: 1,
      description: "",
      hsn_sac: "",
      quantity: 1,
      rate: 0,
      per: "No",
      amount: 0,
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const servicesRes = await invoiceService.getServices();
      setServices(servicesRes.data?.data || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }

    if (isEdit) {
      try {
        const res = await invoiceService.getById(id);
        const inv = res.data.data;
        setForm({
          invoice_type: inv.invoice_type || "tax",
          invoice_date: inv.invoice_date || "",
          seller_name: inv.seller_name || "",
          seller_address: inv.seller_address || "",
          seller_gstin: inv.seller_gstin || "",
          seller_state: inv.seller_state || "",
          seller_state_code: inv.seller_state_code || "",
          buyer_name: inv.buyer_name || "",
          buyer_company: inv.buyer_company || "",
          buyer_address: inv.buyer_address || "",
          buyer_gstin: inv.buyer_gstin || "",
          buyer_state: inv.buyer_state || "",
          buyer_state_code: inv.buyer_state_code || "",
          buyer_email: inv.buyer_email || "",
          buyer_phone: inv.buyer_phone || "",
          delivery_note: inv.delivery_note || "",
          payment_terms: inv.payment_terms || "",
          buyer_order_no: inv.buyer_order_no || "",
          other_references: inv.other_references || "",
          dispatch_doc_no: inv.dispatch_doc_no || "",
          dispatched_through: inv.dispatched_through || "",
          destination: inv.destination || "",
          terms_of_delivery: inv.terms_of_delivery || "",
          bank_holder_name: inv.bank_holder_name || "",
          bank_name: inv.bank_name || "",
          bank_account_no: inv.bank_account_no || "",
          bank_branch_ifsc: inv.bank_branch_ifsc || "",
          bank_swift_code: inv.bank_swift_code || "",
          notes: inv.notes || "",
        });
        let parsedItems = inv.items;
        if (typeof parsedItems === "string") {
          try {
            parsedItems = JSON.parse(parsedItems);
          } catch (e) {
            parsedItems = [];
          }
        }
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setItems(parsedItems);
        }
      } catch (error) {
        console.error("Failed to load invoice:", error);
        toast.error("Failed to load invoice data");
      }
    }

    setLoading(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Auto-set state code when state changes
    if (field === "buyer_state" && value) {
      const code = STATE_CODES[value] || "";
      setForm((prev) => ({ ...prev, buyer_state_code: code }));
    }
  };

  const addItem = () => {
    const nextSlNo =
      items.length > 0 ? Math.max(...items.map((i) => i.sl_no || 0)) + 1 : 1;
    setItems((prev) => [
      ...prev,
      {
        sl_no: nextSlNo,
        description: "",
        hsn_sac: "",
        quantity: 1,
        rate: 0,
        per: "No",
        amount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill from service
      if (field === "description" && value) {
        const service = services.find((s) => s.service_name === value);
        if (service) {
          updated[index].hsn_sac = service.service_code || "";
          updated[index].rate = parseFloat(service.default_price);
        }
      }

      // Recalculate line item
      const item = updated[index];
      const qty = parseFloat(item.quantity) || 1;
      const rate = parseFloat(item.rate) || 0;
      updated[index].amount = qty * rate;

      return updated;
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += parseFloat(item.amount) || 0;
    });

    // Determine GST type based on state codes
    const sameState = form.seller_state_code === form.buyer_state_code;
    let cgstRate = 0,
      sgstRate = 0,
      igstRate = 0;
    let cgstAmount = 0,
      sgstAmount = 0,
      igstAmount = 0;

    // Assume 18% GST (can be made configurable per item)
    const gstRate = 18;

    if (sameState) {
      cgstRate = sgstRate = gstRate / 2;
      cgstAmount = (subtotal * cgstRate) / 100;
      sgstAmount = (subtotal * sgstRate) / 100;
    } else {
      igstRate = gstRate;
      igstAmount = (subtotal * igstRate) / 100;
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal,
      cgst_rate: cgstRate,
      cgst_amount: cgstAmount,
      sgst_rate: sgstRate,
      sgst_amount: sgstAmount,
      igst_rate: igstRate,
      igst_amount: igstAmount,
      total_tax: totalTax,
      grand_total: grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].description) {
      toast.error("Please add at least one item");
      return;
    }
    if (!form.buyer_name) {
      toast.error("Buyer name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items,
        subtotal: totals.subtotal,
        cgst_rate: totals.cgst_rate,
        cgst_amount: totals.cgst_amount,
        sgst_rate: totals.sgst_rate,
        sgst_amount: totals.sgst_amount,
        igst_rate: totals.igst_rate,
        igst_amount: totals.igst_amount,
        total_tax: totals.total_tax,
        grand_total: totals.grand_total,
        amount_in_words: numberToWords(Math.round(totals.grand_total)),
        tax_amount_in_words: numberToWords(Math.round(totals.total_tax)),
      };

      if (isEdit) {
        await invoiceService.update(id, payload);
        toast.success("Invoice updated");
      } else {
        await invoiceService.create(payload);
        toast.success("Invoice created");
      }
      navigate("/invoices");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const numberToWords = (num) => {
    // Simple number to words conversion (can be enhanced)
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
    ];
    if (num <= 10) return `INR ${ones[num] || "Zero"} Only`;
    return `INR ${num} Only`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices", href: "/invoices" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <button onClick={() => navigate("/invoices")} className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Type & Date */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Invoice Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Invoice Type *</label>
                  <select
                    value={form.invoice_type}
                    onChange={(e) =>
                      handleFormChange("invoice_type", e.target.value)
                    }
                    className="input"
                    disabled={isEdit}
                  >
                    <option value="tax">Tax Invoice</option>
                    <option value="proforma">Proforma Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="label">Invoice Date *</label>
                  <input
                    type="date"
                    value={form.invoice_date}
                    onChange={(e) =>
                      handleFormChange("invoice_date", e.target.value)
                    }
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seller Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Seller Details (Your Company)</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Company Name</label>
                  <input
                    value={form.seller_name}
                    onChange={(e) =>
                      handleFormChange("seller_name", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    value={form.seller_address}
                    onChange={(e) =>
                      handleFormChange("seller_address", e.target.value)
                    }
                    className="input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label">GSTIN</label>
                  <input
                    value={form.seller_gstin}
                    onChange={(e) =>
                      handleFormChange("seller_gstin", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    value={form.seller_state}
                    onChange={(e) =>
                      handleFormChange("seller_state", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">State Code</label>
                  <input
                    value={form.seller_state_code}
                    onChange={(e) =>
                      handleFormChange("seller_state_code", e.target.value)
                    }
                    className="input"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Buyer Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Buyer Name *</label>
                  <input
                    value={form.buyer_name}
                    onChange={(e) =>
                      handleFormChange("buyer_name", e.target.value)
                    }
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input
                    value={form.buyer_company}
                    onChange={(e) =>
                      handleFormChange("buyer_company", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address</label>
                  <textarea
                    value={form.buyer_address}
                    onChange={(e) =>
                      handleFormChange("buyer_address", e.target.value)
                    }
                    className="input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label">GSTIN</label>
                  <input
                    value={form.buyer_gstin}
                    onChange={(e) =>
                      handleFormChange("buyer_gstin", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <select
                    value={form.buyer_state}
                    onChange={(e) =>
                      handleFormChange("buyer_state", e.target.value)
                    }
                    className="input"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">State Code</label>
                  <input
                    value={form.buyer_state_code}
                    onChange={(e) =>
                      handleFormChange("buyer_state_code", e.target.value)
                    }
                    className="input"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={form.buyer_email}
                    onChange={(e) =>
                      handleFormChange("buyer_email", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    value={form.buyer_phone}
                    onChange={(e) =>
                      handleFormChange("buyer_phone", e.target.value)
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold">Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-outline btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
              <div className="card-body space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary-50 rounded-lg space-y-3"
                  >
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-1">
                        <label className="label">Sl No</label>
                        <input
                          type="number"
                          value={item.sl_no}
                          onChange={(e) =>
                            updateItem(index, "sl_no", e.target.value)
                          }
                          className="input"
                          min={1}
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="label">Description</label>
                        <SearchableSelect
                          options={services.map((s) => ({
                            value: s.service_name,
                            label: s.service_name,
                          }))}
                          value={item.description}
                          onChange={(val) =>
                            updateItem(index, "description", val)
                          }
                          placeholder="Select or type custom"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">HSN/SAC</label>
                        <input
                          value={item.hsn_sac}
                          onChange={(e) =>
                            updateItem(index, "hsn_sac", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="label">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Rate (₹)</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(index, "rate", e.target.value)
                          }
                          className="input"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <p className="font-bold text-secondary-900 py-2">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Bank Details</h3>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">A/c Holder's Name</label>
                  <input
                    value={form.bank_holder_name}
                    onChange={(e) =>
                      handleFormChange("bank_holder_name", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Bank Name</label>
                  <input
                    value={form.bank_name}
                    onChange={(e) =>
                      handleFormChange("bank_name", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">A/c No</label>
                  <input
                    value={form.bank_account_no}
                    onChange={(e) =>
                      handleFormChange("bank_account_no", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Branch & IFS Code</label>
                  <input
                    value={form.bank_branch_ifsc}
                    onChange={(e) =>
                      handleFormChange("bank_branch_ifsc", e.target.value)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">SWIFT Code</label>
                  <input
                    value={form.bank_swift_code}
                    onChange={(e) =>
                      handleFormChange("bank_swift_code", e.target.value)
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Notes</h3>
              </div>
              <div className="card-body">
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="card sticky top-6">
              <div className="card-header">
                <h3 className="font-semibold">Summary</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  {totals.cgst_amount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">
                          CGST ({totals.cgst_rate}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(totals.cgst_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">
                          SGST ({totals.sgst_rate}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(totals.sgst_amount)}
                        </span>
                      </div>
                    </>
                  )}
                  {totals.igst_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">
                        IGST ({totals.igst_rate}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(totals.igst_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-secondary-200">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-lg text-primary-600">
                      {formatCurrency(totals.grand_total)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? "Update" : "Create"} Invoice
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/invoices")}
                    className="btn-outline w-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
