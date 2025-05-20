"use client";

import { useState, useEffect, useRef } from "react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ApplianceForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Employee",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    phone: "",
    branch_name: "",
    image: null
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/list-branches");
        const data = await response.json();
        setBranches(data.branches || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches", { position: "top-center" });
      }
    };
    fetchBranches();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.branch_name) newErrors.branch_name = "Branch is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === "image" && formData[key]) {
          formDataToSend.append("image", formData[key]);
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch("http://localhost:3000/api/admin/create-user", {
        method: "POST",
        body: formDataToSend, // No Content-Type header needed for FormData
      });

      if (response.ok) {
        toast.success("User registered successfully!", { position: "top-center" });
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to register user", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Network error occurred", { position: "top-center" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "Employee",
      first_name: "",
      last_name: "",
      address: "",
      city: "",
      phone: "",
      branch_name: "",
      image: null
    });
    setErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file", { position: "top-center" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should be less than 2MB", { position: "top-center" });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange({ target: { files: [file] } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl overflow-hidden bg-white shadow-md rounded-xl">
        {/* Form Header */}
        <div className="p-6 text-white bg-indigo-600">
          <h1 className="text-2xl font-bold">User Registration</h1>
          <p className="opacity-90">Fill in the details to create a new user account</p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {renderInput("Username", "username", formData, handleChange, true, errors.username)}
            {renderInput("Email", "email", formData, handleChange, true, errors.email, "email")}
            
            <div className="relative">
              {renderInput(
                "Password", 
                "password", 
                formData, 
                handleChange, 
                true, 
                errors.password,
                showPassword ? "text" : "password"
              )}
              <button
                type="button"
                className="absolute text-gray-500 right-3 top-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {renderInput("First Name", "first_name", formData, handleChange, true, errors.first_name)}
            {renderInput("Last Name", "last_name", formData, handleChange, true, errors.last_name)}
            {renderInput("Address", "address", formData, handleChange, false, errors.address)}
            {renderInput("City", "city", formData, handleChange, false, errors.city)}
            {renderInput("Phone", "phone", formData, handleChange, false, errors.phone, "tel")}

            {/* Role Selection */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            {/* Branch Dropdown */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Branch <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full p-2.5 border ${errors.branch_name ? "border-red-500" : "border-gray-300"} rounded-lg cursor-pointer flex justify-between items-center`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className={formData.branch_name ? "text-gray-800" : "text-gray-400"}>
                  {formData.branch_name || "Select a branch"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search branch..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-60">
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((branch) => (
                        <div
                          key={branch.id}
                          className="p-3 cursor-pointer hover:bg-indigo-50"
                          onClick={() => {
                            handleChange({ target: { name: "branch_name", value: branch.name } });
                            setIsOpen(false);
                          }}
                        >
                          {branch.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500">No branches found</div>
                    )}
                  </div>
                </div>
              )}
              {errors.branch_name && (
                <p className="mt-1 text-sm text-red-500">{errors.branch_name}</p>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.image ? "border-red-500" : "border-gray-300"} hover:border-indigo-400 transition-colors`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {formData.image ? (
                <div className="flex flex-col items-center">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="object-cover w-32 h-32 mb-3 border-2 border-gray-200 rounded-full"
                  />
                  <div className="flex space-x-2">
                    <label className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm cursor-pointer hover:bg-indigo-700 transition-colors">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
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
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600">
                    Drag and drop an image here, or click to browse
                  </p>
                  <label className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700">
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-4 space-x-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={createUser}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && (
                <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? "Processing..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

function renderInput(label, name, formData, onChange, required = false, error = "", type = "text") {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={onChange}
        className={`w-full p-2.5 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}