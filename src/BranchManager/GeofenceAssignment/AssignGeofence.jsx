import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { MapContext } from "../../Context/Context";

const AssignGeofence = () => {
  const [employees, setEmployees] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("Authorized");

  const {managerId} = useContext(MapContext);

  // if (managerId == null) {

  //   managerId = localStorage.getItem('manager_id')
    
  // }

  // Fetch Employees Under This Manager
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/manager/${managerId}/employees`);
        const data = await res.json();
        console.log(data.employees);
        
        setEmployees(data.employees || []);
      } catch (error) {
        toast.error("Failed to load employees.");
        console.error(error);
      }
    };

    fetchEmployees();
  }, [managerId]);

  // Fetch All Geofences
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/list-geofences");
        const data = await res.json();
        console.log(data.geofences);

        setGeofences(data.geofences || []);
      } catch (error) {
        toast.error("Failed to load geofences.");
        console.error(error);
      }
    };

    fetchGeofences();
  }, []);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderRadius: "8px",
      minHeight: "40px",
      padding: "2px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#FF8A8A" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#333333",
      padding: "10px 12px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#FF8A8A",
      borderRadius: "4px",
      color: "#333333",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGeofence || selectedEmployees.length === 0) {
      toast.error("Please select both geofence and employees.");
      return;
    }

    const payload = {
      geoId: selectedGeofence,
      employeeIds: selectedEmployees,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      type
    };

    try {
      const res = await fetch("http://localhost:3000/api/manager/assign-geofence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      resetForm();

      if (res.ok) {
        toast.success("Geofence Assigned successfully!", { position: "top-center", autoClose: 3000 });
      } else {
        toast.error("Failed to Assigned Geofence.", { position: "top-center", autoClose: 3000 });
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedEmployees([]);
    setSelectedGeofence(null);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setType("Authorized");
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.employee_id,
    label: `${emp.first_name} ${emp.last_name}`
  }));
  
  const geofenceOptions = geofences.map(geo => ({
    value: geo.geo_id,
    label: geo.name
  }));  


  return (
    <div className="w-full h-full p-8 bg-gray-50">
      <div className="max-w-4xl p-8 mx-auto bg-white border border-gray-200 shadow-lg rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Assign Geofence</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Employees */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Employees</label>
            <Select
  isMulti
  options={employeeOptions}
  value={employeeOptions.filter(opt => selectedEmployees.includes(opt.value))}
  onChange={(selected) => setSelectedEmployees(selected.map(opt => opt.value))}
  placeholder="Select employees..."
  className="text-sm"
  styles={customSelectStyles}
/>
          </div>

          {/* Select Geofence */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Geofence</label>
            <Select
  options={geofenceOptions}
  value={geofenceOptions.find(opt => opt.value === selectedGeofence) || null}
  onChange={(selected) => setSelectedGeofence(selected.value)}
  placeholder="Select geofence..."
  className="text-sm"
  styles={customSelectStyles}
/>
          </div>

          {/* Start/End Dates */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>
          </div>

          {/* Start/End Times */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-semibold text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Access Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="Authorized">Authorized</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-600 transition bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-[#FF8A8A] rounded hover:bg-[#fb5f5f] transition"
            >
              Assign Geofence
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AssignGeofence;
