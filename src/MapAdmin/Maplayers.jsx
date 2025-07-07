import React, { useEffect, useState, useContext } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polygon, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { FiLayers, FiClock } from 'react-icons/fi';
import { MapContext } from '../Context/Context.jsx';

// --------- Helper: Create custom Leaflet marker icon ---------
const createCustomIcon = (url) =>
  L.icon({
    iconUrl: url,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

function MapLayers() {
  // --------- State declarations ---------
  const [userLayers, setUserLayers] = useState([]); // All assigned layers
  const [activeLayer, setActiveLayer] = useState(null); // Currently selected layer
  const [locations, setLocations] = useState([]); // Location-type data
  const [threatLocations, setThreatLocations] = useState([]); // Threat polygons
  const [lines, setLines] = useState([]); // Polyline routes
  const [error, setError] = useState(null); // Display error
  const [loading, setLoading] = useState(false); // Loading spinner
  const { userId } = useContext(MapContext); // Current user ID

  // --------- Fetch assigned layers on mount ---------
  useEffect(() => {
    const fetchUserLayers = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/layers/all`);
        console.log("Fetched user layers:", res.data);
        setUserLayers(res.data); // Each should include: id, name, type, image
      } catch (err) {
        console.error("Failed to fetch user layers:", err);
      }
    };
    fetchUserLayers();
  }, [userId]);

  // --------- Fetch locations/threats/lines when a layer is selected ---------
  useEffect(() => {
    if (!activeLayer) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(userLayers);
        console.log(activeLayer);
        
        
        const selected = userLayers.find(l => l.name === activeLayer);


        console.log(selected)

        if (!selected) return;

        // Clear previous layers
        setLocations([]);
        setThreatLocations([]);
        setLines([]);

        

        if (selected.type === 'threat') {
          const res = await axios.get(`http://localhost:3000/api/location/threat-simulation/${selected.name}`);
          setThreatLocations(res.data.data);
        } else if (selected.type === 'line') {
          const res = await axios.get(`http://localhost:3000/api/location/map-lines/${selected.name}`);
          setLines(res.data);
        } else if (selected.type === 'location') {
          const res = await axios.post('http://localhost:3000/api/location/map-locations', {
            type: selected.name,
          });
          setLocations(res.data);
        }
      } catch (err) {
        console.error(`Error fetching data for ${activeLayer}`, err);
        setError('Failed to load layer data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeLayer, userLayers]);

  // --------- Time formatting for threat zones ---------
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative w-full h-screen">
      {/* --------- Map Container --------- */}
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="http://localhost:9090/tile/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ZoomControl position="topleft" />

        {/* --------- Location Markers --------- */}
        {locations.map((loc) => {
          const matchedLayer = userLayers.find(l => l.name === activeLayer);
          const iconUrl = matchedLayer?.image
            ? `http://localhost:3000/uploads/${matchedLayer.image}`
            : '';

          return (
            <Marker
              key={`loc-${loc.id}`}
              position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
              icon={createCustomIcon(iconUrl)}
            >
              <Popup>
                <div>
                  <h3 className="text-lg font-bold">{loc.name}</h3>
                  <p className="text-sm text-gray-600">{loc.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* --------- Threat Zones --------- */}
        {threatLocations.map((threat) => (
          <Polygon
            key={`polygon-${threat.threat_id}`}
            positions={threat.path}
            color="red"
            fillColor="red"
          >
            <Popup>
              <h3 className="text-lg font-bold">{threat.threat_level}</h3>
              <p className="text-sm text-gray-600">
                <FiClock className="inline" /> {formatTime(threat.start_time)} - {formatTime(threat.end_time)}
              </p>
            </Popup>
          </Polygon>
        ))}

        {/* --------- Line Layers --------- */}
        {lines.map((line) => {
          let color = 'gray', dashArray = null;
          if (line.category.toLowerCase() === 'ptcl') color = '#7e22ce';
          else if (line.category.toLowerCase() === 'railway') color = '#1e40af';
          else if (line.category.toLowerCase() === 'highway') color = '#f59e0b';
          else if (line.category.toLowerCase() === 'threat') {
            color = '#dc2626';
            dashArray = '6 6';
          }

          return (
            <Polyline
              key={`line-${line.id}`}
              positions={line.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color, weight: 6, opacity: 0.8, dashArray }}
            >
              <Popup>
                <h3 className="text-base font-bold">{line.name}</h3>
                <p className="text-sm">{line.description}</p>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* --------- Layer Sidebar --------- */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow w-72">
        <div className="flex items-center justify-between px-4 py-3 text-white bg-blue-600">
          <div className="flex items-center">
            <FiLayers className="mr-2" />
            <span>Assigned Layers</span>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {userLayers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setActiveLayer(layer.name)}
              className={`flex items-center p-2 rounded cursor-pointer mb-1 transition ${
                activeLayer === layer.name ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <img
                src={`http://localhost:3000/uploads/${layer.image}`}
                alt={layer.name}
                className="object-contain w-6 h-6 mr-3"
              />
              <span className="text-sm font-medium text-gray-700">{layer.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --------- Error Banner --------- */}
      {error && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapLayers;
