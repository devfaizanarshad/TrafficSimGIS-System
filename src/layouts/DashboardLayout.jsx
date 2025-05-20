import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar - Fixed for Mobile, Static for Desktop */}
      <div
        className={`fixed md:relative z-50 md:w-64 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto bg-white">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
