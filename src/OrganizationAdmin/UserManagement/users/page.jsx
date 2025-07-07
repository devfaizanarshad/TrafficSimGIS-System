import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { 
  FiPlus, 
  FiEdit, 
  FiSearch, 
  FiEye, 
  FiTrash2, 
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiCalendar
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

// Custom modal styles
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90%',
    width: '600px',
    borderRadius: '12px',
    padding: '0',
    border: 'none',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  }
};

const UserDetails = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      ariaHideApp={false}
    >
      <div className="relative p-6">
        <button
          className="absolute text-gray-500 transition top-4 right-4 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        
        <div className="flex items-start space-x-6">
          {user.image ? (
            <img 
              src={`http://localhost:3000${user.image}`} 
              alt={user.username}
              className="object-cover w-24 h-24 border-2 border-gray-200 rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-24 h-24 text-3xl text-gray-600 bg-gray-100 rounded-full">
              <FiUser size={32} />
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
            <div className="inline-block px-3 py-1 mt-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
              {user.role}
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <FiMail className="mr-3 text-gray-500" />
                <span className="text-gray-700">{user.email}</span>
              </div>
              
              <div className="flex items-center">
                <FiPhone className="mr-3 text-gray-500" />
                <span className="text-gray-700">{user.phone || "Not provided"}</span>
              </div>
              
              <div className="flex items-center">
                <FiMapPin className="mr-3 text-gray-500" />
                <span className="text-gray-700">
                  {user.city || "Not provided"}, {user.address || "Address not provided"}
                </span>
              </div>
              
              <div className="flex items-center">
                <FiCalendar className="mr-3 text-gray-500" />
                <span className="text-gray-700">
                  Joined on {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/list-users");
        setUsers(response.data.users);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
        toast.error("Failed to load users");
      }
    };
    
    fetchUsers();
  }, []);

  const deleteUser = async (user) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
        <p className="mt-2 text-gray-600">
          Are you sure you want to delete <span className="font-medium">{user.username}</span>?
        </p>
        <div className="flex justify-end mt-4 space-x-3">
          <button 
            onClick={() => toast.dismiss()}
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white transition bg-red-500 rounded-md hover:bg-red-600"
            onClick={async () => {
              toast.dismiss();
              try {
                const response = await axios.patch(
                  `http://localhost:3000/api/admin/deactivate-user/${user.user_id}`
                );

                if (response.status === 200) {
                  setUsers(users.filter((u) => u.user_id !== user.user_id));
                  toast.success("User deactivated successfully!");
                } else {
                  toast.error("Failed to deactivate user");
                }
              } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("An error occurred while deactivating the user");
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false
      }
    );
  };

    const hideUser = async (user) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Hiding User</h3>
        <p className="mt-2 text-gray-600">
          Are you sure you want to Hide <span className="font-medium">{user.username}</span>?
        </p>
        <div className="flex justify-end mt-4 space-x-3">
          <button 
            onClick={() => toast.dismiss()}
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white transition bg-red-500 rounded-md hover:bg-red-600"
            onClick={async () => {
              toast.dismiss();
              try {
                const response = await axios.patch(
                  `http://localhost:3000/api/admin/hide-employee/${user.employee_id}`
                );

                if (response.status === 200) {
                  toast.success("User Hiden successfully!");
                } else {
                  toast.error("Failed to Hide user");
                }
              } catch (error) {
                console.error("Error Hiding user:", error);
                toast.error("An error occurred while Hidding the user");
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false
      }
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username?.toLowerCase().includes(search.toLowerCase()) ||
       user.email?.toLowerCase().includes(search.toLowerCase())) &&
      (filter ? user.role === filter : true)
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-white">
        <div className="max-w-md p-6 text-center bg-red-100 rounded-lg">
          <p className="font-medium text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white transition bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between mb-8 space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">Manage all registered users in the system</p>
          </div>
          
          <NavLink
            to="/admin/create-user"
            className="flex items-center px-5 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            <FiPlus className="mr-2" size={18} />
            Add New User
          </NavLink>
        </div>

        {/* Filters */}
        <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.user_id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image ? (
                            <img 
                              src={`http://localhost:3000${user.image}`} 
                              alt={user.username}
                              className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full">
                              <FiUser className="text-indigo-600" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{`${user.first_name} ${user.last_name}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 transition hover:text-indigo-900"
                            title="View details"
                          >
                            <FiEye size={18} />

                          </button>

{user.role.toLowerCase() === 'employee'?(
    <button
  onClick={() => hideUser(user)}
  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
    user.is_hidden
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-red-100 text-red-800 hover:bg-red-200"
  }`}
  title={user.is_hidden ? "Show this user" : "Hide this user from view"}
>
  {user.is_hidden ? "Show User" : "Hide User"}
</button>
)
:
(
<button
  disabled
  className="px-3 py-1 text-sm font-medium text-gray-400 bg-gray-100 rounded cursor-not-allowed"
  title="User visibility cannot be modified for managers"
>
  {user.is_hidden ? "Show User" : "Hide User"}
</button>
)
  
}



                          <button
                            onClick={() => deleteUser(user)}
                            className="text-red-600 transition hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiUser className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
                        <p className="mt-1 text-gray-500">
                          {search || filter ? "Try adjusting your search or filter" : "No users in the system yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetails 
          user={selectedUser} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserTable;