import React, { useEffect, useState } from "react";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiPlus, FiMapPin } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavLink } from "react-router-dom";

const ListGeofences = () => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGeofences();
  }, []);

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/admin/list-geofences");
      const data = await response.json();
      setGeofences(data.geofences || []);
    } catch (error) {
      console.error("Error fetching geofences:", error);
      toast.error("Failed to fetch geofences");
    } finally {
      setLoading(false);
    }
  };

  const deleteGeofence = async (geo_id, name) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
        <p className="mt-2 text-gray-600">
          Are you sure you want to delete <span className="font-medium">{name}</span>?
        </p>
        <div className="flex justify-end mt-4 space-x-3">
          <button 
            onClick={() => toast.dismiss()}
            className="px-2 py-2 text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white transition bg-red-600 rounded-md hover:bg-red-700"
            onClick={async () => {
              toast.dismiss();
              try {
                const res = await fetch(
                  `http://localhost:3000/api/admin/deactivate-geofence/${geo_id}`, 
                  { method: "PATCH" }
                );

                if (res.ok) {
                  toast.success("Geofence deleted successfully!");
                  setGeofences(geofences.filter((g) => g.geo_id !== geo_id));
                } else {
                  toast.error("Failed to delete geofence");
                }
              } catch (error) {
                console.error("Error deleting geofence:", error);
                toast.error("An error occurred while deleting");
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

  const filteredGeofences = geofences.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading geofences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Geofence Management</h1>
            <p className="mt-1 text-gray-600">View and manage all geofence boundaries</p>
          </div>
          
          <NavLink
            to="/admin/create-geofence"
            className="flex items-center px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md mt-4 md:mt-0"
          >
            <FiPlus className="mr-2" size={18} />
            Add New Geofence
          </NavLink>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search geofences by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Geofence Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Boundary Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGeofences.length > 0 ? (
                  filteredGeofences.map((geo) => (
                    <tr key={geo.geo_id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full">
                            <FiMapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{geo.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {geo.boundary.length} points
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(geo.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-3">
                          <NavLink
                            to={`/admin/view-geofence/${encodeURIComponent(geo.name)}`}
                            className="p-2 text-blue-600 transition-colors rounded-full hover:text-blue-900 hover:bg-blue-50"
                            title="View details"
                          >
                            <FiEye className="w-5 h-5" />
                          </NavLink>
                          {/* <NavLink
                            to={`/admin/edit-geofence/${geo.geo_id}`}
                            className="p-2 text-green-600 transition-colors rounded-full hover:text-green-900 hover:bg-green-50"
                            title="Edit"
                          >
                            <FiEdit className="w-5 h-5" />
                          </NavLink> */}
                          <button
                            onClick={() => deleteGeofence(geo.geo_id, geo.name)}
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
                        <FiMapPin className="w-12 h-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No geofences found</h3>
                        <p className="mt-1 text-gray-500">
                          {search ? "Try adjusting your search" : "No geofences have been created yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

export default ListGeofences;