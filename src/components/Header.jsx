import { useState, useEffect, useContext } from "react";
import { FaBars } from "react-icons/fa";
import { MapContext } from "../Context/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({ appear, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenAvatar, setIsOpenAvatar] = useState(false);
  const [isDropdownAppear, setIsDropdownAppear] = useState(false);
  const { role, userName, image } = useContext(MapContext);

  const navigate = useNavigate();

  useEffect(() => {
    setIsDropdownAppear(appear);
  }, [appear]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async() => {

    try {

     const res = await axios.post(
        'http://localhost:3000/api/logout'
);

      
    } catch (error) {
      
    }
    // Clear localStorage
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("image");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("manager_id");

    // Redirect to homepage/login
    navigate("/");
  };

  const getAvatarImage = () => {
    if (image) {
      return `http://localhost:3000${image}`;
    }
    return "/icons/BIITAdmin.jpg"; // default image
  };

  return (
    <header>
      <nav className="w-full px-4 py-2 border-gray-200 lg:px-6">
        <div className="flex items-center justify-between max-w-screen-xl pt-2 mx-auto">
          <p className="text-[#393939] lg:text-2xl text-[13px] font-bold invisible sm:visible">
            Welcome {userName} <span className="text-xs">({role})</span>
          </p>

          <div className="flex items-center order-2 space-x-4 lg:order-2">
            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpenAvatar(!isOpenAvatar)}
                className="flex items-center justify-center focus:outline-none"
              >
                <img
                  className="object-cover w-8 rounded-full h-9"
                  src={getAvatarImage()}
                  alt={`${userName}'s avatar`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/icons/BIITAdmin.jpg";
                  }}
                />
                <svg
                  className="w-2.5 h-2.5 ms-3 transition-transform duration-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#777777"
                  viewBox="0 0 10 6"
                  style={{
                    transform: isOpenAvatar ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isOpenAvatar && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-[999]">
                  <ul className="py-2 text-sm text-gray-700">
                    <li
                      className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                     🔒
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
