// import React, { useState, useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { Plus } from "lucide-react"; // Importing a clean plus icon

// const MapAdminPanel = () => {
//   const mapContainerRef = useRef(null);
//   const mapInstanceRef = useRef(null);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedLatLng, setSelectedLatLng] = useState(null);
//   const [searchMarkers, setSearchMarkers] = useState([]); // Store markers
//   const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false);
//   const [addMarker, setAddMarker] = useState(null); // State to store the marker reference
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     latitude: "",
//     longitude: "",
//     imageFile: null,
//   });

//   useEffect(() => {
//     if (mapInstanceRef.current) return;

//     const map = L.map(mapContainerRef.current).setView([33.6844, 73.0479], 12);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "© OpenStreetMap contributors",
//     }).addTo(map);

//     L.control.zoom({ position: "topright" }).addTo(map);

//     map.on("click", (e) => {
//       const { lat, lng } = e.latlng;
//       setSelectedLatLng({ lat, lng });
    
//       setFormData((prev) => ({
//         latitude: lat.toFixed(6),
//         longitude: lng.toFixed(6),
//       }));
    
//       // Remove the previous marker if it exists
//       if (addMarker) {        
//         addMarker.remove();
//       }
    
//       // Add new marker
//       const marker = L.marker([lat, lng])
//         .addTo(map)
//         .openPopup();
    
//       setAddMarker(marker); // Store the new marker reference
//       setIsAddMarkerOpen(true); // Open the modal for adding marker details
//     });
//     mapInstanceRef.current = map;
//   }, []);


//   const handleFormChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };


//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.latitude || !formData.longitude) return;

//     console.log(JSON.stringify({
//       latitude: formData.latitude,
//       longitude: formData.longitude,
//       name: formData.name,
//       description: formData.description,
//       image_url: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
//     }),);
    

//     try {
//       const response = await fetch("http://localhost:3000/api/location/add-map-location", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           latitude: formData.latitude,
//           longitude: formData.longitude,
//           name: formData.name,
//           description: formData.description,
//           image_url: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
//         }),
//       });

//       if (response.ok) {
//         if (mapInstanceRef.current) {
//           L.marker([formData.latitude, formData.longitude])
//             .addTo(mapInstanceRef.current)
//             .bindPopup(formData.name)
//             .openPopup();
//         }
//         setIsAddMarkerOpen(false);
//         setFormData({ name: "", description: "", latitude: "", longitude: "", imageFile: null });
//       }
//     } catch (error) {
//       console.error("Error adding location:", error);
//     }
//   };

//   const fetchSearchResults = async () => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/location/search-location?location=${searchQuery}`);
//       const data = await response.json();
//       setSearchResults(data);
//     } catch (error) {
//       console.error("Error fetching search results:", error);
//     }
//   };

//   return (
//     <div className="relative w-screen h-screen overflow-hidden">
//       {/* ✅ FIX: Added height styling here */}
//       <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

//       {/* Search Box */}
//       <div className="absolute top-2 right-78 z-10 w-[300px] space-y-3">
//         <div className="p-4 rounded-lg shadow-lg backdrop-blur bg-white/60">
//           <input
//             type="text"
//             placeholder="Search location..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full p-2 text-black placeholder-gray-500 bg-white rounded-md shadow-inner outline-none"
//           />
//           <button onClick={fetchSearchResults} className="w-full px-4 py-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
//             Search
//           </button>
//         </div>

//         {searchResults.length > 0 && (
//           <div className="backdrop-blur bg-white/70 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
//             {searchResults.map((result, idx) => (
//               <div
//                 key={idx}
//                 className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 last:border-none"
//                 onClick={() => {
//                   if (mapInstanceRef.current) {
//                     const { lat, lon, display_name } = result;

//                     // Move the map to the selected location
//                     mapInstanceRef.current.setView([lat, lon], 15);

//                     // Remove previous markers
//                     searchMarkers.forEach((marker) => marker.remove());

//                     // Add a new marker
//                     const newMarker = L.marker([lat, lon])
//                       .addTo(mapInstanceRef.current)
//                       .bindPopup(display_name)
//                       .openPopup();

//                     setSearchMarkers([newMarker]); // Store the new marker
//                   }
//                 }}
//               >
//                 <div className="text-sm font-semibold">{result.display_name}</div>
//                 <div className="text-xs text-gray-500">Type: {result.type}</div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modal for Adding Locations */}

