import {
  LayoutDashboard,
  Building2,
  Coins,
  PieChart,
  List,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

export default function DashboardSidebar({ activePage = "overview" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      label: t("dashboard.nav.overview"),
      path: "/dashboard",
    },
    {
      id: "accounts",
      icon: Building2,
      label: t("dashboard.nav.accounts"),
      path: "/accounts",
    },
    {
      id: "transactions",
      icon: Coins,
      label: t("dashboard.nav.transactions"),
      path: "/transactions",
    },
    {
      id: "budgets",
      icon: PieChart,
      label: t("dashboard.nav.budgets"),
      path: "/budgets",
    },
    {
      id: "categories",
      icon: List,
      label: t("dashboard.nav.categories"),
      path: "/categories",
    },
  ];

  return (
    <div className="w-64 h-screen bg-blue-50 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center justify-center space-x-3">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Budget Buddy Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-xl font-bold text-gray-800 leading-none">
            {t("header.brandName")}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.id === activePage;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-700" : "text-gray-600"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-blue-100">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors">
          <LogOut className="w-5 h-5 text-gray-600" />
          <span className="font-medium">{t("auth.signOut")}</span>
        </button>
      </div>
    </div>
  );
}
