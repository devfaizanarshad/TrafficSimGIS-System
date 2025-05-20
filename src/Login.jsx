import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSignInAlt, 
  FaLock, 
  FaEnvelope, 
  FaUsers, 
  FaCarAlt, 
  FaMapMarkedAlt, 
  FaBuilding, 
  FaBell,
  FaRoute,
  FaShieldAlt,
  FaChartLine
} from 'react-icons/fa';
import { RiMapPinTimeFill } from 'react-icons/ri';
import { MapContext } from './Context/Context.jsx';

function Login() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { setManagerId, setEmployeeId, setRole, setUserName, setImage } = useContext(MapContext);

  const features = [
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: "Geofence Management",
      description: "Define virtual boundaries with precision and receive instant alerts"
    },
    {
      icon: <RiMapPinTimeFill className="text-4xl" />,
      title: "Real-time Tracking",
      description: "Monitor employee movements with live location updates"
    },
    {
      icon: <FaRoute className="text-4xl" />,
      title: "Optimized Routing",
      description: "Route planning with traffic congestion data"
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Security Compliance",
      description: "Enterprise-grade security for all your location data"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering]);

  async function userLogin() {
    setIsLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/login`, {
        email: email,
        password: password,
      });

      const result = res.data.user;
      console.log(result);
      
      setRole(result.role);
      localStorage.setItem('role', result.role )
      setUserName(result.username);
      localStorage.setItem('username', result.username )
      setImage(result.image);
      localStorage.setItem('image', result.image )
      const role = result.role?.toLowerCase();
      console.log(document.cookie); 

      
  
      if (role === 'employee') {
        setRedirectPath('/Employee/my-profile');
        setEmployeeId(result.employee_id);
        localStorage.setItem('employee_id', result.employee_id )
      } else if (role === 'manager') {
        setRedirectPath('/branchmanager/assign-geofence/all');
        setManagerId(result.manager_id)
        localStorage.setItem('manager_id', result.manager_id )
      } else if (role === 'admin') {
        setRedirectPath('/admin/dashboard');
      }
      else{
          setRedirectPath('/map-admin/route');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password');
      document.getElementById('loginForm').classList.add('animate-shake');
      setTimeout(() => {
        document.getElementById('loginForm').classList.remove('animate-shake');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    userLogin();
  };

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gray-50">
      {/* New Clean Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlZGVkZWQiIG9wYWNpdHk9IjAuMiI+PHBhdGggZD0iTTAgNDBoNDBWMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        {/* Subtle floating elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-blue-100 rounded-full bg-blue-50"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex w-full max-w-6xl overflow-hidden bg-white shadow-xl rounded-xl backdrop-blur-sm">
        {/* Left side - Feature showcase */}
        <div className="flex-col justify-between hidden w-1/2 p-8 text-white md:flex bg-gradient-to-br from-blue-900 to-blue-700">
          <div>
            <div className="flex items-center mb-8">
              <img src="/icons/BIIT_MAP(1).png" className="h-12 mr-3" alt="BIIT Map Logo" />
              <div>
                <h1 className="text-2xl font-bold">BIIT MAP SERVER</h1>
                <p className="text-sm text-blue-300">Enterprise Tracking Platform</p>
              </div>
            </div>

            {/* Feature carousel */}
            <div 
              className="relative h-56 mb-8 overflow-hidden bg-blue-800 border border-blue-400 rounded-lg border-opacity-30 bg-opacity-20"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                >
                  <div className="mb-3 text-blue-300">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{features[activeFeature].title}</h3>
                  <p className="text-sm text-blue-200">{features[activeFeature].description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-0 right-0 flex justify-center space-x-2 bottom-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all ${activeFeature === index ? 'bg-blue-300 w-4' : 'bg-white bg-opacity-30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-800 border border-blue-400 rounded-lg bg-opacity-30 border-opacity-20">
              <div className="flex items-center">
                <div className="p-2 mr-2 bg-blue-400 rounded-full">
                  <FaUsers className="text-sm text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Employees</p>
                  <p className="text-lg font-bold">200+</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-800 border border-blue-400 rounded-lg bg-opacity-30 border-opacity-20">
              <div className="flex items-center">
                <div className="p-2 mr-2 bg-blue-400 rounded-full">
                  <FaCarAlt className="text-sm text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Vehicles</p>
                  <p className="text-lg font-bold">50+</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <motion.div 
          id="loginForm"
          className="relative w-full p-8 bg-white md:w-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center mb-8">
            <img src="/icons/BIIT_MAP(1).png" className="h-16 mb-4" alt="BIIT Map Logo" />
            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
            <p className="text-sm text-center text-gray-500">Sign in to your dashboard</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              >
                <FaBell className="mr-2" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 text-sm transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-800">Forgot Password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pl-10 text-sm transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium rounded-lg transition-all flex items-center justify-center ${
                isLoading ? 'opacity-90' : 'hover:opacity-95 hover:shadow-md'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-xs text-center text-gray-500">
            <p>
              Need help?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-800">Contact support</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;