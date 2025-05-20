"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiTrash2, FiMapPin, FiSave } from "react-icons/fi";

const CreateGeofence = () => {
  const [name, setName] = useState("");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setPoints((prevPoints) => [
      ...prevPoints,
      { latitude: lat, longitude: lng },
    ]);
  };

  const handleRemovePoint = (index) => {
    setPoints((prevPoints) => prevPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please provide a Geofence name");
      return;
    }

    if (points.length < 3) {
      toast.error("At least 3 points are required to create a geofence");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/admin/create-geofence",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, boundary: points }),
        }
      );

      if (response.ok) {
        toast.success("Geofence created successfully!");
        setName("");
        setPoints([]);
      } else {
        toast.error("Failed to create geofence");
      }
    } catch (error) {
      console.error("Error creating geofence:", error);
      toast.error("Server error. Please try later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-2xl font-bold text-white">Create New Geofence</h1>
            <p className="mt-2 text-blue-100">Define boundaries by clicking on the map</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Geofence Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Geofence Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Office Area, Warehouse Zone"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Map Container */}
            <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <MapContainer
                center={[33.6844, 73.0479]}
                zoom={13}
                className="w-full h-full"
              >
                <TileLayer
                  url="http://localhost:9090/tile/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onClick={handleMapClick} />

                {points.length > 0 && (
                  <Polygon
                    positions={points.map((p) => [p.latitude, p.longitude])}
                    pathOptions={{ color: "#3B82F6", fillOpacity: 0.2 }}
                  />
                )}
              </MapContainer>
            </div>

            {/* Boundary Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Boundary Points ({points.length})
                </h3>
                {points.length > 0 && (
                  <button
                    onClick={() => setPoints([])}
                    className="flex items-center text-xs text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="mr-1" /> Clear All
                  </button>
                )}
              </div>

              {points.length === 0 ? (
                <div className="p-4 text-center rounded-lg bg-gray-50">
                  <FiMapPin className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click on the map to add boundary points
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Minimum 3 points required
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <ul className="overflow-y-auto divide-y divide-gray-200 max-h-48">
                    {points.map((point, index) => (
                      <li key={index} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Point {index + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemovePoint(index)}
                            className="p-1 text-red-500 rounded-full hover:text-red-700 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={loading || points.length < 3}
                className={`px-6 py-2.5 rounded-lg flex items-center gap-2 ${
                  loading || points.length < 3
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Create Geofence
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!rounded-lg !shadow-lg !p-4 !m-2"
      />
    </div>
  );
};

const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: onClick,
  });
  return null;
};

export default CreateGeofence;