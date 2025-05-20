import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import debounce from 'lodash.debounce';

const SleekRouteUI = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [sourceResults, setSourceResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);
  const [showSourceResults, setShowSourceResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Custom SVG icons for markers
  const sourceSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height="30" width="30" style="cursor: pointer;">
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#4CAF50"></path>
      <path d="M192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="white"></path>
    </svg>`;

  const destinationSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height="30" width="30" style="cursor: pointer;">
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#E91E63"></path>
      <path d="M192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" fill="white"></path>
    </svg>`;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query, type) => {
      if (!query || query.length < 3) {
        if (type === 'source') {
          setSourceResults([]);
          setShowSourceResults(false);
        } else {
          setDestinationResults([]);
          setShowDestinationResults(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/location/search-location?location=${query}`);
        const data = await res.json();

        if (type === "source") {
          setSourceResults(data);
          setShowSourceResults(true);
        } else {
          setDestinationResults(data);
          setShowDestinationResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { 
      zoomControl: false,
      tap: !L.Browser.mobile,
      touchZoom: true,
      dragging: true
    }).setView([33.6844, 73.0479], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      detectRetina: true
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'source') {
      setSource(value);
      debouncedSearch(value, 'source');
    } else {
      setDestination(value);
      debouncedSearch(value, 'destination');
    }
  };

  const handleLocationSelect = (location, type) => {
    const coords = [parseFloat(location.lat), parseFloat(location.lon)];
    
    if (type === "source") {
      setSourceCoords(coords);
      setSource(location.display_name);
      setShowSourceResults(false);
      placeMarker(coords, "Source", sourceSVG);
    } else {
      setDestinationCoords(coords);
      setDestination(location.display_name);
      setShowDestinationResults(false);
      placeMarker(coords, "Destination", destinationSVG);
    }
  };

  const placeMarker = (coords, label, svgMarkup) => {
    const map = mapInstanceRef.current;

    const customDivIcon = L.divIcon({
      html: svgMarkup,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    map.eachLayer(layer => {
      if (layer instanceof L.Marker && layer.options.icon?.options?.html === svgMarkup) {
        map.removeLayer(layer);
      }
    });

    L.marker(coords, { icon: customDivIcon })
      .addTo(map)
      .bindPopup(label)
      .openPopup();

    map.setView(coords, 13);
  };

  const handleFindRoute = async () => {
    if (!sourceCoords || !destinationCoords) {
      alert("Please select both Source and Destination.");
      return;
    }

    try {
      const url = `http://localhost:8989/route?point=${sourceCoords.join(",")}&point=${destinationCoords.join(",")}&type=json&profile=car`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.paths && data.paths.length > 0) {
        const path = data.paths[0];
        const coords = decodePolyline(path.points);

        const congestedPoints = await checkCongestion(coords);
        animateRoute(coords, congestedPoints);
        
        setInstructions(path.instructions || []);
        
        // On mobile, hide sidebar after finding route
        if (isMobileView) {
          setShowSidebar(false);
        }
      } else {
        alert("No route found.");
      }
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  const checkCongestion = async (coords) => {
    try {
      const response = await fetch('http://localhost:3000/api/location/check-congestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ graphhopper_coordinates: coords })
      });

      const data = await response.json();

      if (data.result && data.result.status === "Segment is Congested") {
        return data.result.matchedPoints;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Congestion check error:', error);
      return [];
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  const animateRoute = (coords, congestedPoints = []) => {
    const map = mapInstanceRef.current;
  
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }
  
    const isCongested = (lat, lon) => {
      return congestedPoints.some(p => 
        Math.abs(p.lat - lat) < 0.0005 && Math.abs(p.lon - lon) < 0.0005
      );
    };
  
    const segments = [];
  
    for (let i = 0; i < coords.length - 1; i++) {
      const start = coords[i];
      const end = coords[i + 1];
  
      const congested = isCongested(start[0], start[1]) || isCongested(end[0], end[1]);
  
      const segment = L.polyline([start, end], {
        color: congested ? 'red' : '#0077FF',
        weight: 4,
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(map);
  
      segments.push(segment);
    }
  
    const group = L.featureGroup(segments);
    map.fitBounds(group.getBounds(), {
      padding: [30, 30], // Add padding to ensure controls aren't overlapped
      maxZoom: 15 // Prevent zooming in too much on mobile
    });
  
    routeLayerRef.current = group;
  };

  // Function to format long display names
  const formatDisplayName = (name) => {
    const parts = name.split(', ');
    if (parts.length <= 3) return name;
    
    // Show first part and last two parts (usually most relevant)
    return `${parts[0]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  };

  return (
    <div className="relative flex flex-col h-screen bg-white md:flex-row">
      {/* Mobile menu button */}
      {isMobileView && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute z-20 p-2 m-2 text-white transition-colors bg-blue-500 rounded-md shadow-md md:hidden top-16 left-2 hover:bg-blue-600"
        >
          {showSidebar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}

      {/* Left Panel */}
      {showSidebar && (
        <div className={`absolute z-10 w-full p-4 bg-white shadow-lg md:relative md:w-96 md:shadow-none md:h-full transition-all duration-300 ${isMobileView ? 'top-16' : ''}`}>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Route Finder</h2>

          {/* Source Input */}
          <div className="relative mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Source Location</label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={source}
                onChange={(e) => handleInputChange(e, 'source')}
                onFocus={() => source.length >= 3 && setShowSourceResults(true)}
                onBlur={() => setTimeout(() => setShowSourceResults(false), 200)}
                className="flex-1 px-4 py-3 text-sm transition-all border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter starting point"
              />
              <button
                onClick={() => debouncedSearch(source, 'source')}
                disabled={isLoading || source.length < 3}
                className="px-4 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && showSourceResults ? (
                  <svg className="w-4 h-4 mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Search"}
              </button>
            </div>
            
            {/* Source Results Dropdown */}
            {showSourceResults && (
              <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <ul className="py-1 overflow-auto max-h-60">
                    {sourceResults.length > 0 ? (
                      sourceResults.map((result, index) => (
                        <li 
                          key={index} 
                          className="px-4 py-3 transition-colors cursor-pointer hover:bg-blue-50"
                          onClick={() => handleLocationSelect(result, "source")}
                        >
                          <div className="font-medium text-gray-800">
                            <div className="truncate">{formatDisplayName(result.display_name)}</div>
                            {result.display_name !== formatDisplayName(result.display_name) && (
                              <div className="text-xs text-gray-400 truncate" title={result.display_name}>
                                {result.display_name}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-500">
                        {source.length >= 3 ? "No results found" : "Type at least 3 characters"}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="relative mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Destination Location</label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={destination}
                onChange={(e) => handleInputChange(e, 'destination')}
                onFocus={() => destination.length >= 3 && setShowDestinationResults(true)}
                onBlur={() => setTimeout(() => setShowDestinationResults(false), 200)}
                className="flex-1 px-4 py-3 text-sm transition-all border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter destination"
              />
              <button
                onClick={() => debouncedSearch(destination, 'destination')}
                disabled={isLoading || destination.length < 3}
                className="px-4 py-3 text-sm font-medium text-white transition-colors bg-red-500 rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && showDestinationResults ? (
                  <svg className="w-4 h-4 mx-auto animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Search"}
              </button>
            </div>
            
            {/* Destination Results Dropdown */}
            {showDestinationResults && (
              <div className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <ul className="py-1 overflow-auto max-h-60">
                    {destinationResults.length > 0 ? (
                      destinationResults.map((result, index) => (
                        <li 
                          key={index} 
                          className="px-4 py-3 transition-colors cursor-pointer hover:bg-red-50"
                          onClick={() => handleLocationSelect(result, "destination")}
                        >
                          <div className="font-medium text-gray-800">
                            <div className="truncate">{formatDisplayName(result.display_name)}</div>
                            {result.display_name !== formatDisplayName(result.display_name) && (
                              <div className="text-xs text-gray-400 truncate" title={result.display_name}>
                                {result.display_name}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-500">
                        {destination.length >= 3 ? "No results found" : "Type at least 3 characters"}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Find Route Button */}
          <button
            onClick={handleFindRoute}
            disabled={!sourceCoords || !destinationCoords}
            className="w-full py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Route
          </button>

        </div>
      )}

      {/* Map */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapRef} className="absolute top-0 bottom-0 left-0 right-0 z-0" />
      </div>
    </div>
  );
};

export default SleekRouteUI;