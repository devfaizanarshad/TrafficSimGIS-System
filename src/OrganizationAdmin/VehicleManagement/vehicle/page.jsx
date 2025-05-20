import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { FiPlus, FiEdit, FiSearch, FiEye, FiTrash2 } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

const VehicleTable = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 8;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/list-vehicles");
        if (response.data && Array.isArray(response.data.vehicles)) {
          setVehicles(response.data.vehicles);
        } else {
          setError("Invalid data format received");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError("Failed to fetch vehicles. Please try again.");
        setLoading(false);
        toast.error("Failed to load vehicles");
      }
    };
    
    fetchVehicles();
  }, []);

  const deleteVehicle = async (vehicle) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
        <p className="mt-2 text-gray-600">
          Are you sure you want to delete <span className="font-medium">{vehicle.model}</span> ({vehicle.year})?
        </p>
        <div className="flex justify-end mt-4 space-x-3">
          <button 
            onClick={() => toast.dismiss()}
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white transition bg-red-600 rounded-md hover:bg-red-700"
            onClick={async () => {
              toast.dismiss();
              try {
                const response = await axios.patch(
                  `http://localhost:3000/api/admin/deactivate-vehicle/${vehicle.vehicle_id}`
                );

                if (response.status === 200) {
                  setVehicles(vehicles.filter((v) => v.vehicle_id !== vehicle.vehicle_id));
                  toast.success("Vehicle deleted successfully!");
                } else {
                  toast.error("Failed to delete vehicle");
                }
              } catch (error) {
                console.error("Error deleting vehicle:", error);
                toast.error("An error occurred while deleting the vehicle");
              }
            }}
          >
            Confirm Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: "rounded-xl shadow-lg"
      }
    );
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.model.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? vehicle.is_available.toString() === filter : true)
  );

  // Pagination logic
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white shadow-md rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Data</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="mt-1 text-gray-600">Manage your fleet of vehicles</p>
          </div>
          
          <NavLink
            to="/admin/create-vehicle"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="w-5 h-5 mr-2 -ml-1" />
            Add Vehicle
          </NavLink>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Vehicles</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVehicles.length > 0 ? (
                  currentVehicles.map((vehicle) => (
                    <tr key={vehicle.vehicle_id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {vehicle.image && (
                            <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-md">
                              <img 
                                src={`http://localhost:3000${vehicle.image}`} 
                                alt={vehicle.model}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vehicle.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{vehicle.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vehicle.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-600 transition-colors rounded-full hover:text-blue-900 hover:bg-blue-50"
                            title="View details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          <NavLink
                            to={`/admin/edit-vehicle/${vehicle.vehicle_id}`}
                            className="p-2 text-green-600 transition-colors rounded-full hover:text-green-900 hover:bg-green-50"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </NavLink>
                          <button
                            onClick={() => deleteVehicle(vehicle)}
                            className="p-2 text-red-600 transition-colors rounded-full hover:text-red-900 hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 className="w-5 h-5" />
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
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No vehicles found</h3>
                        <p className="mt-1 text-gray-500">
                          {search || filter ? "Try adjusting your search or filter" : "No vehicles have been added yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredVehicles.length > vehiclesPerPage && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstVehicle + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastVehicle, filteredVehicles.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredVehicles.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number 
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-trasparent bg-opacity-50"
      >
        {selectedVehicle && (
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  {selectedVehicle.image && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={`http://localhost:3000${selectedVehicle.image}`}
                        alt={selectedVehicle.model}
                        className="object-contain w-full h-auto"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Model</h4>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{selectedVehicle.model}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Year</h4>
                      <p className="mt-1 text-lg text-gray-900">{selectedVehicle.year}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedVehicle.is_available ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedVehicle.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!rounded-lg !shadow-lg !p-4 !m-2"
      />
    </div>
  );
};

export default VehicleTable;