import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssignLayerToUser = () => {
  const [users, setUsers] = useState([]);
  const [layers, setLayers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    layer_type_id: '',
    start_time: null,
    end_time: null,
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchUsersAndLayers = async () => {
      try {
        const usersRes = await axios.get('http://localhost:3000/api/admin/list-users');
        const layersRes = await axios.get('http://localhost:3000/api/layers/all');
        console.log('Users:', usersRes.data.users);
        console.log('Layers:', layersRes.data);
        setUsers(usersRes.data.users);
        setLayers(layersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUsersAndLayers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Assigning layer...');

    try {
      const res = await axios.post('http://localhost:3000/api/layers/assign', formData); // adjust endpoint if needed
      setMessage(`Assigned successfully to ${res.data.username || 'user'}`);
      setFormData({ user_id: '', layer_type_id: '', start_time: '', end_time: '' });
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Server error'}`);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto mt-10 bg-white border border-gray-200 rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Assign Layer to User</h2>

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
                {layer.name} ({layer.type})
              </option>
            ))}
          </select>
        </div>

        {/* Start time */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Start Time (optional)</label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* End time (optional) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">End Time (optional)</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Assign Layer
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

export default AssignLayerToUser;
