import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

const AssignedUserGeoLayers = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/usergeolayer/allusergeolayer');
      setAssignments(res.data);
        console.log("Assignments fetched:", res.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const hideLayer= async (item) => {

    console.log(item);

     try {
                console.log(item.ugl_id);
                
                const response = await axios.patch(
                  `http://localhost:3000/api/usergeolayer/permitUserGeoLayer/${item.ugl_id}`
                );

                if (response.status === 200) {
                  toast.success("Layer Hiden successfully!");
                } else {
                  toast.error("Failed to Hide Layer");
                }
              } catch (error) {
                console.error("Error Hiding Layer:", error);
                toast.error("An error occurred while Hidding the Layer");
              }

    // toast.info(      

    //   <div className="p-4">
    //     <h3 className="text-lg font-semibold text-gray-800">Confirm Hiding Layer</h3>
    //     <p className="mt-2 text-gray-600">
    //       Are you sure you want to Hide <span className="font-medium">{item.layer_name}</span>?
    //     </p>
    //     <div className="flex justify-end mt-4 space-x-3">
    //       <button 
    //         onClick={() => toast.dismiss()}
    //         className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-md hover:bg-gray-300"
    //       >
    //         Cancel
    //       </button>
    //       <button
    //         className="px-4 py-2 text-white transition bg-red-500 rounded-md hover:bg-red-600"
    //         onClick={async () => {
    //           toast.dismiss();
             
    //         }}
    //       >
    //         Confirm
    //       </button>
    //     </div>
    //   </div>,
    //   {
    //     autoClose: false,
    //     closeOnClick: false,
    //     closeButton: false
    //   }
    // );
  };

  return (
    <div className="p-6 mx-auto mt-6 max-w-7xl">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">Layer User Geo Assignments</h2>

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
                <th className="px-4 py-2 text-left">Geofence Name</th>
                <th className="px-4 py-2 text-left">Status</th>


              </tr>
            </thead>
            <tbody>
              {assignments.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.username}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.geofencename}</td>

                  
                  
<td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
<div className="flex justify-end space-x-3">

<button
  onClick={() => hideLayer(item)}
  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
    item.is_permitted
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-red-100 text-red-800 hover:bg-red-200"
  }`}
  title={item.is_permitted ? "Show this Layer" : "Hide this Layer"}
>
  {item.is_permitted ? "Show Layer" : "Hide Layer"}
</button>
  
</div>
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

export default AssignedUserGeoLayers;
