import { useState } from "react";
import { reportService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BarChart3,
  Calendar,
  IndianRupee,
  Users,
  FileText,
  Trophy,
  Receipt,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "collections", label: "Collections" },
  { id: "bdm-scorecard", label: "BDM Scorecard" },
  { id: "quotation-report", label: "Quotation Reports" },
  { id: "other", label: "Other Reports" },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("collections");
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start_date: "", end_date: "" });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const fetchReport = async (reportId) => {
    setLoading(true);
    setActiveReport(reportId);
    setReportData(null);
    try {
      let response;
      switch (reportId) {
        case "daily":
          response = await reportService.getDailyCollections(dateRange);
          break;
        case "monthly":
          response = await reportService.getMonthlyCollections({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
          });
          break;
        case "gst":
          response = await reportService.getGSTReport(dateRange);
          break;
        case "bdm":
          response = await reportService.getBDMRevenue(dateRange);
          break;
        case "pending":
          response = await reportService.getPendingPayments();
          break;
        case "bdm-scorecard":
          response = await reportService.getBDMScorecard(dateRange);
          break;
        case "quotation-report":
          response = await reportService.getQuotationReport(dateRange);
          break;
        case "conversion":
          response = await reportService.getBookingConversion(dateRange);
          break;
        case "split-commission":
          response = await reportService.getSplitCommission(dateRange);
          break;
        default:
          return;
      }
      setReportData(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate and view business reports"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />

      {/* Report Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setActiveReport(null);
              setReportData(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white text-primary-700 shadow-sm"
                : "text-secondary-600 hover:text-secondary-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="card-body flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, start_date: e.target.value })
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, end_date: e.target.value })
              }
              className="input"
            />
          </div>
          <button
            onClick={() => {
              if (activeReport) fetchReport(activeReport);
            }}
            className="btn-primary"
          >
            Apply Filter
          </button>
          <button
            onClick={() => setDateRange({ start_date: "", end_date: "" })}
            className="btn-outline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            {[
              { id: "daily", name: "Daily Collections", icon: Calendar },
              { id: "monthly", name: "Monthly Collections", icon: BarChart3 },
              { id: "pending", name: "Pending Payments", icon: IndianRupee },
              { id: "gst", name: "GST Report", icon: FileText },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => fetchReport(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeReport === r.id
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "bg-white border border-secondary-200 hover:bg-secondary-50"
                }`}
              >
                <r.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{r.name}</span>
              </button>
            ))}
          </div>
          <div className="lg:col-span-3">
            {loading && (
              <div className="card p-12 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
            {!loading && !reportData && (
              <div className="card p-12 text-center">
                <BarChart3 className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">
                  Select a report to view data
                </p>
              </div>
            )}
            {!loading && activeReport === "daily" && reportData && (
              <div className="card">
                <div className="card-header flex justify-between">
                  <h3 className="font-semibold">
                    Daily Collections - {reportData.date}
                  </h3>
                  <span className="font-bold text-green-600">
                    {formatCurrency(reportData.total)}
                  </span>
                </div>
                <div className="card-body">
                  <p className="text-secondary-500 mb-4">
                    {reportData.count} payments collected
                  </p>
                  <div className="space-y-2">
                    {reportData.collections?.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between p-3 bg-secondary-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {c.booking?.client_name}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {c.booking?.booking_number}
                          </p>
                        </div>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(c.received_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!loading && activeReport === "monthly" && reportData && (
              <div className="card">
                <div className="card-header flex justify-between">
                  <h3 className="font-semibold">
                    Monthly Collections - {reportData.month}/{reportData.year}
                  </h3>
                  <span className="font-bold text-green-600">
                    {formatCurrency(reportData.total)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="space-y-2">
                    {reportData.dailyBreakdown?.map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-2 border-b"
                      >
                        <span>{d.date}</span>
                        <span className="font-medium">
                          {formatCurrency(d.total)} ({d.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!loading && activeReport === "pending" && reportData && (
              <div className="card">
                <div className="card-header flex justify-between">
                  <h3 className="font-semibold">Pending Payments</h3>
                  <span className="font-bold text-red-600">
                    {formatCurrency(reportData.totalPending)}
                  </span>
                </div>
                <div className="card-body">
                  <p className="text-secondary-500 mb-4">
                    {reportData.count} bookings with pending amounts
                  </p>
                  <div className="space-y-2">
                    {reportData.bookings?.slice(0, 30).map((b) => (
                      <div
                        key={b.id}
                        className="flex justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{b.client_name}</p>
                          <p className="text-xs text-secondary-500">
                            {b.booking_number}
                          </p>
                        </div>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(b.pending_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!loading && activeReport === "gst" && reportData && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">GST Report</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-secondary-50 rounded-lg text-center">
                      <p className="text-xs text-secondary-500">Total Base</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(reportData.summary?.totalBase)}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary-50 rounded-lg text-center">
                      <p className="text-xs text-secondary-500">Total GST</p>
                      <p className="font-bold text-lg text-primary-600">
                        {formatCurrency(reportData.summary?.totalGST)}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary-50 rounded-lg text-center">
                      <p className="text-xs text-secondary-500">Total Amount</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(reportData.summary?.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BDM Scorecard Tab */}
      {activeTab === "bdm-scorecard" && (
        <div>
          {!reportData && !loading && (
            <div className="card p-8 text-center">
              <Trophy className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-600 mb-2">
                BDM Scorecard
              </h3>
              <p className="text-secondary-400 mb-4">
                View performance with 50-50 revenue split calculations
              </p>
              <button
                onClick={() => fetchReport("bdm-scorecard")}
                className="btn-primary"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Generate Scorecard
              </button>
            </div>
          )}
          {loading && (
            <div className="card p-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
          {!loading && reportData && activeReport === "bdm-scorecard" && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent-500" />
                    BDM Performance Scorecard (50-50 Split Applied)
                  </h3>
                </div>
                <div className="card-body overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary-50">
                        <th className="text-left p-3 font-semibold">#</th>
                        <th className="text-left p-3 font-semibold">
                          BDM Name
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Total Bookings
                        </th>
                        <th className="text-center p-3 font-semibold">Solo</th>
                        <th className="text-center p-3 font-semibold">
                          Split (50-50)
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Completed
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Conversion
                        </th>
                        <th className="text-right p-3 font-semibold">
                          Revenue (Split)
                        </th>
                        <th className="text-right p-3 font-semibold">
                          Collected
                        </th>
                        <th className="text-right p-3 font-semibold">
                          Pending
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Quotations
                        </th>
                        <th className="text-center p-3 font-semibold">
                          Q. Conv%
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((bdm, i) => (
                        <tr
                          key={bdm.bdm_id}
                          className={`border-b ${i === 0 ? "bg-yellow-50" : ""}`}
                        >
                          <td className="p-3">
                            {i === 0 ? (
                              <span className="text-yellow-600 font-bold">
                                🏆
                              </span>
                            ) : (
                              i + 1
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-semibold text-primary-700">
                                {bdm.bdm_name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{bdm.bdm_name}</p>
                                {bdm.employee_id && (
                                  <p className="text-xs text-secondary-400">
                                    {bdm.employee_id}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-medium">
                            {bdm.totalBookings}
                          </td>
                          <td className="p-3 text-center">
                            {bdm.soloBookings}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {bdm.splitBookings}
                            </span>
                          </td>
                          <td className="p-3 text-center text-green-600 font-medium">
                            {bdm.completedBookings}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-medium ${parseFloat(bdm.conversionRate) >= 50 ? "text-green-600" : "text-orange-500"}`}
                            >
                              {bdm.conversionRate}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold">
                            {formatCurrency(bdm.totalRevenue)}
                          </td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(bdm.collectedRevenue)}
                          </td>
                          <td className="p-3 text-right text-red-500">
                            {formatCurrency(bdm.pendingRevenue)}
                          </td>
                          <td className="p-3 text-center">
                            {bdm.quotationCount}
                          </td>
                          <td className="p-3 text-center">
                            {bdm.quotationConversion}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.length === 0 && (
                    <p className="text-center py-8 text-secondary-400">
                      No BDM data found for the selected period
                    </p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>50-50 Rule:</strong> When a booking has two BDMs
                  assigned, the revenue is split equally (50%) between both.
                  Solo bookings count 100% for the assigned BDM.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quotation Reports Tab */}
      {activeTab === "quotation-report" && (
        <div>
          {!reportData && !loading && (
            <div className="card p-8 text-center">
              <Receipt className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-600 mb-2">
                Quotation Reports
              </h3>
              <p className="text-secondary-400 mb-4">
                View quotation analytics by BDM and company
              </p>
              <button
                onClick={() => fetchReport("quotation-report")}
                className="btn-primary"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          )}
          {loading && (
            <div className="card p-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}
          {!loading && reportData && activeReport === "quotation-report" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  {
                    label: "Total",
                    value: reportData.summary?.total,
                    color: "secondary",
                  },
                  {
                    label: "Draft",
                    value: reportData.summary?.draft,
                    color: "secondary",
                  },
                  {
                    label: "Sent",
                    value: reportData.summary?.sent,
                    color: "blue",
                  },
                  {
                    label: "Accepted",
                    value: reportData.summary?.accepted,
                    color: "green",
                  },
                  {
                    label: "Rejected",
                    value: reportData.summary?.rejected,
                    color: "red",
                  },
                  {
                    label: "Total Value",
                    value: formatCurrency(reportData.summary?.totalValue),
                    color: "primary",
                    wide: true,
                  },
                  {
                    label: "Accepted Value",
                    value: formatCurrency(reportData.summary?.acceptedValue),
                    color: "green",
                    wide: true,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`p-3 bg-${s.color}-50 border border-${s.color}-200 rounded-lg text-center ${s.wide ? "col-span-2 md:col-span-1" : ""}`}
                  >
                    <p className="text-xs text-secondary-500">{s.label}</p>
                    <p className="font-bold text-lg">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* BDM-wise */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">BDM-wise Breakdown</h3>
                </div>
                <div className="card-body overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary-50">
                        <th className="text-left p-3">BDM Name</th>
                        <th className="text-center p-3">Total</th>
                        <th className="text-center p-3">Accepted</th>
                        <th className="text-center p-3">Conversion</th>
                        <th className="text-right p-3">Total Value</th>
                        <th className="text-right p-3">Accepted Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.bdmWise?.map((b, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3 font-medium">{b.bdm_name}</td>
                          <td className="p-3 text-center">{b.total}</td>
                          <td className="p-3 text-center text-green-600 font-medium">
                            {b.accepted}
                          </td>
                          <td className="p-3 text-center">
                            {b.total > 0
                              ? ((b.accepted / b.total) * 100).toFixed(0)
                              : 0}
                            %
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(b.totalValue)}
                          </td>
                          <td className="p-3 text-right text-green-600 font-medium">
                            {formatCurrency(b.acceptedValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.bdmWise?.length === 0 && (
                    <p className="text-center py-6 text-secondary-400">
                      No quotation data
                    </p>
                  )}
                </div>
              </div>

              {/* Company-wise */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Company-wise Breakdown</h3>
                </div>
                <div className="card-body overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary-50">
                        <th className="text-left p-3">Company</th>
                        <th className="text-center p-3">Total</th>
                        <th className="text-center p-3">Accepted</th>
                        <th className="text-right p-3">Total Value</th>
                        <th className="text-right p-3">Accepted Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.companyWise?.slice(0, 20).map((c, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3 font-medium">{c.company}</td>
                          <td className="p-3 text-center">{c.total}</td>
                          <td className="p-3 text-center text-green-600">
                            {c.accepted}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(c.totalValue)}
                          </td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(c.acceptedValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.companyWise?.length === 0 && (
                    <p className="text-center py-6 text-secondary-400">
                      No quotation data
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Reports Tab */}
      {activeTab === "other" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            {[
              { id: "bdm", name: "BDM Revenue", icon: Users },
              {
                id: "split-commission",
                name: "Split Commission",
                icon: IndianRupee,
              },
              {
                id: "conversion",
                name: "Booking Conversion",
                icon: TrendingUp,
              },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => fetchReport(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeReport === r.id
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "bg-white border border-secondary-200 hover:bg-secondary-50"
                }`}
              >
                <r.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{r.name}</span>
              </button>
            ))}
          </div>
          <div className="lg:col-span-3">
            {loading && (
              <div className="card p-12 flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
            {!loading && !reportData && (
              <div className="card p-12 text-center">
                <BarChart3 className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">
                  Select a report to view data
                </p>
              </div>
            )}
            {!loading && activeReport === "bdm" && reportData && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">BDM Revenue Report</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {(Array.isArray(reportData) ? reportData : []).map(
                      (bdm, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">
                              {bdm.bdm?.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {bdm.bdm?.full_name}
                              </p>
                              <p className="text-xs text-secondary-500">
                                {bdm.total_bookings} bookings
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(bdm.total_value)}
                            </p>
                            <p className="text-xs text-secondary-500">
                              Collected: {formatCurrency(bdm.collected_amount)}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
            {!loading && activeReport === "conversion" && reportData && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Booking Conversion Report</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-primary-50 rounded-lg text-center">
                      <p className="text-xs text-secondary-500">
                        Total Bookings
                      </p>
                      <p className="font-bold text-2xl">{reportData.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-xs text-secondary-500">
                        Conversion Rate
                      </p>
                      <p className="font-bold text-2xl text-green-600">
                        {reportData.conversionRate}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {reportData.stageStats?.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-3 bg-secondary-50 rounded-lg"
                      >
                        <span className="capitalize">
                          {s.current_stage?.replace("_", " ")}
                        </span>
                        <div className="flex gap-4">
                          <span className="font-medium">
                            {s.count} bookings
                          </span>
                          <span className="text-secondary-500">
                            {formatCurrency(s.total_value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!loading && activeReport === "split-commission" && reportData && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Split Commission Report</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3 mb-6">
                    {reportData.summary?.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center font-semibold text-accent-700">
                            {s.bdmUser?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {s.bdmUser?.full_name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {s.booking_count} bookings
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">
                          {formatCurrency(s.total_split)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
