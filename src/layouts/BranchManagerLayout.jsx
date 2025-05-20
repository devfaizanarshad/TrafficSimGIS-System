import React, { useState } from "react";
import Sidebar from "../components/BranchManager/Sidebar";
import Header from "../components/Header";

const BranchDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar - Fixed for Mobile, Static for Desktop */}
      <div
        className={`fixed md:relative z-50 md:w-64 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 ">
        {/* Header */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          <div
            id="map-container"
            className="h-[calc(100vh-64px)] md:w-[calc(100%)] w-full"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboardLayout;
