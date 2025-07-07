import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserShield, FaMap, FaCarSide, FaWarehouse, FaMapMarkerAlt, FaChartBar, FaCog, FaUserCheck } from "react-icons/fa";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Assign Geofence", icon: FaMapMarkerAlt, path: "/branchmanager/assign-geofence" },
    { name: "Geofence List", icon: FaMap, path: "/branchmanager/assign-geofence/all" },
    { name: "Assign Vehicle", icon: FaCarSide, path: "/branchmanager/assign-vehicle" },
    { name: "Vehicle List", icon: FaWarehouse, path: "/branchmanager/assign-vehicle/all" },
    { name: "Tracking", icon: FaUserShield, path: "/branchmanager/employees-location-tracking" },
    { name: "Voilations", icon: FaUserCheck, path: "/branchmanager/All-voilations" },
    { name: "All Movements", icon: FaChartBar, path: "/branchmanager/MovementHistory/all" }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed z-50 flex flex-col justify-between w-8 h-6 p-1 top-4 left-4 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block h-0.5 w-full transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-2 bg-white" : "bg-black"}`} />
        <span className={`block h-0.5 w-full transition-opacity duration-300 ${isOpen ? "opacity-0" : "bg-black"}`} />
        <span className={`block h-0.5 w-full transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-2 bg-white" : "bg-black"}`} />
      </button>

      {/* Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setIsOpen(false)} />} 

      {/* Sidebar */}
      <div className={`h-screen fixed left-0 top-0 w-64 py-3 bg-[#00288E] text-white transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-50`}>
        <div className="flex items-center justify-center pb-2">
          <NavLink to="/branchmanager/assign-geofence/all" onClick={() => setIsOpen(false)}>
            <img src="/icons/BIIT_MAP(1).png" className="h-40 w-50" alt="Logo" />
          </NavLink>
        </div>

        <ul className="font-medium">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center w-full p-3 ${isActive ? "bg-[#FF9100] text-white" : "hover:bg-[#FF9100]"}`
                }
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