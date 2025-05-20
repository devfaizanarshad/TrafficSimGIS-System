import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiUser, FiCalendar, FiAlertTriangle, FiArrowRight, FiArrowLeft, FiFilter, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContext } from '../../Context/Context';

export default function AllViolations() {
  const [employees, setEmployees] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedViolationType, setSelectedViolationType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const {managerId} = useContext(MapContext) ;

  // Fetch employees
  useEffect(() => {
    async function getAllEmployees() {
      try {
        const res = await axios.get(`http://localhost:3000/api/manager/${managerId}/employees`);
        setEmployees(res.data.employees);
      } catch (error) {
        console.error(`Error fetching employees:`, error);
        toast.error("Failed to load employees");
      }
    }
    getAllEmployees();
  }, [managerId]);

  // Fetch violations
  useEffect(() => {
    async function getEmployeesViolations() {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/manager/${managerId}/view-violations`);
        setViolations(res.data.violation || []);
        console.log(res.data.violation);
        
      } catch (error) {
        console.error(`Error fetching violations:`, error);
        toast.error("Failed to load violations");
      } finally {
        setLoading(false);
      }
    }
    getEmployeesViolations();
  }, []);

  // Custom select styles
  const selectStyles = {
    control: (styles) => ({
      ...styles,
      borderRadius: "0.5rem",
      padding: "2px",
      borderColor: "#E5E7EB",
      boxShadow: "none",
      ":hover": { borderColor: "#6366F1" },
      minHeight: "40px"
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? "#6366F1" : "#fff",
      color: isSelected ? "#fff" : "#333",
      ":hover": {
        backgroundColor: isSelected ? "#6366F1" : "#F3F4F6"
      }
    }),
    menu: (styles) => ({
      ...styles,
      zIndex: 20
    })
  };

  // Filter violations
  const filteredViolations = violations.filter(violation => {
    const employeeMatch = selectedEmployee 
      ? `${violation.first_name} ${violation.last_name}`.toLowerCase().includes(selectedEmployee.toLowerCase())
      : true;
      
    const typeMatch = selectedViolationType
      ? violation.violation_type.toLowerCase().includes(selectedViolationType.toLowerCase())
      : true;
      
    const dateMatch = selectedDate
      ? new Date(violation.violation_time).toLocaleDateString() === selectedDate.toLocaleDateString()
      : true;
      
    return employeeMatch && typeMatch && dateMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredViolations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredViolations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedEmployee(null);
    setSelectedViolationType(null);
    setSelectedDate(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Geofence Violations</h1>
          <p className="text-gray-600">Track and manage all geofence violation incidents</p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mb-4 md:hidden">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <FiFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white p-4 rounded-lg shadow-sm mb-6`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Employee Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Employee</label>
              <Select
                options={employees.map(e => ({
                  value: e.employee_id,
                  label: `${e.first_name} ${e.last_name}`
                }))}
                isClearable
                placeholder="All Employees"
                value={selectedEmployee ? { 
                  value: selectedEmployee, 
                  label: selectedEmployee 
                } : null}
                onChange={(option) => setSelectedEmployee(option ? option.label : null)}
                styles={selectStyles}
              />
            </div>

            {/* Violation Type Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Violation Type</label>
              <Select
                options={[
                  { value: "Exit", label: "Exit Violation" },
                  { value: "Entry", label: "Entry Violation" }
                ]}
                isClearable
                placeholder="All Types"
                value={selectedViolationType ? { 
                  value: selectedViolationType, 
                  label: selectedViolationType 
                } : null}
                onChange={(option) => setSelectedViolationType(option ? option.value : null)}
                styles={selectStyles}
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                dateFormat="MMMM d, yyyy"
                placeholderText="Any Date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                wrapperClassName="w-full"
              />
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full h-[40px] flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FiX className="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Violations Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Geofence</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((violation, idx) => {
                      const { date, time } = formatDateTime(violation.violation_time);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full">
                                <FiUser className="text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {violation.first_name} {violation.last_name}
                                </div>
                                <div className="text-sm text-gray-500">ID: {violation.employee_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{violation.geo_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              violation.violation_type === "Exit" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {violation.violation_type} Violation
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{date}</div>
                            <div className="text-sm text-gray-500">{time}</div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiAlertTriangle className="w-12 h-12 mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900">No violations found</h3>
                          <p className="mt-1 text-gray-500">
                            {selectedEmployee || selectedViolationType || selectedDate 
                              ? "Try adjusting your filters" 
                              : "No violations have been recorded yet"}
                          </p>
                          {(selectedEmployee || selectedViolationType || selectedDate) && (
                            <button
                              onClick={clearFilters}
                              className="px-4 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                            >
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredViolations.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between flex-1 sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredViolations.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredViolations.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <FiArrowLeft className="w-5 h-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <FiArrowRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}