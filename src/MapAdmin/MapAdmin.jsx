import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus } from "lucide-react";
import axios from "axios";

const MapAdminPanel = () => {
  // Refs for DOM elements
  const mapContainerRef = useRef(null); // Reference to the map container div
  const mapInstanceRef = useRef(null); // Reference to the Leaflet map instance

  // State variables
  const [searchQuery, setSearchQuery] = useState(""); // User's search input
  const [searchResults, setSearchResults] = useState([]); // Results from search API
  const [searchMarkers, setSearchMarkers] = useState([]); // Markers for search results
  const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false); // Controls form visibility
  const [type, setType] = useState(""); // Type of location being added

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    latitude: "",
    longitude: "",
    imageFile: null,
  });

  // Initialize the map when component mounts
  useEffect(() => {
    // Skip if map already exists
    if (mapInstanceRef.current) return;

    // Create map with initial view (Islamabad coordinates)
    const map = L.map(mapContainerRef.current).setView([33.6844, 73.0479], 12);

    // Add OpenStreetMap tiles
    L.tileLayer("http://localhost:9090/tile/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add zoom control
    L.control.zoom({ position: "topright" }).addTo(map);

    // Handle map clicks
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      
      // Update form with clicked coordinates
      setFormData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));   
      
        // Remove previous marker if exists
          if (mapInstanceRef.current.marker) {
            mapInstanceRef.current.marker.remove();
          }

        // Create new marker and add to map
        const marker = L.marker([lat.toFixed(6), lng.toFixed(6)]).addTo(mapInstanceRef.current);

        // Store marker reference so we can remove it later
        mapInstanceRef.current.marker = marker;


      // Open the add marker form
      setIsAddMarkerOpen(true);
    });

    // Store map instance in ref
    mapInstanceRef.current = map;

    //fetch locations types from server
    async function fetchLocationTypes() {

     const res= await axios.get(`http://localhost:3000/api/layers/type/location`);
     console.log(res.data);
     setType(res.data);
    }
    fetchLocationTypes();



    // Cleanup function (empty since we want the map to persist)
    return () => {};
  }, []);


  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value, // Handle file inputs differently
    }));
  };

  // Submit new location to server
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.type | !formData.latitude || !formData.longitude) return;

    // Prepare location data
    const newLocation = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      name: formData.name,
      description: formData.description,
      type : formData.type,
      image_url: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
    };

    try {
      // Send data to server
      const response = await fetch("http://localhost:3000/api/location/add-map-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });

      // If successful, add marker to map
      if (response.ok && mapInstanceRef.current) {
        // Create marker with permanent tooltip
        const marker = L.marker([newLocation.latitude, newLocation.longitude])
          .addTo(mapInstanceRef.current)
          .bindTooltip(newLocation.name, {
            permanent: true,
            direction: "top",
            offset: [0, -10],
          })
          .openTooltip();

        // Add popup with image if available
        if (newLocation.image_url) {
          marker.bindPopup(`
            <div style="width: 200px; padding: 10px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px;">${newLocation.name}</h3>
              <img 
                src="${newLocation.image_url}" 
                style="width: 100%; height: auto; border-radius: 4px;"
                alt="${newLocation.name}"
              />
              ${newLocation.description ? 
                `<p style="margin: 10px 0 0 0; font-size: 14px;">${newLocation.description}</p>` : 
                ''
              }
            </div>
          `);
        }

        // Reset form and close modal
        setIsAddMarkerOpen(false);
        setFormData({
          name: "",
          description: "",
          type: "",
          latitude: "",
          longitude: "",
          imageFile: null,
        });
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  // Search for locations using API
  const fetchSearchResults = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/location/search-location?location=${searchQuery}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  // Render the component
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Search box */}
      <div className="absolute top-2 right-78 z-10 w-[300px] space-y-3">
        <div className="p-4 rounded-lg shadow-lg backdrop-blur bg-white/60">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-black placeholder-gray-500 bg-white rounded-md shadow-inner outline-none"
          />
          <button
            onClick={fetchSearchResults}
            className="w-full px-4 py-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        {/* Search results list */}
        {searchResults.length > 0 && (
          <div className="backdrop-blur bg-white/70 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 last:border-none"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const { lat, lon } = result;
                    
                    // Center map on search result
                    mapInstanceRef.current.setView([lat, lon], 15);
                    
                    // Clear previous search markers
                    searchMarkers.forEach((marker) => marker.remove());
                    
                    // Create new marker for this result
                    const newMarker = L.marker([lat, lon])
                      .addTo(mapInstanceRef.current)
                      .bindTooltip(result.display_name, {
                        permanent: true,
                        direction: "top",
                        offset: [0, -10],
                        className: "custom-label",
                      });
                    
                    // Store new marker
                    setSearchMarkers([newMarker]);
                  }
                }}
              >
                <div className="text-sm font-semibold">{result.display_name}</div>
                <div className="text-xs text-gray-500">Type: {result.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add marker button */}
      <button
        className="absolute z-10 flex items-center justify-center w-12 h-12 text-white bg-[#FF9100] rounded-full shadow-lg bottom-35 right-85 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        onClick={() => setIsAddMarkerOpen(true)}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add marker form modal */}
      {isAddMarkerOpen && (
        <div className="absolute top-24 left-2 z-20 w-[320px] p-6 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/50 border border-white/40">
          <h2 className="text-xl font-semibold text-gray-900">Add Location</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full p-3 border border-gray-300 shadow-inner rounded-xl bg-white/70 focus:ring focus:ring-blue-300"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleFormChange}
              className="w-full p-3 border border-gray-300 shadow-inner rounded-xl bg-white/70 focus:ring focus:ring-blue-300"
            />
            <select name="type" id="type" onChange={handleFormChange} value={formData.type} className="w-full p-3 border border-gray-300 rounded-xl bg-white/70 focus:ring focus:ring-blue-300">
              <option value="" disabled>Select Type</option>
              {type && type.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="latitude"
              placeholder="Latitude"
              value={formData.latitude}
              readOnly
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              name="longitude"
              placeholder="Longitude"
              value={formData.longitude}
              readOnly
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl"
            />
            <input
              type="file"
              name="imageFile"
              onChange={handleFormChange}
              className="w-full p-3 border border-gray-300 rounded-xl bg-white/70"
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-green-500 shadow-lg rounded-xl hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddMarkerOpen(false)}
                className="px-6 py-2 text-white bg-red-500 shadow-lg rounded-xl hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MapAdminPanel;