//             {/* Add Marker Button */}
//             <button
//   className="absolute z-10 flex items-center justify-center w-12 h-12 text-white bg-[#FF9100] rounded-full shadow-lg bottom-35 right-85 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
//   onClick={() => setIsAddMarkerOpen(true)}
// >
//   <Plus size={24} strokeWidth={2.5} />
// </button>



//       <div
//         className={`absolute top-16 left-2 z-20 w-[320px] p-6 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/50 border border-white/40 transition-all duration-500 ease-in-out transform ${
//           isAddMarkerOpen ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-10 scale-95 pointer-events-none"
//         }`}
//       >
//         <h2 className="text-xl font-semibold text-gray-900">Add Location</h2>
//         <form onSubmit={handleFormSubmit} className="space-y-4">
//           <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleFormChange} className="w-full p-3 border border-gray-300 shadow-inner rounded-xl bg-white/70 focus:ring focus:ring-blue-300" required />
//           <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} className="w-full p-3 border border-gray-300 shadow-inner rounded-xl bg-white/70 focus:ring focus:ring-blue-300" />
//           <input type="text" name="latitude" placeholder="Latitude" value={formData.latitude} readOnly className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl" />
//           <input type="text" name="longitude" placeholder="Longitude" value={formData.longitude} readOnly className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl" />
//           <input type="file" name="imageFile" onChange={handleFormChange} className="w-full p-3 border border-gray-300 rounded-xl bg-white/70" />
//           <div className="flex justify-between">
//             <button type="submit" className="px-6 py-2 text-white bg-green-500 shadow-lg rounded-xl hover:bg-green-600">Save</button>
//             <button type="button" onClick={() => setIsAddMarkerOpen(false)} className="px-6 py-2 text-white bg-red-500 shadow-lg rounded-xl hover:bg-red-600">Cancel</button>
//           </div>
//         </form>
//       </div>

//     </div>
//   );
// };

// export default MapAdminPanel;



import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus } from "lucide-react";

const MapAdminPanel = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLatLng, setSelectedLatLng] = useState(null);
  const [searchMarkers, setSearchMarkers] = useState([]);
  const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    imageFile: null,
  });

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([33.6844, 73.0479], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLatLng({ lat, lng });

      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));

      setIsAddMarkerOpen(true);
    });

    mapInstanceRef.current = map;
  }, []);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude) return;

    const newLocation = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      name: formData.name,
      description: formData.description,
      image_url: formData.imageFile ? URL.createObjectURL(formData.imageFile) : "",
    };

    try {
      const response = await fetch("http://localhost:3000/api/location/add-map-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocation),
      });

      if (response.ok && mapInstanceRef.current) {
        // Add marker with name as permanent tooltip
        L.marker([newLocation.latitude, newLocation.longitude])
          .addTo(mapInstanceRef.current)
          .bindTooltip(newLocation.name, {
            permanent: true,
            direction: "top",
            offset: [0, -10],
          })
          .openTooltip();

        setIsAddMarkerOpen(false);
        setFormData({
          name: "",
          description: "",
          latitude: "",
          longitude: "",
          imageFile: null,
        });
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

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

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Search Box */}
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

        {searchResults.length > 0 && (
          <div className="backdrop-blur bg-white/70 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 last:border-none"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const { lat, lon, display_name } = result;

                    mapInstanceRef.current.setView([lat, lon], 15);
                    searchMarkers.forEach((marker) => marker.remove());

                    const newMarker = L.marker([newLocation.latitude, newLocation.longitude])
                    .addTo(mapInstanceRef.current)
                    .bindTooltip(newLocation.name, {
                      permanent: true,
                      direction: "top", // or 'right', 'left', 'bottom'
                      offset: [0, -10],
                      className: "custom-label", // You can style it as a label
                      interactive: false,
                    });
                  

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

      {/* Add Marker Button */}
      <button
        className="absolute z-10 flex items-center justify-center w-12 h-12 text-white bg-[#FF9100] rounded-full shadow-lg bottom-35 right-85 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        onClick={() => setIsAddMarkerOpen(true)}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Add Marker Modal */}
      <div
        className={`absolute top-16 left-2 z-20 w-[320px] p-6 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/50 border border-white/40 transition-all duration-500 ease-in-out transform ${
          isAddMarkerOpen
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-0 -translate-x-10 scale-95 pointer-events-none"
        }`}
      >
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
    </div>
  );
};

export default MapAdminPanel;
