import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FiUser, 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiActivity,
  FiNavigation,
  FiFilter,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { format, formatDistanceToNow, parseISO, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Leaflet icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle map recentering
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const EmployeeMovementHistory = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(0);
  const [showPath, setShowPath] = useState(true);

  // Fetch data on component mount and when timeRange changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch employee details
        const empRes = await axios.get(`http://localhost:3000/api/employee/my-profile/${employeeId}`);
        setEmployee(empRes.data.profile);
        
        // Fetch location history
        const locRes = await axios.get(
          `http://localhost:3000/api/manager/${employeeId}/employees/Alllocations`
        );
        
        // Process locations - remove duplicates and sort by timestamp
        const uniqueLocations = [];
        const seen = new Set();
        
        locRes.data.employees.forEach(loc => {
          const key = `${loc.latitude},${loc.longitude},${new Date(loc.location_timestamp).getTime()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueLocations.push({
              ...loc,
              timestamp: new Date(loc.location_timestamp)
            });
          }
        });
        
        // Sort by timestamp (newest first)
        const sortedLocations = uniqueLocations.sort((a, b) => b.timestamp - a.timestamp);
        
        setLocations(sortedLocations);
        if (sortedLocations.length > 0) {
          setSelectedLocation(sortedLocations[0]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  // Filter locations based on time range
  const filteredLocations = useMemo(() => {
    if (!locations.length) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch(timeRange) {
      case 'today':
        cutoffDate = subDays(now, 1);
        break;
      case 'week':
        cutoffDate = subDays(now, 7);
        break;
      case 'month':
        cutoffDate = subDays(now, 30);
        break;
      default:
        return locations;
    }
    
    return locations.filter(loc => loc.timestamp >= cutoffDate);
  }, [locations, timeRange]);

  // Calculate center based on locations
  const center = useMemo(() => {
    if (filteredLocations.length === 0) return [33.6844, 73.0479];
    
    const latSum = filteredLocations.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = filteredLocations.reduce((sum, loc) => sum + loc.longitude, 0);
    return [latSum / filteredLocations.length, lngSum / filteredLocations.length];
  }, [filteredLocations]);

  // Playback controls
  useEffect(() => {
    let interval;
    if (isPlaying && filteredLocations.length > 0) {
      interval = setInterval(() => {
        setCurrentPlaybackIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= filteredLocations.length) {
            setIsPlaying(false);
            return 0;
          }
          setSelectedLocation(filteredLocations[nextIndex]);
          return nextIndex;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, filteredLocations]);

  // Custom marker icons
  const createEmployeeIcon = (isSelected = false, isCurrent = false) =>
    L.divIcon({
      className: 'custom-employee-icon',
      html: `
        <div style="width: ${isSelected ? '36px' : '32px'}; 
                     height: ${isSelected ? '36px' : '32px'}; 
                     border-radius: 50%; 
                     background: ${isCurrent ? '#10b981' : isSelected ? '#2563eb' : '#3b82f6'}; 
                     display: flex; 
                     align-items: center; 
                     justify-content: center; 
                     color: white; 
                     font-size: ${isSelected ? '20px' : '18px'}; 
                     border: 2px solid white; 
                     box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                     transition: all 0.2s ease;">
          <span style="font-weight:bold;">👤</span>
        </div>
      `,
      iconSize: isSelected ? [36, 36] : [32, 32],
      iconAnchor: isSelected ? [18, 36] : [16, 32],
      popupAnchor: isSelected ? [0, -36] : [0, -32],
    });

  // Formatting functions
  const formatTime = (date) => format(date, 'h:mm a');
  const formatDate = (date) => format(date, 'MMM d, yyyy');
  const formatDateTime = (date) => format(date, 'MMM d, yyyy h:mm a');
  const formatTimeAgo = (date) => formatDistanceToNow(date, { addSuffix: true });

  // Calculate total distance traveled (in km)
  const totalDistance = useMemo(() => {
    if (filteredLocations.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < filteredLocations.length; i++) {
      const prev = filteredLocations[i-1];
      const curr = filteredLocations[i];
      distance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    return distance.toFixed(2);
  }, [filteredLocations]);

  // Haversine formula to calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading movement data...</p>
          <p className="text-sm text-gray-500">Tracking {employeeId}'s location history</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="z-10 bg-white shadow-sm">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {employee?.first_name} {employee?.last_name}'s Movement
              </h1>
              <p className="text-sm text-gray-600">
                {filteredLocations.length} locations • {totalDistance} km traveled
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <FiFilter className="text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value);
                    setIsPlaying(false);
                  }}
                  className="text-sm bg-transparent border-none focus:ring-0"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
        {/* Sidebar with location list */}
        <div className="w-full p-4 overflow-y-auto bg-white border-r border-gray-200 md:w-80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Timeline</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPath(!showPath)}
                className={`p-2 rounded-lg ${showPath ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title={showPath ? 'Hide Path' : 'Show Path'}
              >
                <FiNavigation size={16} />
              </button>
              <div className="flex overflow-hidden rounded-lg">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2 ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                  title={isPlaying ? 'Pause Playback' : 'Start Playback'}
                >
                  {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                </button>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-sm border-l border-gray-200 focus:ring-0"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="2">2x</option>
                  <option value="5">5x</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredLocations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No location data available for the selected time range
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLocations.map((loc, index) => (
                <motion.div
                  key={`${loc.latitude},${loc.longitude},${loc.timestamp.getTime()}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedLocation?.timestamp === loc.timestamp
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } ${isPlaying && currentPlaybackIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center p-2 mt-1 text-white rounded-full ${
                      index === 0 ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {index === 0 ? <FiActivity size={14} /> : <FiMapPin size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {formatTime(loc.timestamp)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(loc.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                      </p>
                      {index === 0 && (
                        <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                          Current Location
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <RecenterMap center={selectedLocation ? 
              [selectedLocation.latitude, selectedLocation.longitude] : center} />

            {/* Draw path */}
            {showPath && filteredLocations.length > 1 && (
              <Polyline
                positions={filteredLocations.map(loc => [loc.latitude, loc.longitude])}
                color="#3b82f6"
                weight={4}
                opacity={0.7}
              />
            )}

            {/* Show markers for significant locations */}
            {filteredLocations
              .filter((_, i) => i === 0 || i === filteredLocations.length - 1 || i % 5 === 0)
              .map((loc, index) => (
                <Marker
                  key={`marker-${index}`}
                  position={[loc.latitude, loc.longitude]}
                  icon={createEmployeeIcon(
                    selectedLocation?.timestamp === loc.timestamp,
                    index === 0
                  )}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(loc);
                      setIsPlaying(false);
                    },
                  }}
                >
                  <Popup>
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900">
                        {employee?.first_name} {employee?.last_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMapPin className="mr-2 text-gray-400" />
                        <span>{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="mr-2 text-gray-400" />
                        <span>{formatDateTime(loc.timestamp)}</span>
                      </div>
                      {index === 0 && (
                        <div className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                          Current Location
                        </div>
                      )}
                    </div>
                  </Popup>
                  <Tooltip 
                    direction="top" 
                    offset={[0, -20]} 
                    opacity={0.9}
                    permanent={selectedLocation?.timestamp === loc.timestamp}
                  >
                    {index === 0 ? 'Current' : 
                     index === filteredLocations.length - 1 ? 'Start' : 
                     formatTime(loc.timestamp)}
                  </Tooltip>
                </Marker>
              ))}
          </MapContainer>

          {/* Location Details Panel */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-white rounded-t-lg shadow-lg md:right-auto md:bottom-auto md:left-4 md:top-4 md:w-96 md:rounded-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Location Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(selectedLocation.timestamp)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-2 rounded-full ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                    >
                      {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">Latitude</p>
                      <p className="font-mono text-sm">{selectedLocation.latitude.toFixed(6)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">Longitude</p>
                      <p className="font-mono text-sm">{selectedLocation.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">City</p>
                      <p className="text-sm">{selectedLocation.city || employee?.city || 'Unknown'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">Time Recorded</p>
                      <p className="text-sm">{formatTime(selectedLocation.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs font-medium text-gray-500">Time Since</p>
                    <p className="text-sm">{formatTimeAgo(selectedLocation.timestamp)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="px-6 py-3 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-2 text-center">
              <p className="text-xs font-medium text-gray-500">Locations Recorded</p>
              <p className="text-xl font-bold text-blue-600">{filteredLocations.length}</p>
            </div>
            <div className="p-2 text-center">
              <p className="text-xs font-medium text-gray-500">Distance Traveled</p>
              <p className="text-xl font-bold text-blue-600">{totalDistance} km</p>
            </div>
            <div className="p-2 text-center">
              <p className="text-xs font-medium text-gray-500">Time Range</p>
              <p className="text-xl font-bold text-blue-600 capitalize">{timeRange}</p>
            </div>
            <div className="p-2 text-center">
              <p className="text-xs font-medium text-gray-500">Last Updated</p>
              <p className="text-xl font-bold text-blue-600">
                {filteredLocations.length > 0 ? formatTimeAgo(filteredLocations[0].timestamp) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMovementHistory;