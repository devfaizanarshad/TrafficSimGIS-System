import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCog, FaMapMarkedAlt, FaCar, FaBuilding, FaUsers, FaTachometerAlt, FaCogs } from "react-icons/fa";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "/admin/dashboard" },
    { name: "Users", icon: FaUserCog, path: "/admin/user-management" },
    { name: "Geofences", icon: FaMapMarkedAlt, path: "/admin/geofence-management" },
    { name: "Vehicles", icon: FaCar, path: "/admin/vehicle-management" },
    { name: "Branches", icon: FaBuilding, path: "/admin/branch-management" },
    { name: "User Layers ", icon: FaUsers, path: "/admin/assign-layer-to-user" },
    { name: "Assigned Layers", icon: FaCogs, path: "/admin/assign-layer" },
    ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed z-50 w-8 h-6 p-1 top-4 left-4 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block h-0.5 w-full transition-transform ${isOpen ? "rotate-45 translate-y-2 bg-white" : "bg-black"}`} />
        <span className={`block h-0.5 w-full transition-opacity ${isOpen ? "opacity-0" : "bg-black"}`} />
        <span className={`block h-0.5 w-full transition-transform ${isOpen ? "-rotate-45 -translate-y-2 bg-white" : "bg-black"}`} />
      </button>

      {/* Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setIsOpen(false)} />} 

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-64 h-screen bg-[#00288E] text-white transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-50`}>
        {/* Logo */}
        <div className="flex justify-center py-3">
          <NavLink to="/admin/dashboard" onClick={() => setIsOpen(false)}>
            <img src="/icons/BIIT_MAP(1).png" className="h-40" alt="Logo" />
          </NavLink>
        </div>

        {/* Menu Items */}
        <ul className="mt-[-10px] font-medium">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                className={({ isActive }) => `flex items-center p-3 ${isActive ? "bg-[#FF9100]" : "hover:bg-[#FF9100]"}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 ml-4" />
                <span className="ml-4">{name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

      </div>
    </>
  );
};

export default SideBar;
