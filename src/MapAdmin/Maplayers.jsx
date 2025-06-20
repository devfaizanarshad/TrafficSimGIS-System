import React, { useEffect, useState } from 'react';
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { FiLayers, FiNavigation } from 'react-icons/fi';

// Custom marker icons
const iconMap = {
  hospital: '/icons/hospital.png',
  ptcl: '/icons/ptcl.png',
  toll: '/icons/Toll.png',
  police: '/icons/police(1).png',
  school: '/icons/school.png',
  restaurant: '/icons/restaurant.png',
  atm: '/icons/atm.png',
  fuel: '/icons/fuel.png',
  park: '/icons/park (2).png',
};

const createCustomIcon = (type) => L.icon({
  iconUrl: iconMap[type],
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  className: `marker-${type}`
});

const layerTypes = [
  { id: 'hospital', name: 'Hospitals' },
  { id: 'ptcl', name: 'PTCL Offices' },
  { id: 'toll', name: 'Toll Plazas' },
  { id: 'police', name: 'Police Stations' },
  { id: 'school', name: 'Schools' },
  { id: 'restaurant', name: 'Restaurants' },
  { id: 'atm', name: 'ATMs/Banks' },
  { id: 'fuel', name: 'Fuel Stations' },
  { id: 'park', name: 'Parks' }
];

function Maplayers() {
  const [locations, setLocations] = useState([]);
  const [activeLayer, setActiveLayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Fetch locations when active layer changes
  useEffect(() => {
    if (!activeLayer) return;

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.post('http://localhost:3000/api/location/map-locations', { 
          type: activeLayer 
        });
        setLocations(res.data);
      } catch (err) {
        console.error(`Error loading ${activeLayer} data:`, err);
        setError(`Failed to load ${activeLayer} data`);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [activeLayer]);


  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ZoomControl position="topleft" />

        {/* Render markers for active layer */}
        {locations.map((location) => (
          <Marker
            key={`${location.loc_type}-${location.id}`}
            position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
            icon={createCustomIcon(location.loc_type)}
          >
            <Popup className="custom-popup">
              <div className="min-w-[250px]">
                <h3 className="mb-2 text-lg font-bold text-blue-700">{location.name}</h3>
                
                
                <p className="mb-3 text-sm text-gray-600">{location.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                    {location.loc_type}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">
                      Directions
                    </button>
                    <button className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>


      {/* Layers Control Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden w-64">
        <div className="flex items-center justify-between px-4 py-3 text-white bg-blue-600">
          <div className="flex items-center">
            <FiLayers className="mr-2" />
            <span className="font-medium">Map Layers</span>
          </div>
          {loading && (
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          )}
        </div>
        
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {layerTypes.map((layer) => (
            <div 
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`flex items-center p-2 mb-1 rounded cursor-pointer transition ${activeLayer === layer.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <img 
                src={iconMap[layer.id]} 
                alt={layer.id} 
                className="object-contain w-6 h-6 mr-3" 
              />
              <span className="text-sm font-medium text-gray-700">{layer.name}</span>
              {activeLayer === layer.id && locations.length > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {locations.length}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* Error Notification */}
      {error && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md max-w-xs">
          <div className="flex items-center">
            <span className="mr-2 text-red-500">⚠️</span>
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maplayers;