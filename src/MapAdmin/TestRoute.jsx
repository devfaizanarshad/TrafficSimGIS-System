import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

function TestRoute() {
  const [usource, setUSource] = useState([33.5954056, 73.0512473]);
  const [udestination, setUdestination] = useState([33.6194097, 73.0200321]);
  const [route, setRoute] = useState([]);
  const [congestedSegments, setCongestedSegments] = useState([]);
  const [isRoute, setIsRoute] = useState(false);
  const [isCongested, setIsCongested] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await axios.post(`http://localhost:3000/api/location/get-route`, {
          source: usource,
          destination: udestination
        });

        const fullRoute = res.data?.path || [];
        const congestedPoints = res.data?.congestedPoints || [];

        setRoute(fullRoute);
        setIsRoute(fullRoute.length > 0);
        console.log("Route fetched:", fullRoute);

        // Match congested segments
        if (congestedPoints.length > 0) {
          const segments = [];

          for (let i = 0; i < fullRoute.length - 1; i++) {
            const start = fullRoute[i];
            const end = fullRoute[i + 1];

            congestedPoints.forEach(cloc => {
              const isStartClose =
                Math.abs(start[0] - cloc.lat) < 0.0001 &&
                Math.abs(start[1] - cloc.lon) < 0.0001;

              const isEndClose =
                Math.abs(end[0] - cloc.lat) < 0.0001 &&
                Math.abs(end[1] - cloc.lon) < 0.0001;

              if (isStartClose || isEndClose) {
                segments.push([start, end]);
              }
            });
          }

          setCongestedSegments(segments);
          setIsCongested(segments.length > 0);
          console.log("Matched congested segments:", segments);
        }

      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, []);

  return (

    
    <div className="h-[1000px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={[33.6844, 73.0479]}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          url="http://localhost:9090/tile/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Source Marker */}
        <Marker key="source" position={usource}>
          <Popup>Source</Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker key="destination" position={udestination}>
          <Popup>Destination</Popup>
        </Marker>

        {/* Full Route Polyline (Blue) */}
        {isRoute && route.length > 1 && (
          <Polyline
            positions={route.map(loc => [loc[0], loc[1]])}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Congested Segments (Red) */}
        {isCongested && congestedSegments.length > 0 &&
          congestedSegments.map((segment, idx) => (
            <Polyline
              key={`cong-${idx}`}
              positions={segment}
              color="red"
              weight={5}
              opacity={0.9}
            />
          ))
        }

      </MapContainer>

      <div>
        <form action="" method="post">
          <input type="text" name="source" value={JSON.stringify(usource)} onChange={e => setUSource(JSON.parse(e.target.value))} />
          <input type="text" name="destination" value={JSON.stringify(udestination)} onChange={e => setUdestination(JSON.parse(e.target.value))} />
          <button type="submit">Report Congestion</button>
        </form>
      </div>
    </div>
  );
}


export default TestRoute;
