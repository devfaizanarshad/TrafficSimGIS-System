import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiTrash2, FiUser, FiMap, FiClock, FiCalendar, FiMapPin } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { MapContext } from "../../Context/Context";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const AssignedGeofenceList = () => {
  const [assignedGeofences, setAssignedGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});

  const {managerId} = useContext(MapContext);

  useEffect(() => {
    fetchDropdownData();
    fetchAssignedGeofences();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const empRes = await fetch(`http://localhost:3000/api/manager/${managerId}/employees`);
      const empData = await empRes.json();
      
      setEmployees(empData.employees || []);
      
      // Create employee ID to name mapping
      const map = {};
      empData.employees?.forEach(emp => {
        map[emp.employee_id] = `${emp.first_name} ${emp.last_name}`;
      });
      setEmployeeMap(map);
    } catch (err) {
      console.error(err);
      toast.error("Error loading employee data", {
        className: "bg-red-100 text-red-800"
      });
    }
  };

  const fetchAssignedGeofences = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/manager/assigned-geofences`);
      const data = await res.json();
      setAssignedGeofences(data.geofences || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch geofence assignments", {
        className: "bg-red-100 text-red-800"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = (geoId, geofenceName) => {
    toast.info(
      <div className="p-4">
        <h3 className="text-lg font-semibold">Confirm Deactivation</h3>
        <p className="mt-2 text-gray-600">
          Remove <span className="font-medium">{geofenceName}</span> assignment?
        </p>
        <div className="flex justify-end mt-4 space-x-3">
          <button 
            onClick={() => toast.dismiss()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            onClick={async () => {
              toast.dismiss();
              try {
                const res = await fetch(
                  `http://localhost:3000/api/admin/deactivate-geofence/${geoId}`,
                  { method: "PATCH" }
                );

                if (res.ok) {
                  toast.success("Assignment removed", {
                    className: "bg-green-100 text-green-800"
                  });
                  fetchAssignedGeofences();
                } else {
                  toast.error("Failed to remove", {
                    className: "bg-red-100 text-red-800"
                  });
                }
              } catch (err) {
                toast.error("Error occurred", {
                  className: "bg-red-100 text-red-800"
                });
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        className: "rounded-xl"
      }
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleViewViolations = (employee_id, geofence_name) => {
    navigate(`http://localhost:5173/branchmanager/All-voilations`);
  };

  const filteredGeofences = assignedGeofences.filter(g => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employeeMap[g.employee_id]?.toLowerCase().includes(searchLower) ||
      g.geofence_name.toLowerCase().includes(searchLower) ||
      g.access_type.toLowerCase().includes(searchLower) ||
      formatDate(g.start_date).toLowerCase().includes(searchLower) ||
      formatDate(g.end_date).toLowerCase().includes(searchLower)
    );
  });

  // Calculate center of geofence for map view
  const getGeofenceCenter = (boundary) => {
    if (!boundary || boundary.length === 0) return [0, 0];
    
    let latSum = 0;
    let lngSum = 0;
    
    boundary.forEach(point => {
      latSum += point.latitude;
      lngSum += point.longitude;
    });
    
    return [latSum / boundary.length, lngSum / boundary.length];
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Geofence Assignments</h1>
          <p className="mt-1 text-gray-600">Manage employee geofence permissions and view boundaries</p>
        </div>

        {/* Search */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by employee, geofence, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredGeofences.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredGeofences.map((g) => {
              const center = getGeofenceCenter(g.geofence_boundary);
              const boundaryPositions = g.geofence_boundary.map(p => [p.latitude, p.longitude]);
              
              return (
                <div key={`${g.employee_id}-${g.geo_id}`} className="overflow-hidden bg-white rounded-lg shadow">
                  {/* Map Section */}
                  <div className="relative h-64 bg-gray-100">
                    <MapContainer 
                      center={center} 
                      zoom={14} 
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="http://localhost:9090/tile/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Polygon
                        positions={boundaryPositions}
                        color={g.is_violating ? "#ef4444" : "#3b82f6"}
                        fillOpacity={0.2}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold">{g.geofence_name}</h3>
                            <p className="text-sm text-gray-600">
                              {g.access_type} access for {employeeMap[g.employee_id]}
                            </p>
                          </div>
                        </Popup>
                      </Polygon>
                    </MapContainer>
                    <div className="absolute flex items-center px-2 py-1 text-xs bg-white rounded shadow-sm bottom-2 left-2">
                      <FiMapPin className="mr-1 text-blue-500" />
                      <span>{g.geofence_name}</span>
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      {/* Employee Info */}
                      <div className="flex items-center">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full">
                          <FiUser className="text-xl text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {employeeMap[g.employee_id] || `Employee ${g.employee_id}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {g.geofence_boundary.length} boundary points
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        g.access_type === "Authorized" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {g.access_type}
                      </span>
                    </div>
                    
                    {/* Time Period */}
                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center text-sm text-gray-700">
                          <FiCalendar className="mr-2 text-gray-500" />
                          <span className="font-medium">Date Range:</span>
                        </div>
                        <div className="mt-1 text-sm">
                          {formatDate(g.start_date)} to {formatDate(g.end_date)}
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center text-sm text-gray-700">
                          <FiClock className="mr-2 text-gray-500" />
                          <span className="font-medium">Time Range:</span>
                        </div>
                        <div className="mt-1 text-sm">
                          {g.start_time} - {g.end_time}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end mt-4 space-x-3">
                      <button
                          onClick={() => {
                            window.location.href = `/branchmanager/All-voilations`;
                          }} 
                       className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <FiEye className="mr-2" />
                        View Violations
                      </button>
                      <button
                          onClick={() => {
                            window.location.href = `/branchmanager/TrackLocation/${g.employee_id}`;
                          }}                         className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        <FiTrash2 className="mr-2" />
                        Tacking Employee
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-lg shadow">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
              <FiMap className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {searchTerm ? "No matching geofences found" : "No geofence assignments yet"}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try adjusting your search term" : "Assign geofences to employees to get started"}
            </p>
          </div>
        )}
      </div>

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded-lg shadow-lg p-4 m-2"
      />
    </div>
  );
};

export default AssignedGeofenceList;