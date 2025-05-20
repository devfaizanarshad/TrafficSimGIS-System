import React, { useContext, useEffect, useState } from "react";
import { FaSearch, FaEye, FaUser, FaCar } from "react-icons/fa";
import { BsClock } from "react-icons/bs";import Select from "react-select";
import toast from "react-hot-toast";
import { MapContext } from "../../Context/Context";

const AssignedVehicles = () => {
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const {managerId} = useContext(MapContext);


  // Fetch assigned vehicles
  useEffect(() => {
    const fetchAssignedVehicles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/manager/assigned-vehicles");
        const data = await res.json();

        setAssignedVehicles(data.vehicles || []);
        setFilteredVehicles(data.vehicles || []);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load assigned vehicles.");
        setLoading(false);
      }
    };

    fetchAssignedVehicles();
  }, []);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/manager/${managerId}/employees`);
        const data = await res.json();

        console.log(data.employees);
        
        setEmployees(data.employees || []);
      } catch (error) {
        toast.error("Failed to load employees.");
      }
    };

    fetchEmployees();
  }, []);

  // Fetch all vehicles list
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/admin/list-vehicles`);
        const data = await res.json();
        

        setVehicles(data.vehicles || []);
      } catch (error) {
        toast.error("Failed to load vehicles.");
      }
    };

    fetchVehicles();
  }, []);

  // Handle Filters
  useEffect(() => {
    let filtered = [...assignedVehicles];

    if (selectedEmployee) {
      filtered = filtered.filter(
        (v) => v.employee_id === selectedEmployee.value
      );
    }

    if (selectedVehicle) {
      filtered = filtered.filter(
        (v) => v.vehicle_id === selectedVehicle.value
      );
    }

    setFilteredVehicles(filtered);
  }, [selectedEmployee, selectedVehicle, assignedVehicles]);

  const getEmployeeDetails = (employee_id) => {
    const emp = employees.find((e) => e.employee_id === employee_id);
    return emp 
      ? { 
          name: `${emp.first_name} ${emp.last_name}`,
          position: emp.position || 'Employee',
          department: emp.department || 'N/A'
        }
      : { 
          name: `Employee ID ${employee_id}`,
          position: 'Unknown',
          department: 'Unknown'
        };
  };

  const getVehicleDetails = (vehicle_id) => {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicle_id);
    return vehicle 
      ? {
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type || 'N/A',
          plate: vehicle.license_plate || 'N/A',
          image: vehicle.image || '/default-car.png'
        }
      : {
          model: `Vehicle ID ${vehicle_id}`,
          year: 'N/A',
          type: 'N/A',
          plate: 'N/A',
          image: '/default-car.png'
        };
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp.employee_id,
    label: `${emp.first_name} ${emp.last_name}`,
  }));

  const vehicleOptions = vehicles.map((v) => ({
    value: v.vehicle_id,
    label: `${v.model} (${v.year})`,
  }));

  if (loading) return (
    <div className="flex items-center justify-center p-10">
      <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Assigned Vehicles</h1>
      
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-6 rounded-lg bg-gray-50">
        <div className="w-full md:w-1/3">
          <label className="flex items-center block mb-1 text-sm font-semibold text-gray-700">
            <FaUser className="mr-2" /> Filter by Employee
          </label>
          <Select
            options={employeeOptions}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="Select employee..."
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="flex items-center block mb-1 text-sm font-semibold text-gray-700">
            <FaCar className="mr-2" /> Filter by Vehicle
          </label>
          <Select
            options={vehicleOptions}
            value={selectedVehicle}
            onChange={setSelectedVehicle}
            placeholder="Select vehicle..."
            isClearable
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="flex items-end w-full md:w-1/3">
          <button 
            onClick={() => {
              setSelectedEmployee(null);
              setSelectedVehicle(null);
            }}
            className="w-full px-4 py-2 text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((assignment) => {
            const employee = getEmployeeDetails(assignment.employee_id);
            const vehicle = getVehicleDetails(assignment.vehicle_id);
            
            return (
              <div key={`${assignment.vehicle_id}-${assignment.employee_id}`} className="overflow-hidden transition border rounded-lg shadow-sm hover:shadow-md">
                {/* Vehicle Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img 
                  src={`http://localhost:3000${vehicle.image}`}                    
                    alt={`${vehicle.model} ${vehicle.year}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = '/default-car.png';
                    }}
                  />
                </div>
                
                {/* Vehicle Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{vehicle.model}</h3>
                      <p className="text-gray-600">{vehicle.year} • {vehicle.type}</p>
                    </div>
                    <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                      {vehicle.plate}
                    </span>
                  </div>
                  
                  {/* Assignment Status */}
                  <div className="mb-4">
                    <div className="flex items-center mb-1 text-sm text-gray-600">
                      <BsClock className="mr-2" />
                      <span>
                        Assigned on {new Date(assignment.assign_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      {assignment.return_date ? (
                        <span className="text-green-600">
                          Returned on {new Date(assignment.return_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-orange-500">Currently Assigned</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Employee Info */}
                  <div className="pt-3 border-t">
                    <h4 className="mb-1 text-sm font-medium text-gray-500">Assigned To</h4>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 mr-2 text-blue-600 bg-blue-100 rounded-full">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.position} • {employee.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
            <FiCar className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No vehicle assignments found</h3>
          <p className="mt-1 text-gray-500">
            {selectedEmployee || selectedVehicle 
              ? "Try adjusting your filters" 
              : "No vehicles have been assigned yet"}
          </p>
          {(selectedEmployee || selectedVehicle) && (
            <button 
              onClick={() => {
                setSelectedEmployee(null);
                setSelectedVehicle(null);
              }}
              className="px-4 py-2 mt-4 text-white transition bg-blue-600 rounded hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedVehicles;