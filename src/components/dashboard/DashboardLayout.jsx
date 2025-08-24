import DashboardSidebar from "./DashboardSidebar";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function DashboardLayout({ children, activePage = "overview" }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar activePage={activePage} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Top bar with language switcher */}
        <div className="px-6 py-4 flex justify-end">
          <LanguageSwitcher />
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
