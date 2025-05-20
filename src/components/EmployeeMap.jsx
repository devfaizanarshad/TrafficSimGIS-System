import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const EmployeeMap = () => {
  const [employees, setEmployees] = useState([]);
  const [geofences, setGeofences] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const empRes = await fetch("http://localhost:3000/api/admin/list-employees");
      const empData = await empRes.json();

      const geoRes = await fetch("http://localhost:3000/api/admin/list-geofences");
      const geoData = await geoRes.json();

      const enrichedEmployees = await Promise.all(
        empData.employees.map(async (emp) => {
          const locRes = await fetch(`http://localhost:3000/api/manager/employee/${emp.employee_id}/location`);
          const locData = await locRes.json();

          const violationRes = await fetch(`http://localhost:3000/api/manager/violations-by-employee/${emp.employee_id}`);
          const violationData = await violationRes.json();

          return {
            ...emp,
            ...locData.employeeLocations,
            violations: violationData.violations || [],
          };
        })
      );

      setEmployees(enrichedEmployees.filter((emp) => emp.latitude && emp.longitude));
      setGeofences(geoData.geofences);
    } catch (error) {
      console.error("Dashboard map error:", error);
    }
  };

  const markerIcon = (isViolating) =>
    new L.Icon({
      iconUrl: isViolating
        ? "https://cdn-icons-png.flaticon.com/512/1617/1617543.png"
        : "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [32, 32],
    });

  return (
    <div className="h-[600px] w-full bg-white rounded-lg shadow-md">
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={12}
        className="w-full h-full rounded-lg"
      >
        <TileLayer
          url="http://localhost:9090/tile/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Render Geofences */}
        {geofences.map((geo) => (
          <Polygon
            key={geo.geo_id}
            positions={geo.boundary.map((p) => [p.latitude, p.longitude])}
            pathOptions={{ color: "#FF8A8A" }}
          />
        ))}

        {/* Render Employees */}
        {employees.map((emp) => (
          <Marker
            key={emp.employee_id}
            position={[emp.latitude, emp.longitude]}
            icon={markerIcon(emp.violations.length > 0)}
          >
            <Popup>
              <div>
                <p className="font-bold">{emp.first_name} {emp.last_name}</p>
                <p>{emp.city}</p>
                {emp.violations.length > 0 && (
                  <p className="font-semibold text-red-500">Violation Active!</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EmployeeMap;
