import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { settingService } from "../../api/services";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  User,
  Bell,
  Shield,
  Palette,
  Building,
  FileText,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";

  const tabs = [
    { id: "profile", name: "Profile Settings", icon: User },
    ...(isSuperAdmin
      ? [
          { id: "general", name: "General Settings", icon: Building },
          { id: "quotation", name: "Quotation Settings", icon: FileText },
          { id: "appearance", name: "Appearance", icon: Palette },
        ]
      : []),
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingService.getAll();
      setSettings(res.data.data || {});
    } catch (error) {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (keys) => {
    setSaving(true);
    try {
      const data = {};
      keys.forEach((k) => {
        data[k] = settings[k] || "";
      });
      await settingService.update(data);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card h-fit">
          <div className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-secondary-50 text-secondary-600"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Profile Settings</h3>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-2xl">
                      {user?.full_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user?.full_name}</p>
                    <p className="text-secondary-500">{user?.email}</p>
                    <p className="text-sm text-secondary-400 capitalize mt-1">
                      Role: {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <p className="text-secondary-500">
                  Profile editing is managed by administrators. Contact your
                  admin for changes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "general" && isSuperAdmin && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold">General Settings</h3>
                <button
                  onClick={() => handleSave(["crm_name", "crm_tagline"])}
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">CRM Name</label>
                  <input
                    type="text"
                    value={settings.crm_name || ""}
                    onChange={(e) => handleChange("crm_name", e.target.value)}
                    className="input"
                    placeholder="Satya Sankalp"
                  />
                  <p className="text-xs text-secondary-400 mt-1">
                    This name appears in the sidebar and login page
                  </p>
                </div>
                <div>
                  <label className="label">Tagline</label>
                  <input
                    type="text"
                    value={settings.crm_tagline || ""}
                    onChange={(e) =>
                      handleChange("crm_tagline", e.target.value)
                    }
                    className="input"
                    placeholder="CRM"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quotation" && isSuperAdmin && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="font-semibold">Quotation Settings</h3>
                  <button
                    onClick={() =>
                      handleSave([
                        "quotation_logo_url",
                        "quotation_company_name",
                        "quotation_company_tagline",
                        "quotation_show_signature",
                        "quotation_signature_label",
                        "quotation_footer_text",
                      ])
                    }
                    disabled={saving}
                    className="btn-primary btn-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Company Name on Quotation</label>
                      <input
                        type="text"
                        value={settings.quotation_company_name || ""}
                        onChange={(e) =>
                          handleChange("quotation_company_name", e.target.value)
                        }
                        className="input"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="label">Company Tagline</label>
                      <input
                        type="text"
                        value={settings.quotation_company_tagline || ""}
                        onChange={(e) =>
                          handleChange(
                            "quotation_company_tagline",
                            e.target.value,
                          )
                        }
                        className="input"
                        placeholder="Enterprise Solutions"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Logo URL</label>
                    <input
                      type="text"
                      value={settings.quotation_logo_url || ""}
                      onChange={(e) =>
                        handleChange("quotation_logo_url", e.target.value)
                      }
                      className="input"
                      placeholder="/logo.png or https://..."
                    />
                    <p className="text-xs text-secondary-400 mt-1">
                      Path to logo file (place in public folder or use full URL)
                    </p>
                    {settings.quotation_logo_url && (
                      <div className="mt-2 p-3 bg-secondary-50 rounded-lg inline-block">
                        <img
                          src={settings.quotation_logo_url}
                          alt="Logo preview"
                          className="h-12"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Show Authorized Signature</label>
                      <select
                        value={settings.quotation_show_signature || "true"}
                        onChange={(e) =>
                          handleChange(
                            "quotation_show_signature",
                            e.target.value,
                          )
                        }
                        className="input"
                      >
                        <option value="true">Yes - Show signature area</option>
                        <option value="false">No - Hide signature area</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Signature Label</label>
                      <input
                        type="text"
                        value={settings.quotation_signature_label || ""}
                        onChange={(e) =>
                          handleChange(
                            "quotation_signature_label",
                            e.target.value,
                          )
                        }
                        className="input"
                        placeholder="Authorized Signatory"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Footer Text</label>
                    <textarea
                      value={settings.quotation_footer_text || ""}
                      onChange={(e) =>
                        handleChange("quotation_footer_text", e.target.value)
                      }
                      className="input"
                      rows={2}
                      placeholder="This is a computer-generated quotation."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && isSuperAdmin && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold">Appearance & Color Scheme</h3>
                <button
                  onClick={() => handleSave(["primary_color", "accent_color"])}
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primary_color || "#16a34a"}
                        onChange={(e) =>
                          handleChange("primary_color", e.target.value)
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primary_color || "#16a34a"}
                        onChange={(e) =>
                          handleChange("primary_color", e.target.value)
                        }
                        className="input flex-1"
                        placeholder="#16a34a"
                      />
                    </div>
                    <p className="text-xs text-secondary-400 mt-1">
                      Used for buttons, links, sidebar highlights
                    </p>
                  </div>
                  <div>
                    <label className="label">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accent_color || "#d97706"}
                        onChange={(e) =>
                          handleChange("accent_color", e.target.value)
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.accent_color || "#d97706"}
                        onChange={(e) =>
                          handleChange("accent_color", e.target.value)
                        }
                        className="input flex-1"
                        placeholder="#d97706"
                      />
                    </div>
                    <p className="text-xs text-secondary-400 mt-1">
                      Used for secondary highlights and accents
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <div className="flex gap-3">
                    <div
                      className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        backgroundColor: settings.primary_color || "#16a34a",
                      }}
                    >
                      Primary
                    </div>
                    <div
                      className="w-20 h-10 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        backgroundColor: settings.accent_color || "#d97706",
                      }}
                    >
                      Accent
                    </div>
                  </div>
                  <p className="text-xs text-secondary-400 mt-2">
                    Note: Color changes require a page refresh to take full
                    effect.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Notification Preferences</h3>
              </div>
              <div className="card-body space-y-4">
                {[
                  "Email notifications for new bookings",
                  "Email notifications for payment updates",
                  "Browser notifications",
                  "Daily summary emails",
                ].map((item, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg cursor-pointer"
                  >
                    <span>{item}</span>
                    <input
                      type="checkbox"
                      defaultChecked={i < 2}
                      className="rounded border-secondary-300 text-primary-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Security Settings</h3>
              </div>
              <div className="card-body">
                <div className="p-4 bg-secondary-50 rounded-lg mb-4">
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-secondary-500">
                    Last changed: Never
                  </p>
                  <button className="btn-outline btn-sm mt-2">
                    Change Password
                  </button>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-secondary-500">
                    You are currently logged in from 1 device
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
