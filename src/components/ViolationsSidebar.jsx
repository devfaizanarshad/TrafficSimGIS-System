import React, { useEffect, useState } from "react";

const ViolationsSidebar = () => {
  const [violators, setViolators] = useState([]);

  useEffect(() => {
    fetchViolators();
    const interval = setInterval(fetchViolators, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchViolators = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/list-employees");
      const { employees } = await res.json();

      const violatorsList = [];

      await Promise.all(
        employees.map(async (emp) => {
          const violationRes = await fetch(`http://localhost:3000/api/manager/violations-by-employee/${emp.employee_id}`);
          const violationData = await violationRes.json();

          if (violationData.violations && violationData.violations.length > 0) {
            violatorsList.push({
              ...emp,
              violations: violationData.violations,
            });
          }
        })
      );

      setViolators(violatorsList);
    } catch (error) {
      console.error("Error fetching violators:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[600px] overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Violations Alert</h3>

      {violators.length === 0 ? (
        <p className="text-sm text-gray-500">No active violations</p>
      ) : (
        <ul className="space-y-4">
          {violators.map((v) => (
            <li key={v.employee_id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{v.first_name} {v.last_name}</p>
                <p className="text-xs text-gray-500">{v.city}</p>
              </div>
              <span className="text-xs font-semibold text-red-600">{v.violations.length} Violations</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViolationsSidebar;
