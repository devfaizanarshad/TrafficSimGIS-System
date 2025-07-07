import React, { useEffect, useState, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiClock, FiCalendar, FiAlertCircle, FiCheckCircle, FiMapPin, FiUser, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Fix marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { MapContext } from '../Context/Context.jsx';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// Component to handle map view changes
function ChangeMapView({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        padding: [50, 50], // Add some padding around the bounds
        duration: 1, // Animation duration in seconds
        easeLinearity: 0.25
      });
    }
  }, [bounds, map]);

  return null;
}

export default function MyGeofence() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGeofence, setActiveGeofence] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mapBounds, setMapBounds] = useState(null);
  const {employeeId} = useContext(MapContext);
  const [activeVoilation, setActiveVoilation] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`http://localhost:3000/api/employee/my-geofences/${employeeId}`);
        setGeofences(res.data.geofences);
        
        // Set initial bounds to show all geofences if they exist
        if (res.data.geofences.length > 0) {
          calculateAllBounds(res.data.geofences);
        }
      } catch (error) {
        console.error('Error fetching employee geofence data');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [employeeId]);

  const calculateAllBounds = (geofences) => {
    const allPoints = geofences.flatMap(geo => 
      geo.geofence_boundary.map(point => [point.latitude, point.longitude])
    );
    setMapBounds(L.latLngBounds(allPoints));
  };

  const focusOnGeofence = (geo) => {
    const points = geo.geofence_boundary.map(point => [point.latitude, point.longitude]);
    setMapBounds(L.latLngBounds(points));
    setActiveGeofence(geo);
  };

  const resetView = () => {
    if (geofences.length > 0) {
      calculateAllBounds(geofences);
    }
    setActiveGeofence(null);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isGeofenceActive = (geofence) => {
    const now = currentTime;
    const startTime = new Date(`2000-01-01T${geofence.start_time}`);
    const endTime = new Date(`2000-01-01T${geofence.end_time}`);
    const startDate = new Date(geofence.start_date);
    const endDate = new Date(geofence.end_date);
    
    const currentTimeOfDay = new Date(2000, 0, 1, now.getHours(), now.getMinutes());
    const withinTimeWindow = currentTimeOfDay >= startTime && currentTimeOfDay <= endTime;
    const withinDateRange = now >= startDate && now <= endDate;
    
    return withinTimeWindow && withinDateRange && geofence.is_active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading geofence data...</p>
        </div>
      </div>
    );
  }

  if (!geofences.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 text-center bg-white shadow-lg rounded-xl">
          <FiMapPin className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No geofences assigned</h3>
          <p className="mt-2 text-sm text-gray-500">You currently don't have any geofences assigned to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="flex items-center justify-between px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Geofence Management</h1>
            <p className="mt-1 text-blue-100">Monitor your authorized areas in real-time</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <FiUser className="mr-2 text-white" />
              <span className="font-medium text-white">Employee #{employeeId}</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <FiClock className="mr-2 text-white" />
              <span className="font-medium text-white">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Geofence List */}
          <div className="space-y-4 lg:col-span-1">
            <div className="overflow-hidden bg-white shadow-md rounded-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Your Geofences</h2>
                  <p className="mt-1 text-sm text-gray-500">{geofences.length} authorized areas</p>
                </div>
                <button 
                  onClick={resetView}
                  className="px-3 py-1 text-sm text-blue-600 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  Reset View
                </button>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {geofences.map((geo) => (
                  <motion.div 
                    key={geo.geo_id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => focusOnGeofence(geo)}
                    className={`p-4 cursor-pointer transition-colors ${activeGeofence?.geo_id === geo.geo_id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isGeofenceActive(geo) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {isGeofenceActive(geo) ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{geo.geofence_name}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <FiCalendar className="mr-1.5" />
                          <span>{formatDate(geo.start_date)} - {formatDate(geo.end_date)}</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <FiClock className="mr-1.5" />
                          <span>{formatTime(geo.start_time)} - {formatTime(geo.end_time)}</span>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isGeofenceActive(geo) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {isGeofenceActive(geo) ? 'Active' : 'Inactive'}
                          </span>
                          {geo.is_violating && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Violation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Status Summary */}
            <div className="overflow-hidden bg-white shadow-md rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Status Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-sm font-medium text-green-800">Active Geofences</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {geofences.filter(g => isGeofenceActive(g)).length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50">
                    <p className="text-sm font-medium text-red-800">Violations</p>
                    <p className="mt-1 text-2xl font-bold text-red-600">
                      {geofences.filter(g => g.is_violating).length}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <div className="mt-2">
                    {geofences.some(g => g.is_violating) ? (
                      <div className="flex items-center text-red-600">
                        <FiAlertCircle className="mr-2" />
                        <span>You are currently violating geofence rules</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <FiCheckCircle className="mr-2" />
                        <span>You are within authorized areas</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="h-full overflow-hidden bg-white shadow-md rounded-xl">
              <div className="h-[600px] w-full relative">
                <MapContainer 
                  center={[geofences[0].geofence_boundary[0].latitude, geofences[0].geofence_boundary[0].longitude]}
                  zoom={13} 
                  style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
                  className="z-0"
                  ref={mapRef}
                >
                  <ChangeMapView bounds={mapBounds} />
                  <TileLayer 
                    url="http://localhost:9090/tile/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {geofences.map((geo) => (
                    <Polygon
                      key={`polygon-${geo.geo_id}`}
                      positions={geo.geofence_boundary.map((point) => [
                        point.latitude,
                        point.longitude,
                      ])}
                      pathOptions={{ 
                        color: geo.is_violating ? '#EF4444' : isGeofenceActive(geo) ? '#10B981' : '#6B7280',
                        fillOpacity: activeGeofence?.geo_id === geo.geo_id ? 0.5 : 0.2,
                        weight: activeGeofence?.geo_id === geo.geo_id ? 3 : 2
                      }}
                      eventHandlers={{
                        click: () => focusOnGeofence(geo),
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold">{geo.geofence_name}</h3>
                          <p className="text-sm">
                            <span className={`inline-block w-3 h-3 rounded-full mr-1 ${isGeofenceActive(geo) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {isGeofenceActive(geo) ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-sm">
                            <span className={`inline-block w-3 h-3 rounded-full mr-1 ${geo.is_violating ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            {geo.is_violating ? 'Violation detected' : 'No violations'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <FiCalendar className="inline mr-1" />
                            {formatDate(geo.start_date)} - {formatDate(geo.end_date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <FiClock className="inline mr-1" />
                            {formatTime(geo.start_time)} - {formatTime(geo.end_time)}
                          </p>
                        </div>
                      </Popup>
                    </Polygon>
                  ))}
                </MapContainer>

                {/* Map Controls */}
                <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Active</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-gray-500 rounded-full"></div>
                      <span className="text-xs">Inactive</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs">Violation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geofence Details */}
              {activeGeofence && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{activeGeofence.geofence_name}</h3>
                      <p className="mt-1 text-sm text-gray-500">Geofence ID: {activeGeofence.geo_id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isGeofenceActive(activeGeofence) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isGeofenceActive(activeGeofence) ? 'Active' : 'Inactive'}
                      </span>
                      {activeGeofence.is_violating && (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                          Violation
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500">Access Type</h4>
                      <p className="mt-1 text-gray-900">{activeGeofence.access_type}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500">Date Range</h4>
                      <p className="mt-1 text-gray-900">
                        {formatDate(activeGeofence.start_date)} - {formatDate(activeGeofence.end_date)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500">Time Window</h4>
                      <p className="mt-1 text-gray-900">
                        {formatTime(activeGeofence.start_time)} - {formatTime(activeGeofence.end_time)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 text-gray-900">
                        {isGeofenceActive(activeGeofence) ? (
                          <span className="text-green-600">Currently accessible</span>
                        ) : (
                          <span className="text-gray-600">Outside access hours</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}