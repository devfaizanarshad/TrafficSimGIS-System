import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { MapContext } from '../Context/Context';

export default function MyVehicle() {
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const {employeeId} = useContext(MapContext);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await axios.get(`http://localhost:3000/api/employee/my-vehicles/${employeeId}`);
        const data = res.data.vehicles[0];
        setVehicleInfo(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee Vehicle data');
        setLoading(false);
      }
    }
    fetchVehicle();
  }, [employeeId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Vehicle</h1>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${vehicleInfo?.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {vehicleInfo ? (vehicleInfo.is_available ? 'Available' : 'In Use') : 'Loading...'}
          </span>
        </div>

        {loading ? (
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <div className="space-y-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : vehicleInfo ? (
          <div className="space-y-6">
            {/* Vehicle Image Card */}
            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              {vehicleInfo.image ? (
                <img
                  src={`http://localhost:3000${vehicleInfo.image}`}
                  alt={vehicleInfo.model}
                  className="object-cover w-full h-64"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-100">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Vehicle Info Card */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{vehicleInfo.model}</h2>
                <p className="text-gray-500">{vehicleInfo.year}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle ID</p>
                  <p className="font-medium">{vehicleInfo.vehicle_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`font-medium ${vehicleInfo.is_deleted ? 'text-red-600' : 'text-green-600'}`}>
                    {vehicleInfo.is_deleted ? 'Deleted' : 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p className="font-medium">You (ID: {employeeId})</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Maintenance</p>
                  <p className="font-medium">-</p>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Specifications</h3>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="text-gray-500 w-28">Engine</span>
                  <span>2.0L 4-cylinder</span>
                </li>
                <li className="flex">
                  <span className="text-gray-500 w-28">Transmission</span>
                  <span>Automatic</span>
                </li>
                <li className="flex">
                  <span className="text-gray-500 w-28">Fuel Type</span>
                  <span>Petrol</span>
                </li>
                <li className="flex">
                  <span className="text-gray-500 w-28">Mileage</span>
                  <span>25,000 km</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Request Maintenance
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                View Documents
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white shadow-sm rounded-xl">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No Vehicle Assigned</h3>
            <p className="mt-1 text-sm text-gray-500">You currently don't have a company vehicle assigned to you.</p>
            <button className="px-4 py-2 mt-6 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Request Vehicle Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}