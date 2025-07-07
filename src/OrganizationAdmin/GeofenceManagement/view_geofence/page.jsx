"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMap
} from "react-leaflet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiArrowLeft, FiEdit2, FiMapPin } from "react-icons/fi";
import L from "leaflet";

// Custom component to fit map view to polygon bounds
const FitBoundsToPolygon = ({ boundary }) => {
  const map = useMap();

  useEffect(() => {
    if (boundary && boundary.length > 0) {
      const bounds = L.latLngBounds(
        boundary.map(point => [point.latitude, point.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [boundary, map]);

  return null;
};

const ViewGeofencePage = () => {
  const { geofenceName } = useParams();
  const navigate = useNavigate();
  const [geofence, setGeofence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleGeofence = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/admin/single-geofence/${encodeURIComponent(geofenceName)}`
        );
        const data = await response.json();

        if (response.ok) {
          setGeofence(data.geofence);
        } else {
          toast.error(data.message || "Failed to load geofence");
        }
      } catch (error) {
        console.error("Error fetching geofence:", error);
        toast.error("Network error loading geofence");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleGeofence();
  }, [geofenceName]);

  const handleBack = () => {
    navigate("/admin/geofence-management");
  };

  const handleEdit = () => {
    navigate(`/admin/edit-geofence/${geofence.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 mr-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Geofence Details</h1>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-lg shadow">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : !geofence ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <div className="p-4 mx-auto text-red-500 bg-red-100 rounded-full w-max">
              <FiMapPin className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Geofence Not Found</h3>
            <p className="mt-2 text-gray-500">The requested geofence could not be loaded.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Geofence Info Card */}
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{geofence.name}</h2>
                  <div className="flex flex-wrap mt-2 gap-x-4 gap-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">
                        {new Date(geofence.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Points:</span>
                      <span className="ml-1">{geofence.boundary.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="h-[500px] w-full">
                {geofence.boundary.length > 0 && (
                  <MapContainer
                    center={[
                      geofence.boundary[0].latitude,
                      geofence.boundary[0].longitude
                    ]}
                    zoom={13}
                    className="w-full h-full rounded-lg"
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="http://localhost:9090/tile/{z}/{x}/{y}.png"
                    />
                    <Polygon
                      positions={geofence.boundary.map((point) => [
                        point.latitude,
                        point.longitude
                      ])}
                      pathOptions={{ 
                        color: "#3B82F6",
                        fillColor: "#3B82F6",
                        fillOpacity: 0.2,
                        weight: 3
                      }}
                    >
                      <Popup className="font-medium">
                        <div className="p-1">
                          <div className="font-bold">{geofence.name}</div>
                          <div className="text-sm text-gray-600">
                            {geofence.boundary.length} boundary points
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                    <FitBoundsToPolygon boundary={geofence.boundary} />
                  </MapContainer>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default ViewGeofencePage;