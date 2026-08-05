import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  FolderOpen,
  Scale,
  Settings as SettingsIcon,
  ClipboardList,
  BarChart3,
  X,
  CheckSquare,
  UserCog,
  Receipt,
  FileText as FileInvoice,
} from "lucide-react";
import { ROLES } from "../../constants";

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: null,
    },
    { name: "Bookings", href: "/bookings", icon: FileText, roles: null },
    {
      name: "Quotations",
      href: "/quotations",
      icon: Receipt,
      roles: [ROLES.SUPER_ADMIN, ROLES.SALES],
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: FileInvoice,
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      name: "Services",
      href: "/services",
      icon: Briefcase,
      roles: [ROLES.SUPER_ADMIN, ROLES.SALES],
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
      roles: [ROLES.SUPER_ADMIN, ROLES.SALES, ROLES.ACCOUNTS],
    },
    {
      name: "Payment Verification",
      href: "/payments/verification",
      icon: CheckSquare,
      roles: [ROLES.SUPER_ADMIN, ROLES.ACCOUNTS],
    },
    {
      name: "Documents",
      href: "/documents",
      icon: FolderOpen,
      roles: [ROLES.SUPER_ADMIN, ROLES.LEGAL],
    },
    {
      name: "Legal",
      href: "/legal",
      icon: Scale,
      roles: [ROLES.SUPER_ADMIN, ROLES.LEGAL],
    },
    {
      name: "Operations",
      href: "/operations",
      icon: ClipboardList,
      roles: [ROLES.SUPER_ADMIN, ROLES.OPS_MANAGER, ROLES.OPS_MEMBER],
    },
    { name: "Users", href: "/users", icon: Users, roles: [ROLES.SUPER_ADMIN] },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: [ROLES.SUPER_ADMIN, ROLES.ACCOUNTS, ROLES.SALES],
    },
    { name: "Settings", href: "/settings", icon: SettingsIcon, roles: null },
  ];

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.role),
  );

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-secondary-200">
        <img
          src="/Mahavaylogo.png"
          alt="Mahavay CRM"
          className="w-[60px] h-[60px] rounded-xl object-contain"
        />
        <div>
          <h1 className="font-bold text-secondary-900">Mahavay CRM</h1>
          <p className="text-xs text-secondary-500">CRM</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.full_name}
            </p>
            <p className="text-xs text-secondary-500 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-secondary-500 hover:text-secondary-700 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>
    </>
  );
};

export default Sidebar;
