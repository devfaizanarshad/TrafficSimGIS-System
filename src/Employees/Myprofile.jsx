import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { MapContext } from '../Context/Context';

export default function MyProfile() {
  const [profileInfo, setProfileInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const {employeeId, image} = useContext(MapContext);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`http://localhost:3000/api/employee/my-profile/${employeeId}`);
        const data = res.data.profile;
        setProfileInfo(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee Profile data');
        setLoading(false);
      }
    }
    fetchProfile();
  }, [employeeId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="w-full px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {loading ? (
          <div className="p-8 overflow-hidden bg-white shadow-xl rounded-2xl animate-pulse">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="space-y-4 md:w-1/3">
                <div className="w-40 h-40 mx-auto bg-gray-200 rounded-full"></div>
                <div className="w-3/4 h-6 mx-auto bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 mx-auto bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6 md:w-2/3">
                <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
                <div className="h-px bg-gray-200"></div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                      <div className="w-full h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="flex flex-col md:flex-row">
              {/* Left Profile Section - Wider now */}
              <div className="flex flex-col items-center p-8 md:w-2/5 bg-gradient-to-b from-blue-50 to-blue-100">
                <div className="w-40 h-40 mb-6 overflow-hidden rounded-full shadow-md">
                  <img
                    className="object-cover w-full h-full"
                    src={`http://localhost:3000${image}`}
                    alt={`${profileInfo.first_name} ${profileInfo.last_name}`}
                  />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  {`${profileInfo.first_name} ${profileInfo.last_name}`}
                </h2>
                <p className="flex items-center gap-1 mt-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  ID: {profileInfo.employee_id}
                </p>
                
                {/* Additional profile info in the left panel */}
                <div className="w-full mt-8 space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-800">Department</h4>
                    <p className="text-gray-600">{profileInfo.name || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-800">Position</h4>
                    <p className="text-gray-600">{profileInfo.role || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-medium text-gray-800">Employment Date</h4>
                      <p className="text-gray-600">
                          {profileInfo.join_date 
                            ? new Date(profileInfo.join_date).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                            day: 'numeric'
                          }) 
                        : 'Not specified'}
                        </p>
                  </div>
                </div>
              </div>

              {/* Right Details Section - Now with more information */}
              <div className="p-8 md:w-3/5">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Personal Information</h3>
                <div className="h-px mb-6 bg-gray-200"></div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Personal Info */}
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-800">{`${profileInfo.first_name} ${profileInfo.last_name}`}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-800">{profileInfo.email || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-800">{profileInfo.phone || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Title</p>
                      <p className="text-gray-800">{profileInfo.role || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-800">
                        {profileInfo.address || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-800">{profileInfo.date_of_birth || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="mt-12">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800">Emergency Contact</h3>
                  <div className="h-px mb-6 bg-gray-200"></div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-800">{profileInfo.emergency_contact_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Relationship</p>
                      <p className="text-gray-800">{profileInfo.emergency_contact_relationship || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-800">{profileInfo.emergency_contact_phone || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-10">
                  <button className="px-6 py-2 font-medium text-white transition duration-200 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                    Edit Profile
                  </button>
                  <button className="px-6 py-2 font-medium text-blue-600 transition duration-200 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                    Account Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}