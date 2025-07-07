import React, { useState, useRef } from 'react';
import axios from 'axios';

const AddLayer = () => {
const [formData, setFormData] = useState({
  name: '',
  type: '',
  description: '',
  image: null,
  is_public: false,
});


  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'type') {
      setFormData({ ...formData, type: value, image: null });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, image: file });
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Creating layer...', type: 'info' });

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('type', formData.type);
    payload.append('description', formData.description);
    payload.append('is_public', formData.is_public);
    if (formData.image) {
      payload.append('image', formData.image);
    }

    try {
      const res = await axios.post('http://localhost:3000/api/layers/create', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ text: `Layer "${res.data.name}" created successfully!`, type: 'success' });
      setFormData({ name: '', type: '', description: '', image: null });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setMessage({
        text: `Error: ${error.response?.data?.message || 'Server error'}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-4xl p-6 mx-auto mt-10 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Add New Layer</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Form Column */}
        <div className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              required
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter layer name"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              required
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="location">Location</option>
              <option value="line">Line</option>
              <option value="threat">Threat</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
            ></textarea>
          </div>

          <div className="flex items-center space-x-3">
  <input
    type="checkbox"
    name="is_public"
    checked={formData.is_public}
    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
  <label className="text-sm text-gray-700">Make this layer public (visible to all users)</label>
</div>


          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Image (.png - required for all types)</label>
            <input
              type="file"
              name="image"
              ref={fileInputRef}
              accept=".png"
              required
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Create Layer
          </button>
        </div>

        {/* Image Preview */}
        <div className="flex flex-col items-center justify-center p-4 border border-gray-300 border-dashed rounded-lg bg-gray-50">
          <p className="mb-2 text-sm text-gray-600">Image Preview</p>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Layer preview"
              className="object-contain w-full rounded max-h-72"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 text-gray-400 bg-white border rounded">
              <span className="text-sm">No image selected</span>
            </div>
          )}
        </div>
      </form>

      {message.text && (
        <div
          className={`mt-6 text-sm text-center px-4 py-3 rounded-md ${
            message.type === 'error'
              ? 'bg-red-100 text-red-700'
              : message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default AddLayer;
