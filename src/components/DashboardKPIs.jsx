import React, { useEffect, useState } from "react";

const DashboardKPIs = () => {
  const [stats, setStats] = useState({
    employees: 0,
    geofences: 0,
    violationsToday: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Dummy values for demo; replace with real APIs
    const employeesRes = await fetch("http://localhost:3000/api/admin/list-employees");
    const geofencesRes = await fetch("http://localhost:3000/api/admin/list-geofences");

    const employees = await employeesRes.json();
    const geofences = await geofencesRes.json();

    setStats({
      employees: employees.employees.length,
      geofences: geofences.geofences.length,
      violationsToday: Math.floor(Math.random() * 10), // replace with real endpoint later!
    });
  };

  const cardStyle = "flex flex-col justify-center items-start bg-white p-6 rounded-lg shadow transition hover:shadow-lg cursor-pointer";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className={cardStyle}>
        <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
        <p className="text-2xl font-bold text-gray-800">{stats.employees}</p>
      </div>
      <div className={cardStyle}>
        <h3 className="text-sm font-medium text-gray-500">Active Geofences</h3>
        <p className="text-2xl font-bold text-gray-800">{stats.geofences}</p>
      </div>
      <div className={cardStyle}>
        <h3 className="text-sm font-medium text-gray-500">Violations Today</h3>
        <p className="text-2xl font-bold text-red-500">{stats.violationsToday}</p>
      </div>
    </div>
  );
};

export default DashboardKPIs;
