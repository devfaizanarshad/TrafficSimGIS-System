import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssignUserGeoLayer = () => {
  const [users, setUsers] = useState([]);
  const [geo, setGeo] = useState([]);
  const [layers, setLayers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    layer_type_id: '',
    geo_id: '',
    is_permitted: false,
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUsersAndLayers = async () => {
      try {
        const usersRes = await axios.get('http://localhost:3000/api/admin/list-users');
        const geoRes = await axios.get('http://localhost:3000/api/admin/list-geofences')
        console.log('Users:', usersRes.data.users);
        console.log('Geofence:', geoRes.data.geofences);
        
        setUsers(usersRes.data.users);
        setGeo(geoRes.data.geofences)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUsersAndLayers();
  }, []);

  useEffect(()=>{

    const fetchLayers = async()=>{
        const layersRes = await axios.get(`http://localhost:3000/api/layers/user/${formData.user_id}/layers`);
        // const layerOption = layersRes.data.filter(L => L.type === 'location').map(L =>({
        //     key : L.id,
        //     value: `${L.name} ${L.type}`
        // }))
        console.log(layersRes);
        
        setLayers(layersRes.data);
        console.log('Layers:', layersRes.data);

    }

    fetchLayers();

  }, [formData.user_id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Assigning layer...');

    try {
      const res = await axios.post('http://localhost:3000/api/usergeolayer/create', formData); // adjust endpoint if needed
      setMessage(`Assigned successfully`);
      setFormData({ user_id: '', layer_type_id: '', geo_id: '', is_permitted: '' });
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Server error'}`);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto mt-10 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Assign Geo Layer to User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Select User</label>
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Layer dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Select Layer</label>
          <select
            name="layer_type_id"
            value={formData.layer_type_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a layer</option>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Geofence dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Select Geofence</label>
          <select
            name="geo_id"
            value={formData.geo_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a Geofence</option>
            {geo.map((g) => (
              <option key={g.geo_id} value={g.geo_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        
<div className="flex items-center space-x-3">
  <input
    type="checkbox"
    name="is_permitted"
    checked={formData.is_permitted}
    onChange={(e) => setFormData({ ...formData, is_permitted: e.target.checked })}
    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
  <label className="text-sm text-gray-700">Restrict Locations (User will not see location in current geofence)</label>
</div>


        {/* Submit */}
        <button
          type="submit"
          className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Assign Geo Layer
        </button>
      </form>

      {message && (
        <div className="p-2 mt-4 text-sm text-center text-blue-700 bg-blue-100 rounded-md">
          {message}
        </div>
      )}
    </div>
  );
};

export default AssignUserGeoLayer;
