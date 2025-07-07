import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import axios from 'axios';

const DrawControl = () => {
  const map = useMap();
  const [modalState, setModalState] = useState({
    show: false,
    loading: false,
    error: null
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    hasThreat: false,
    threatLevel: 'low'
  });
  const [currentLayer, setCurrentLayer] = useState(null);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: true,
        polygon: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    map.addControl(drawControl);

    const handleLayerCreated = (event) => {
      setCurrentLayer(event.layer);
      setModalState(prev => ({ ...prev, show: true }));
    };

    map.on(L.Draw.Event.CREATED, handleLayerCreated);

    //fetch locations types from server
    async function fetchLocationTypes() {

     const res= await axios.get(`http://localhost:3000/api/layers/type/line`);
     console.log(res.data);
     setTypes(res.data);
    }
    fetchLocationTypes();

    return () => {
      map.off(L.Draw.Event.CREATED, handleLayerCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Line name is required');
      }

      // Extract coordinates from the drawn layer
      const coordinates = currentLayer.getLatLngs().map(point => [point.lng, point.lat]);

      // Prepare payload
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        hasThreat: formData.hasThreat,
        threatLevel: formData.hasThreat ? formData.threatLevel : null,
        geometry: coordinates
      };

      // Send to backend
      const response = await axios.post(
        'http://localhost:3000/api/location/map-lines', 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to save line');
      }

      // Add to map and reset form
      map.eachLayer(layer => {
        if (layer instanceof L.FeatureGroup) {
          layer.addLayer(currentLayer);
        }
      });

      setFormData({
        name: '',
        description: '',
        category: '',
        hasThreat: false,
        threatLevel: 'low'
      });
      setModalState(prev => ({ ...prev, show: false }));
    } catch (error) {
      console.error('Submission error:', error);
      setModalState(prev => ({
        ...prev,
        error: error.response?.data?.error || error.message
      }));
    } finally {
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      {modalState.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Save Polyline</h2>
            
            {modalState.error && (
              <div className="error-message">
                {modalState.error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Line Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.loading}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={modalState.loading}
                />
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.loading}
                >
              <option value="" disabled>Select Type</option>
              {types && types.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
                </select>
              </div>
              
              {/* <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="hasThreat"
                    checked={formData.hasThreat}
                    onChange={handleInputChange}
                    disabled={modalState.loading}
                  />
                  Has Threat?
                </label>
              </div> */}
              
              {formData.hasThreat && (
                <div className="form-group">
                  <label>Threat Level *</label>
                  <select
                    name="threatLevel"
                    value={formData.threatLevel}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModalState(prev => ({ ...prev, show: false }))}
                  disabled={modalState.loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalState.loading}
                >
                  {modalState.loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const MapPage = () => {
  return (
    <div className="map-container">
      <header className="map-header">
        <h1>Map Line Drawing Tool</h1>
        <p>Draw polylines on the map and add details</p>
      </header>
      
      <div className="map-wrapper">
        <MapContainer
          center={[33.6844, 73.0479]}
          zoom={13}
          className="leaflet-container"
        >
          <TileLayer
            url="http://localhost:9090/tile/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DrawControl />
        </MapContainer>
      </div>

      <style jsx>{`
        .map-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .map-header {
          padding: 1rem;
          background: #f0f0f0;
          border-bottom: 1px solid #ddd;
        }
        
        .map-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .map-header p {
          margin: 0.5rem 0 0;
          color: #666;
        }
        
        .map-wrapper {
          flex: 1;
          position: relative;
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        
        /* Modal styles remain the same as before */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .error-message {
          color: #d32f2f;
          background: #fde0e0;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-group input[type="text"],
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
        }
        
        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: normal;
          cursor: pointer;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .form-actions button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .form-actions button[type="button"] {
          background: #f0f0f0;
        }
        
        .form-actions button[type="submit"] {
          background: #1890ff;
          color: white;
        }
        
        .form-actions button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MapPage;