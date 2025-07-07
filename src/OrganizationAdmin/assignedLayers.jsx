import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssignedLayers = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/layers/assignments');
      setAssignments(res.data);
        console.log("Assignments fetched:", res.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto mt-6 max-w-7xl">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Layer Assignments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="text-white bg-blue-600">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Layer Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">End Time</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.username}</td>
                  <td className="px-4 py-2">{item.layer_name}</td>
                  <td className="px-4 py-2 capitalize">{item.layer_category}</td>
                  <td className="px-4 py-2">
                    {item.start_time ? new Date(item.start_time).toLocaleString() : <span className="italic text-gray-400">Not set</span>}
                  </td>
                <td className="px-4 py-2">
                    {item.end_time ? new Date(item.end_time).toLocaleString() : <span className="italic text-gray-400">Not set</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedLayers;
