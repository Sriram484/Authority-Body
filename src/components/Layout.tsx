// src/layout/Layout.tsx (or wherever this file lives)
import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Building2,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
}) => {
  const { user, role, logout } = useAuth();
  const [mobileProfileOpen, setMobileProfileOpen] = React.useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const navigationItems = [
    {
      id: "dashboard",
      label: t("layout.nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "certificates",
      label: t("layout.nav.certificates"),
      icon: FileCheck,
    },
    { id: "claims", label: t("layout.nav.claims"), icon: FileText },
    { id: "agencies", label: t("layout.nav.agencies"), icon: Building2 },
    { id: "courses", label: t("layout.nav.courses"), icon: BookOpen },
    { id: "profile", label: t("layout.nav.profile"), icon: User },
    { id: "bulk", label: t("layout.nav.bulkUpload"), icon: User },
  ];

  const primaryNavItems = navigationItems.slice(0, 5); // for mobile bottom nav

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== DESKTOP SIDEBAR (md+) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {t("layout.brand.title")}
            </h1>
            <p className="text-base text-gray-500">
              {t("layout.brand.subtitle")}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full rounded-lg text-xl font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="flex-1 text-left break-words leading-snug">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Language + User / logout bottom block */}
        <div className="border-t border-gray-200 px-4 py-3 space-y-3">
          {/* Language selector */}
          <div>
            <label className="block text-base font-semibold text-gray-500 mb-1">
              {t("layout.language.label")}
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "en" | "hi" | "ta" | "bn")
                }
                className="w-full text-sm rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              >
                <option value="en">{t("layout.language.options.en")}</option>
                <option value="hi">{t("layout.language.options.hi")}</option>
                <option value="ta">{t("layout.language.options.ta")}</option>
                <option value="bn">{t("layout.language.options.bn")}</option>
              </select>
            </div>
          </div>

          {/* User + logout */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-900 truncate">
                {user?.email || t("layout.userBlock.fallbackEmailName")}
              </span>
              <span className="text-sm text-gray-500 truncate">
                {role || t("layout.userBlock.fallbackRole")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("profile")}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === "profile"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* MOBILE TOP BAR (md:hidden) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="relative flex justify-between items-center px-4 h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {t("layout.brand.title")}
                </h1>
              </div>
            </div>

            {/* Profile button instead of menu */}
            <div className="relative">
              <button
                onClick={() => setMobileProfileOpen((v) => !v)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <User className="w-6 h-6" />
              </button>

              {mobileProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setMobileProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                      currentPage === "profile"
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{t("layout.mobileMenu.viewProfile")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("layout.mobileMenu.logout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8 pt-20 md:pt-8 pb-20 md:pb-8">
            {children}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV (5 items only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="flex justify-around items-center h-16">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileProfileOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "text-blue-700" : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {/* Short label for mobile (first word still fine) */}
                  <span className="text-xs font-medium">
                    {item.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
