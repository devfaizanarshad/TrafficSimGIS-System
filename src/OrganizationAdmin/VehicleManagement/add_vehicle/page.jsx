"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VehicleForm() {
  const [formData, setFormData] = useState({
    model: "",
    year: "",
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.year.trim()) newErrors.year = "Year is required";
    else if (!/^\d{4}$/.test(formData.year)) newErrors.year = "Invalid year format";
    if (!formData.image) newErrors.image = "Image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createVehicle = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('image', formData.image);

      const response = await fetch("http://localhost:3000/api/admin/create-vehicle", {
        method: "POST",
        body: formDataToSend
      });

      if (response.ok) {
        toast.success("Vehicle created successfully!", {
          position: "top-center",
          className: "!bg-green-50 !text-green-800"
        });
        setFormData({ model: "", year: "", image: null });
      } else {
        toast.error("Failed to create vehicle", {
          position: "top-center",
          className: "!bg-red-50 !text-red-800"
        });
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Network error occurred", {
        position: "top-center",
        className: "!bg-red-50 !text-red-800"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error("Please select an image file", {
          position: "top-center",
          className: "!bg-red-50 !text-red-800"
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB", {
          position: "top-center",
          className: "!bg-red-50 !text-red-800"
        });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="overflow-hidden bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-2xl font-bold text-white">Add New Vehicle</h1>
            <p className="mt-2 text-blue-100">Enter vehicle details below</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Model Input */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.model ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g. Toyota Corolla"
                />
                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
              </div>

              {/* Year Input */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.year ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g. 2022"
                />
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Vehicle Image <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.image ? "border-red-300" : "border-gray-300"} hover:border-blue-400 transition-colors`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
              >
                {formData.image ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Vehicle preview"
                      className="object-contain mb-3 rounded-lg max-h-48"
                    />
                    <div className="flex space-x-3">
                      <label className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm cursor-pointer hover:bg-blue-700 transition-colors">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                        className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {formData.image.name} ({(formData.image.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">Drag and drop an image here, or click to browse</p>
                    <label className="inline-block px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                      Select Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500">JPG, PNG up to 2MB</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6 space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setFormData({ model: "", year: "", image: null });
                  setErrors({});
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={createVehicle}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-lg text-white flex items-center gap-2 ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Create Vehicle"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="!rounded-lg !shadow-lg !p-4 !m-2"
      />
    </div>
  );
}