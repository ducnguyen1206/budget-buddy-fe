import { useState } from "react";
import { Menu } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function DashboardLayout({ children, activePage = "overview" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <DashboardSidebar
          activePage={activePage}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto w-full">
        {/* Top bar with hamburger menu and language switcher */}
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Hamburger menu - visible on mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Spacer for desktop */}
          <div className="hidden lg:block" />
          
          <LanguageSwitcher />
        </div>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
