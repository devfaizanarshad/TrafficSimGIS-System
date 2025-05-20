import React, { useEffect, useState, useContext } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import { MapContext } from "../../Context/Context";

const AssignVehicle = () => {
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const {managerId} = useContext(MapContext);

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/manager/${managerId}/employees`);
        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (error) {
        toast.error("Failed to load employees.");
        console.error(error);
      }
    };
    fetchEmployees();
  }, [managerId]);

  // Fetch Vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/list-vehicles`);
        const data = await res.json();
        setVehicles(data.vehicles || []);
        console.log(data.vehicles);
        
      } catch (error) {
        toast.error("Failed to load vehicles.");
        console.error(error);
      }
    };
    fetchVehicles();
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
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedEmployee || !selectedVehicle) {
      toast.error("Please select both an employee and a vehicle.");
      return;
    }

    const payload = {
      employeeId: selectedEmployee.value,
      vehicleId: selectedVehicle.value
    };

    try {
      const res = await fetch(`http://localhost:3000/api/manager/assign-vehicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

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
    setSelectedEmployee(null);
    setSelectedVehicle(null);
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp.employee_id,
    label: `${emp.first_name} ${emp.last_name}`
  }));

  const vehicleOptions = vehicles.map((veh) => ({
    value: veh.vehicle_id,
    label: `${veh.model} (${veh.year})`
  }));

  return (
    <div className="w-full h-full p-8 bg-gray-50">
      <div className="max-w-4xl p-8 mx-auto bg-white border border-gray-200 shadow-lg rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Assign Vehicle</h2>

        <form onSubmit={handleAssign} className="space-y-6">
          {/* Select Employee */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Employee</label>
            <Select
              options={employeeOptions}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Select an employee..."
              className="text-sm"
              styles={customSelectStyles}
            />
          </div>

          {/* Select Vehicle */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Vehicle</label>
            <Select
              options={vehicleOptions}
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              placeholder="Select a vehicle..."
              className="text-sm"
              styles={customSelectStyles}
            />
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
              Assign Vehicle
            </button>
          </div>
        </form>
      </div>
    <ToastContainer />
      
    </div>
  );
};

export default AssignVehicle;
