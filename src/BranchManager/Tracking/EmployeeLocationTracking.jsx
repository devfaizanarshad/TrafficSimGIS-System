import React, { useState, useEffect, useContext } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from "react-leaflet";
import Select from "react-select";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { FiUser, FiMapPin, FiClock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


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
// Custom employee marker icons
const createEmployeeIcon = (status) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-10 h-10 rounded-full bg-white border-2 ${status === 'violating' ? 'border-red-500' : 'border-green-500'} flex items-center justify-center shadow-md">
          <FiUser class="${status === 'violating' ? 'text-red-500' : 'text-green-500'} text-lg" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status === 'violating' ? 'bg-red-500' : 'bg-green-500'} border-2 border-white"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const EmployeeTracking = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeLocations, setEmployeeLocations] = useState({});
  const [employeeGeofences, setEmployeeGeofences] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const {managerId} = useContext(MapContext);

  // Fetch employees under the manager
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/manager/${managerId}/employees`);
        setEmployees(res.data.employees);
        setSelectedEmployees([{ value: "all", label: "All Employees" }]); // Default to all
      } catch (err) {
        console.error("Error fetching employees:", err);
        toast.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, [managerId]);

  // Auto-refresh data
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchEmployeeData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedEmployees, employees]);

  // Fetch employee locations and geofences
  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const locations = {};
      const geofences = {};

      const employeesToFetch = selectedEmployees.some(e => e.value === "all") 
        ? employees 
        : employees.filter(e => selectedEmployees.some(sel => sel.value === e.employee_id));

      await Promise.all(employeesToFetch.map(async (emp) => {
        try {
          // Fetch location
          const locRes = await axios.get(
            `http://localhost:3000/api/manager/employee/${emp.employee_id}/location`
          );
          locations[emp.employee_id] = locRes.data;

          // Fetch geofences
          const geoRes = await axios.get(
            `http://localhost:3000/api/employee/my-geofences/${emp.employee_id}`
          );
          geofences[emp.employee_id] = geoRes.data.geofences;
        } catch (err) {
          console.error(`Error fetching data for ${emp.employee_id}:`, err);
        }
      }));

      setEmployeeLocations(locations);
      setEmployeeGeofences(geofences);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching employee data:", err);
      toast.error("Failed to update locations");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (selectedEmployees.length > 0) {
      fetchEmployeeData();
    }
  }, [selectedEmployees, employees]);

  // Custom styles for select dropdown
  const selectStyles = {
    control: (styles) => ({
      ...styles,
      borderRadius: "8px",
      padding: "5px",
      borderColor: "#E5E7EB",
      boxShadow: "none",
      ":hover": { borderColor: "#007bff" },
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? "#007bff" : "#fff",
      color: isSelected ? "#fff" : "#333",
      ":hover": { backgroundColor: "#f1f1f1" },
    }),
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: "#E5E7EB",
      borderRadius: "9999px",
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: "#1F2937",
      fontWeight: "500",
    }),
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm">
        <div className="flex flex-col mx-auto max-w-7xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Tracking</h1>
            <p className="text-gray-600">Real-time location monitoring</p>
          </div>
          <div className="flex items-center mt-2 space-x-4 md:mt-0">
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Within Geofence</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Violation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full gap-4 p-4 mx-auto md:flex-row max-w-7xl">
        {/* Sidebar */}
        <div className="flex flex-col w-full p-4 bg-white rounded-lg shadow md:w-80">
          {/* Employee Selection */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Select Employees</label>
            <Select
              options={[
                { value: "all", label: "All Employees" },
                ...employees.map((e) => ({
                  value: e.employee_id,
                  label: `${e.first_name} ${e.last_name}`,
                })),
              ]}
              value={selectedEmployees}
              onChange={(selected) =>
                setSelectedEmployees(selected.length ? selected : [{ value: "all", label: "All Employees" }])
              }
              isMulti
              isClearable={false}
              placeholder="Select Employees"
              styles={selectStyles}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={fetchEmployeeData}
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {isLoading ? "Refreshing..." : "Refresh Now"}
            </button>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoRefresh" className="block ml-2 text-sm text-gray-700">
                Auto-refresh every 30 seconds
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 mt-6 border-t border-gray-200">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Tracking Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employees Selected:</span>
                <span className="text-sm font-medium">
                  {selectedEmployees.some(e => e.value === "all") 
                    ? employees.length 
                    : selectedEmployees.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden bg-white rounded-lg shadow">
          <MapContainer 
            center={[33.6844, 73.0479]} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer 
              url="http://localhost:9090/tile/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {Object.keys(employeeLocations).map((empId) => {
              const emp = employees.find((e) => e.employee_id === parseInt(empId));
              const location = employeeLocations[empId]?.employeeLocations;
              const geofences = employeeGeofences[empId] || [];

              if (!location || location.latitude === undefined || location.longitude === undefined) {
                return null;
              }

              // Check if employee is violating any geofence
              const isViolating = geofences.some(geo => geo.is_violating);

              return (
                <React.Fragment key={`employee-${empId}`}>
                  <Marker
                    position={[location.latitude, location.longitude]}
                    icon={createEmployeeIcon(isViolating ? "violating" : "safe")}
                  >
<Popup>
  <div className="p-2">
    <div className="flex items-center space-x-2">
      {isViolating ? (
        <FiAlertCircle className="text-lg text-red-500" />
      ) : (
        <FiCheckCircle className="text-lg text-green-500" />
      )}
      <h3 className="text-lg font-bold">
        {emp ? `${emp.first_name} ${emp.last_name}` : "Unknown Employee"}
      </h3>
    </div>
    <div className="mt-2 space-y-1">
      <div className="flex items-center text-sm">
        <FiMapPin className="mr-2 text-gray-500" />
        <span>
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </span>
      </div>
      <div className="flex items-center text-sm">
        <FiClock className="mr-2 text-gray-500" />
        <span>
          {new Date(location.location_timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
    {isViolating && (
      <div className="mt-2 text-sm font-medium text-red-600">
        Geofence violation detected!
      </div>
    )}
    {/* Add this button */}
    <button 
      onClick={() => {
        window.location.href = `/branchmanager/TrackLocation/${empId}`;
      }}
      className="w-full px-3 py-1 mt-2 text-sm text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
    >
      View Movement History
    </button>
  </div>
</Popup>
                  </Marker>

                  {/* Display geofence boundaries */}
                  {geofences.map((geofence, idx) => (
                    <Polygon
                      key={`geofence-${empId}-${idx}`}
                      positions={geofence.geofence_boundary.map((point) => [
                        point.latitude,
                        point.longitude,
                      ])}
                      color={geofence.is_violating ? "#ef4444" : "#3b82f6"}
                      fillColor={geofence.is_violating ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"}
                      weight={2}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                        <div className="font-medium">
                          {geofence.geofence_name}
                          {geofence.is_violating && (
                            <span className="ml-1 text-red-600">(Violation)</span>
                          )}
                        </div>
                      </Tooltip>
                    </Polygon>
                  ))}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default EmployeeTracking;