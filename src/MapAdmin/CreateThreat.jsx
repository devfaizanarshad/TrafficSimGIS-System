import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTrashAlt, FaSave, FaSpinner, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ThreatZoneCreator = () => {
  // ===== 1. STATE DECLARATIONS =====
  const [points, setPoints] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threatTypes, setThreatTypes] = useState([]);
  const [selectedThreatType, setSelectedThreatType] = useState('');
  
  // ===== 2. REFS INITIALIZATION =====
  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // ===== 3. MAP INITIALIZATION =====
  useEffect(() => {
    // 3.1 Set default times
    const now = new Date();
    setStartTime(now.toTimeString().substring(0, 5));
    setEndTime(new Date(now.getTime() + 3600000).toTimeString().substring(0, 5));

    // 3.2 Initialize map
    const map = L.map(mapRef.current).setView([33.6844, 73.0479], 13);
    
    // 3.3 Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3.4 Set click handler
    map.on('click', (e) => {
      const point = [e.latlng.lat, e.latlng.lng];
      setPoints(prev => [...prev, point]);
      toast.success(`Point added at ${point[0].toFixed(4)}, ${point[1].toFixed(4)}`);
    });

    mapInstanceRef.current = map;

    // ===== 4. FETCH THREAT TYPES =====
    const fetchThreatTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/layers/type/threat');
        setThreatTypes(response.data);
        
        // Set default selection if data exists
        if (response.data.length > 0) {
          setSelectedThreatType(response.data[0].name);
        }
      } catch (error) {
        toast.error('Failed to load threat types');
        console.error('Error fetching threat types:', error);
      }
    };
    fetchThreatTypes();

    // 3.5 Cleanup function
    return () => map.remove();
  }, []);

  // ===== 5. POLYGON MANAGEMENT =====
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 5.1 Remove existing polygon
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
    }
    
    // 5.2 Draw new polygon if we have enough points
    if (points.length >= 3) {
      polygonRef.current = L.polygon(points, {
        color: '#8B0000',
        fillOpacity: 0.4
      }).addTo(mapInstanceRef.current);

      // 5.3 Fit bounds to polygon when first 3 points are added
      if (points.length === 3) {
        mapInstanceRef.current.fitBounds(polygonRef.current.getBounds());
      }
    }
  }, [points]);

  // ===== 6. HELPER FUNCTIONS =====
  const deletePoint = (index) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    toast.info(`Point ${index + 1} removed`);
  };

  const clearPoints = () => {
    if (points.length === 0) return;
    setPoints([]);
    toast.info("All points cleared");
  };

  const handleSubmit = () => {

    console.log("Submitting Threat Zone with data:", {
      points,
      startTime,
      endTime,
      selectedThreatType
    });

    // 6.1 Validation
    if (points.length < 3) {
      toast.error("At least 3 points required");
      return;
    }
    
    if (!selectedThreatType) {
      toast.error("Please select a threat type");
      return;
    }

  // 6.0 API Call
    const createThreatZone = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/location/threat-simulation', {
          path: points,
          start_time: startTime,
          end_time: endTime,
          threat_level: selectedThreatType
        });
        toast.success("Threat zone created successfully!");
        console.log("API Response:", response.data);
      } catch (error) {
        toast.error("Failed to create threat zone");
        console.error("API Error:", error);
      }
    };

    createThreatZone();
    
    // 6.2 Submit logic
    setIsSubmitting(true);
    toast.info("Creating threat zone...");
    
    // 6.3 Simulate API call
    setTimeout(() => {
      toast.success("Zone created successfully!");
      setPoints([]);
      setIsSubmitting(false);
    }, 1500);
  };

  // ===== 7. UI RENDERING =====
  return (
    <div className="flex flex-col h-screen">
      {/* 7.1 Header Section */}
      <header className="p-4 text-white bg-blue-600">
        <h1 className="text-xl font-bold">Threat Zone Creator</h1>
        <p>Click on the map to add boundary points</p>
      </header>

      {/* 7.2 Main Content */}
      <main className="flex flex-col flex-1">
        {/* 7.2.1 Map Container */}
        <div 
          ref={mapRef} 
          className="flex-1 min-h-[300px] bg-gray-200"
        />

        {/* 7.2.2 Form Container */}
        <div className="p-4 overflow-y-auto bg-white border-t">
          {/* 7.2.2.1 Time Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                <FaClock className="inline mr-1" /> Start Time
              </label>
              <input
                type="time"
                className="w-full p-2 border rounded"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                <FaClock className="inline mr-1" /> End Time
              </label>
              <input
                type="time"
                className="w-full p-2 border rounded"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* 7.2.2.2 Threat Type Dropdown */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Threat Type</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedThreatType}
              onChange={(e) => setSelectedThreatType(e.target.value)}
              disabled={threatTypes.length === 0}
            >
              {threatTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* 7.2.2.3 Points List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Points ({points.length})</h3>
              <button 
                onClick={clearPoints}
                className="flex items-center text-sm text-red-500"
                disabled={points.length === 0}
              >
                <FaTrashAlt className="mr-1" /> Clear
              </button>
            </div>
            
            {points.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                <FaMapMarkerAlt className="mx-auto mb-2 text-2xl" />
                <p>No points added yet</p>
              </div>
            ) : (
              <ul className="overflow-y-auto border divide-y rounded max-h-40">
                {points.map((point, i) => (
                  <li key={i} className="flex items-center justify-between p-2">
                    <span>Point {i+1}: {point[0].toFixed(4)}, {point[1].toFixed(4)}</span>
                    <button 
                      onClick={() => deletePoint(i)}
                      className="text-red-500"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 7.2.2.4 Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={points.length < 3 || isSubmitting || !selectedThreatType}
            className={`w-full p-3 rounded text-white font-medium flex items-center justify-center ${
              points.length < 3 || !selectedThreatType ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Create Zone
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ThreatZoneCreator;