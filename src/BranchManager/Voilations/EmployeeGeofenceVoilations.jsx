import React, { useEffect, useState } from "react";

const EmployeeGeoViolations = () => {
  const [empViolations, setEmpViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeId = 1;
  const geoId = 1;

  useEffect(() => {
    const fetchEmployeeViolations = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/manager/violations-by-employee/${employeeId}`);
        const data = await res.json();
        const filtered = (data.violations || []).filter(emp => emp.geo_id === geoId);
        setEmpViolations(filtered);
      } catch (error) {
        console.error("Error fetching violations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeViolations();
  }, [employeeId]);

  const formatDate = (datetimeStr) => {
    const date = new Date(datetimeStr);
    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="w-full min-h-screen p-6 overflow-auto bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-10 text-3xl font-bold text-center text-gray-800">
          Employee Geofence Violations
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : empViolations.length === 0 ? (
          <p className="text-center text-gray-500">No violations found for this geofence.</p>
        ) : (
          <div className="space-y-6">
            {empViolations.map((emp, index) => {
              const { date, time } = formatDate(emp.violation_time);

              return (
                <div
                  key={index}
                  className="p-6 transition bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold text-gray-800">Violation #{index + 1}</h2>
                      <span className="text-sm text-gray-500">Geo ID: {emp.geo_id}</span>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full">
                      {emp.violation_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
                    <div>
                      <label className="font-semibold">Geofence Name</label>
                      <p>{emp.geo_name}</p>
                    </div>

                    <div>
                      <label className="font-semibold">Violation Date</label>
                      <p>{date}</p>
                    </div>

                    <div>
                      <label className="font-semibold">Violation Time</label>
                      <p>{time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeGeoViolations;
