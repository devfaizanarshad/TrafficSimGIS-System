"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BranchForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "", // Fixed typo from "addresw" to "address"
    phone: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    phone: ""
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Branch name is required";
      isValid = false;
    } else {
      newErrors.name = "";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    } else {
      newErrors.address = "";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
      isValid = false;
    } else {
      newErrors.phone = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const createBranch = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:3000/api/admin/create-branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Branch created successfully!", { 
          position: "top-center", 
          autoClose: 3000,
          className: "bg-green-50 text-green-800"
        });
        setFormData({
          name: "",
          address: "",
          phone: ""
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create branch", { 
          position: "top-center", 
          autoClose: 3000,
          className: "bg-red-50 text-red-800"
        });
      }
    } catch (error) {
      console.error("Error adding Branch:", error);
      toast.error("Network error occurred", { 
        position: "top-center", 
        autoClose: 3000,
        className: "bg-red-50 text-red-800"
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="overflow-hidden bg-white rounded-lg shadow-xl">
          {/* Form Header */}
          <div className="px-6 py-4 bg-indigo-600">
            <h2 className="text-2xl font-bold text-white">Branch Registration</h2>
            <p className="text-indigo-100">Enter the details to create a new branch</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {renderInput("Branch Name", "name", formData, handleChange, true, errors.name)}
              {renderInput("Address", "address", formData, handleChange, true, errors.address)}
              {renderInput("Phone Number", "phone", formData, handleChange, true, errors.phone, "tel")}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => {
                  setFormData({
                    name: "",
                    address: "",
                    phone: ""
                  });
                  setErrors({
                    name: "",
                    address: "",
                    phone: ""
                  });
                }}
                className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
              <button 
                type="button" 
                onClick={createBranch}
                className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Branch
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function renderInput(label, name, formData, onChange, required = false, error = "", type = "text") {
  return (
    <div className={name === "address" ? "sm:col-span-2" : ""}>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={onChange}
        className={`w-full px-4 py-2 border ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"} rounded-md shadow-sm focus:outline-none focus:ring-2`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}