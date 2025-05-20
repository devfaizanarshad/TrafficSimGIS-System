// components/ViewUserModal.jsx
"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import { motion } from "framer-motion";

const ViewUserModal = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="w-full max-w-lg p-6 bg-white shadow-xl rounded-xl"
      >
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">User Details</h2>
        <div className="space-y-3">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>City:</strong> {user.city}</p>
          <p className="relative">
            <strong>Password:</strong> {showPassword ? user.password : "********"}
            <button
              className="absolute ml-2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewUserModal;
