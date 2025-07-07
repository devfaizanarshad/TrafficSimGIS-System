import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCog, FaMapMarkedAlt, FaTachometerAlt, FaCogs } from "react-icons/fa";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Locations", icon: FaUserCog, path: "/map-admin" },
    { name: "Routes", icon: FaMapMarkedAlt, path: "/map-admin/route" },
    { name: "Location Layers", icon: FaCogs, path: "/map-admin/layer" },
    { name: "Create Threat", icon: FaUserCog, path: "/map-admin/createlayer" },
    { name: "Draw Polyline", icon: FaTachometerAlt, path: "/map-admin/DrawPolyline" },
    { name: "Create Layer", icon: FaUserCog, path: "/map-admin/create-layer" },
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
      <div
        className={`h-screen fixed left-0 top-0 w-64 py-3 bg-[#00288E] text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50 overflow-y-auto scrollbar-hide`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center pb-2">
          <NavLink to="/map-admin/route" onClick={() => setIsOpen(false)}>
            <img src="/icons/BIIT_MAP(1).png" className="h-40 w-50" alt="Logo" />
          </NavLink>
        </div>

        {/* Menu Items */}
        <ul className="font-medium">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <NavLink
                to={path}
                end={path === "/map-admin"}
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