import React, { useEffect, useState, useContext } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polygon, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { FiLayers, FiClock } from 'react-icons/fi';
import { MapContext } from '../Context/Context.jsx';

// Custom marker icon
const createCustomIcon = (url) => L.icon({
  iconUrl: url,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function MapLayers() {
  // State
  const { userId } = useContext(MapContext);
  const [userLayers, setUserLayers] = useState([]);
  const [publicLayers, setPublicLayers] = useState([]);
  const [activeLayer, setActiveLayer] = useState(null);
  const [locations, setLocations] = useState([]);
  const [threats, setThreats] = useState([]);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoId, setGeoId] = useState(null);

  // Fetch layers on mount
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const [userRes, publicRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/usergeolayer/allusergeolayers/${userId}`),
          axios.get('http://localhost:3000/api/layers/Layertype/public')
        ]);
    
        console.log(userRes.data);
        
        setUserLayers(userRes.data);
        setPublicLayers(publicRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchLayers();
  }, [userId]);

  // Handle layer selection
  const handleLayerSelect = async (layer) => {
    if (!layer) return;
    
    setActiveLayer(layer);
    setLoading(true);
    setError(null);
    
    try {
      // Clear previous data
      setLocations([]);
      setThreats([]);
      setLines([]);

      // Fetch based on layer type
      if (layer.type === 'threat') {
        const res = await axios.get(`http://localhost:3000/api/location/threat-simulation/${layer.name}`);
        setThreats(res.data.data);
      } 
      else if (layer.type === 'line') {
        console.log(layer.name);
        const res = await axios.get(`http://localhost:3000/api/location/map-lines/${layer.name}`);
        console.log(res.data);
        
        setLines(res.data);
      } 
      else if (layer.type === 'location') {
        const res = await axios.post('http://localhost:3000/api/location/map-locations', {
          type: layer.name,
        });
        setLocations(res.data);
      }
    } catch (err) {
      setError('Failed to load layer data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render layer items
  const renderLayerItem = (layer, isPublic = false) => (
    <div
      key={isPublic ? `public-${layer.id}` : `user-${layer.id}`}
      onClick={() => handleLayerSelect(layer)}
      className={`flex items-center p-2 rounded cursor-pointer mb-1 ${
        activeLayer?.id === layer.id 
          ? isPublic ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50'
      }`}
    >
      <img
        src={`http://localhost:3000/uploads/${layer.image}`}
        alt={layer.name}
        className="w-6 h-6 mr-3"
      />
      <span className="text-sm font-medium">
        {layer.name}
        {isPublic && <span className="ml-2 text-xs text-gray-400">(Public)</span>}
      </span>
    </div>
  );

  return (
    <div className="relative w-full h-screen">
      {/* Map */}
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <ZoomControl position="topleft" />

        {/* Markers */}
        {locations.map(loc => (
          <Marker
            key={`loc-${loc.id}`}
            position={[loc.latitude, loc.longitude]}
            icon={createCustomIcon(
              activeLayer?.image 
                ? `http://localhost:3000/uploads/${activeLayer.image}`
                : ''
            )}
          >
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}

        {/* Threats */}
        {threats.map(threat => (
          <Polygon
            key={`threat-${threat.threat_id}`}
            positions={threat.path}
            color="red"
          >
            <Popup>
              {threat.threat_level} <br/>
              <FiClock className="inline"/> {threat.start_time} - {threat.end_time}
            </Popup>
          </Polygon>
        ))}

        {/* Lines */}
        {lines.map(line => (
          <Polyline
            key={`line-${line.id}`}
            positions={line.coordinates.map(([lng, lat]) => [lat, lng])}
            color={
              line.category === 'ptcl' ? '#7e22ce' :
              line.category === 'railway' ? '#1e40af' :
              line.category === 'highway' ? '#f59e0b' : '#dc2626'
            }
          >
            <Popup>{line.name}</Popup>
          </Polyline>
        ))}
      </MapContainer>

      {/* Sidebar */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow w-72">
        <div className="flex items-center justify-between px-4 py-3 text-white bg-blue-600">
          <div className="flex items-center">
            <FiLayers className="mr-2" />
            <span>Map Layers</span>
          </div>
          {loading && (
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"/>
          )}
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto">
          <h3 className="mb-2 text-xs font-semibold text-gray-500">Your Layers</h3>
          {userLayers.map(layer => renderLayerItem(layer))}

          <h3 className="mt-4 mb-2 text-xs font-semibold text-gray-500">Public Layers</h3>
          {publicLayers.map(layer => renderLayerItem(layer, true))}
        </div>
      </div>

      {/* Error */}
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