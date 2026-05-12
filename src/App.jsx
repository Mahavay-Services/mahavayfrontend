import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import UserProfile from "./pages/users/UserProfile";
import ServiceList from "./pages/services/ServiceList";
import ServiceForm from "./pages/services/ServiceForm";
import BookingList from "./pages/bookings/BookingList";
import BookingForm from "./pages/bookings/BookingForm";
import BookingDetail from "./pages/bookings/BookingDetail";
import PaymentList from "./pages/payments/PaymentList";
import PaymentVerification from "./pages/payments/PaymentVerification";
import DocumentList from "./pages/documents/DocumentList";
import LegalModule from "./pages/legal/LegalModule";
import OperationList from "./pages/operations/OperationList";
import OperationDetail from "./pages/operations/OperationDetail";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import QuotationList from "./pages/quotations/QuotationList";
import QuotationForm from "./pages/quotations/QuotationForm";
import QuotationDetail from "./pages/quotations/QuotationDetail";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";
import NotFound from "./pages/NotFound";

const PrivateRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/users"
          element={
            <PrivateRoute roles={["super_admin", "ops_manager"]}>
              <UserList />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route path="/profile" element={<UserProfile />} />

        <Route path="/services" element={<ServiceList />} />
        <Route
          path="/services/new"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <ServiceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/services/:id/edit"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <ServiceForm />
            </PrivateRoute>
          }
        />

        <Route path="/bookings" element={<BookingList />} />
        <Route
          path="/bookings/new"
          element={
            <PrivateRoute roles={["super_admin", "sales"]}>
              <BookingForm />
            </PrivateRoute>
          }
        />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route
          path="/bookings/:id/edit"
          element={
            <PrivateRoute roles={["super_admin", "sales"]}>
              <BookingForm />
            </PrivateRoute>
          }
        />

        <Route path="/payments" element={<PaymentList />} />
        <Route
          path="/payments/verification"
          element={
            <PrivateRoute roles={["super_admin", "accounts"]}>
              <PaymentVerification />
            </PrivateRoute>
          }
        />

        <Route path="/documents" element={<DocumentList />} />
        <Route
          path="/legal"
          element={
            <PrivateRoute roles={["super_admin", "legal"]}>
              <LegalModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/legal/approvals"
          element={
            <PrivateRoute roles={["super_admin", "legal"]}>
              <LegalModule />
            </PrivateRoute>
          }
        />

        <Route
          path="/operations"
          element={
            <PrivateRoute roles={["super_admin", "ops_manager", "ops_member"]}>
              <OperationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/operations/:id"
          element={
            <PrivateRoute roles={["super_admin", "ops_manager", "ops_member"]}>
              <OperationDetail />
            </PrivateRoute>
          }
        />

        <Route path="/quotations" element={<QuotationList />} />
        <Route
          path="/quotations/new"
          element={
            <PrivateRoute roles={["super_admin", "sales"]}>
              <QuotationForm />
            </PrivateRoute>
          }
        />
        <Route path="/quotations/:id" element={<QuotationDetail />} />
        <Route
          path="/quotations/:id/edit"
          element={
            <PrivateRoute roles={["super_admin", "sales"]}>
              <QuotationForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <InvoiceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <InvoiceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <InvoiceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/:id/edit"
          element={
            <PrivateRoute roles={["super_admin"]}>
              <InvoiceForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute roles={["super_admin", "accounts"]}>
              <Reports />
            </PrivateRoute>
          }
        />

        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
