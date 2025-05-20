import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { FiPlus, FiEdit, FiSearch, FiEye, FiTrash2 } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BranchTable = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const branchesPerPage = 8;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/list-branches");
        setBranches(response.data.branches || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setError("Failed to fetch branches. Please try again.");
        setLoading(false);
        toast.error("Failed to load branches");
      }
    };
    
    fetchBranches();
  }, []);

  const deleteBranch = async (branch) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
        <p className="mt-2 text-gray-600">
          Are you sure you want to delete <span className="font-medium">{branch.name}</span>?
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
                  `http://localhost:3000/api/admin/deactivate-branch/${branch.branch_id}`
                );

                if (response.status === 200) {
                  setBranches(branches.filter((b) => b.branch_id !== branch.branch_id));
                  toast.success("Branch deactivated successfully!");
                } else {
                  toast.error("Failed to deactivate branch");
                }
              } catch (error) {
                console.error("Error deleting branch:", error);
                toast.error("An error occurred while deactivating the branch");
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

  const filteredBranches = branches.filter(branch =>
    branch.name?.toLowerCase().includes(search.toLowerCase()) ||
    branch.address?.toLowerCase().includes(search.toLowerCase()) ||
    branch.phoneno?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastBranch = currentPage * branchesPerPage;
  const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirstBranch, indexOfLastBranch);
  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading branches...</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Branch Management</h1>
            <p className="text-gray-600">View and manage all branches in the system</p>
          </div>
          
          <NavLink
            to="/admin/create-branch"
            className="flex items-center px-5 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            <FiPlus className="mr-2" size={18} />
            Add New Branch
          </NavLink>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search branches by name, address or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Branch Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBranches.length > 0 ? (
                  currentBranches.map((branch) => (
                    <tr key={branch.branch_id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{branch.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{branch.phoneno}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-3">
                          <NavLink
                            to={`/admin/branch-details/${branch.branch_id}`}
                            className="text-indigo-600 transition hover:text-indigo-900"
                            title="View details"
                          >
                            <FiEye size={18} />
                          </NavLink>
                          <NavLink
                            to={`/admin/edit-branch/${branch.branch_id}`}
                            className="text-green-600 transition hover:text-green-900"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </NavLink>
                          <button
                            onClick={() => deleteBranch(branch)}
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
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FiSearch className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No branches found</h3>
                        <p className="mt-1 text-gray-500">
                          {search ? "Try adjusting your search query" : "No branches in the system yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredBranches.length > branchesPerPage && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstBranch + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastBranch, filteredBranches.length)}
                </span>{' '}
                of <span className="font-medium">{filteredBranches.length}</span> branches
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default BranchTable;