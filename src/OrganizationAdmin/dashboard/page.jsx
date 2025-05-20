import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Fixing the icon issue (cross showing instead of marker)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Validate lat/lng
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Define Green and Red Marker Icons
const greenIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Custom green icon URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Custom red icon URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DashboardPage = () => {
  const [locations, setLocations] = useState([]);
  const [violators, setViolators] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [selectedViolation, setSelectedViolation] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const employeesRes = await fetch('http://localhost:3000/api/admin/list-employees');
        const { employees } = await employeesRes.json();
        setTotalEmployees(employees.length);

        const locs = [];
        const vioList = [];

        for (const emp of employees) {
          const locRes = await fetch(`http://localhost:3000/api/manager/employee/${emp.employee_id}/location`);
          const locData = await locRes.json();

          const { latitude, longitude } = locData.employeeLocations || {};

          // Validate coordinates before pushing
          if (isValidCoordinates(latitude, longitude)) {
            locs.push({
              ...locData.employeeLocations,
              employee: emp,
            });
          } else {
            console.warn(`Invalid location for ${emp.first_name} ${emp.last_name}`, { latitude, longitude });
          }

          const vioRes = await fetch(`http://localhost:3000/api/manager/violations-by-employee/${emp.employee_id}`);
          const vioData = await vioRes.json();

          if (vioData.violations && vioData.violations.length > 0) {
            vioList.push({
              employee: emp,
              violations: vioData.violations,
            });
          }
        }

        setLocations(locs);
        setViolators(vioList);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeEmployees = locations.length;
  const totalViolations = violators.length;

  // Update the map view when a violation is clicked
  const zoomToViolation = (lat, lng) => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.setView([lat, lng], 16); // Zoom in to the selected employee location
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-6 font-sans text-gray-800 bg-gray-50">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-3">
        <KPI title="Total Employees" value={totalEmployees} color="text-blue-500" bg="bg-blue-100" />
        <KPI title="Active Employees" value={activeEmployees} color="text-green-500" bg="bg-green-100" />
        <KPI title="Violations" value={totalViolations} color="text-red-500" bg="bg-red-100" />
      </div>

      {/* Main Section */}
      <div className="flex flex-col flex-1 gap-6 lg:flex-row">
        {/* Map */}
        <div className="flex-1 p-4 bg-white shadow-md rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-700">Employee Locations</h2>
          <div className="w-full h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              center={[33.6844, 73.0479]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => { mapRef.current = map; }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((loc, idx) => {
                // Check if employee is violating
                const isViolating = violators.some(v => v.employee.employee_id === loc.employee.employee_id);

                // Debugging: Log employee 
                //  and location
                console.log(`Employee: ${loc.employee.first_name} ${loc.employee.last_name}, Violating: ${isViolating}`);

                // Select the appropriate marker icon
                const icon = isViolating ? redIcon : greenIcon;

                return (
                  <Marker key={idx} position={[loc.latitude, loc.longitude]} icon={icon}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{loc.employee.first_name} {loc.employee.last_name}</strong><br />
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Violations List */}
        <div className="w-full lg:w-[30%] bg-white rounded-xl shadow-md p-4 max-h-[600px] overflow-y-auto">
          <h2 className="mb-4 text-xl font-bold text-gray-700">Active Violations</h2>
          {violators.length === 0 ? (
            <p className="text-center text-gray-500">No active violations 🎉</p>
          ) : (
            <ul className="space-y-4">
              {violators.map(({ employee, violations }) => (
                <li
                  key={employee.employee_id}
                  className="p-4 border-l-4 border-red-500 rounded-md shadow bg-red-50"
                  onClick={() => {
                    // Zoom the map to this employee's location when clicked
                    const { latitude, longitude } = locations.find(loc => loc.employee.employee_id === employee.employee_id) || {};
                    if (latitude && longitude) {
                      zoomToViolation(latitude, longitude);
                      setSelectedViolation(employee); // Optional: Highlight selected violation
                    }
                  }}
                >
                  <h4 className="font-semibold text-red-600">{employee.first_name} {employee.last_name}</h4>
                  <p className="text-sm text-gray-600">City: {employee.city}</p>
                  <p className="text-sm text-gray-600">Violations: {violations.length}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Toast */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

// KPI Card Component
const KPI = ({ title, value, color, bg }) => (
  <div className={`p-6 rounded-xl shadow-md ${bg} text-center`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default DashboardPage;
