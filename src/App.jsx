import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./OrganizationAdmin/dashboard/page";
import UserManagement from "./pages/UserManagement";
import GeofenceManagement from "./pages/GeofenceManagement";
import VehicleManagement from "./pages/VehicleManagement";
import BranchManagement from "./pages/BranchManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import CreateUser from "./OrganizationAdmin/UserManagement/add_user/page"; 
import Users from "./OrganizationAdmin/UserManagement/users/page"; 
import CreateBranch from "./OrganizationAdmin/BranchManagement/add_branch/page";
import BranchTable from "./OrganizationAdmin/BranchManagement/branches/page";
import CreateVehicle from "./OrganizationAdmin/VehicleManagement/add_vehicle/page";
import VehicleTable from "./OrganizationAdmin/VehicleManagement/vehicle/page";
import CreateGeofence from "./OrganizationAdmin/GeofenceManagement/add_geofence/page";
import ListGeofences from "./OrganizationAdmin/GeofenceManagement/geofence/page";
import ViewGeofencePage from "./OrganizationAdmin/GeofenceManagement/view_geofence/page";
import MapAdminDashboardLayout from "./layouts/MapAdminDashboardLayout";
import MapWithSearchAndAddMarker from "./MapAdmin/MapAdmin";
import RouteMap from "./MapAdmin/MapAdminRoute";
import AssignGeofence from "./BranchManager/GeofenceAssignment/AssignGeofence";
import AssignedGeofenceList from "./BranchManager/GeofenceAssignment/AssignedGeofences-List";
import AssignVehicle from "./BranchManager/VehicleAssignment/AssignVehicle";
import AssignedVehiclesList from "./BranchManager/VehicleAssignment/AssignVehicle-List";
import EmployeeLocationTracking from "./BranchManager/Tracking/EmployeeLocationTracking";
import BranchDashboardLayout from "./layouts/BranchManagerLayout";
import Settings from "./pages/Settings";
import 'leaflet/dist/leaflet.css';
import EmployeeGeoVoilations from "./BranchManager/Voilations/EmployeeGeofenceVoilations";
import AllVoilations from "./BranchManager/Voilations/AllVoilations";
// import EmployeeTracking from "./BranchManager/Tracking/EmployeeTracking";
import Myprofile from "./Employees/myprofile";
import Myvehicle from "./Employees/myvehicle";
import Mygeofence from "./Employees/mygeofence";
import EmployeeLayout from "./layouts/EmployeeLayout";
import Login from "./Login";
import EmployeeMovementHistory from "./BranchManager/Tracking/EmployeeMovementHistory";
import Maplayers from "./MapAdmin/Maplayers";
import { ToastContainer } from 'react-toastify';



function App() {
  return (

    <Router>
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          }
        />
<Route
  path="/admin/geofence-management"
  element={
    <DashboardLayout>
      <ListGeofences />
    </DashboardLayout>
  }
/>
        <Route
          path="/admin/vehicle-management"
          element={
            <DashboardLayout>
              <VehicleTable />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/branch-management"
          element={
            <DashboardLayout>
              <BranchTable />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/employee-management"
          element={
            <DashboardLayout>
              <EmployeeManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

<Route
  path="/admin/create-user"
  element={
    <DashboardLayout>
      <CreateUser />
    </DashboardLayout>
  }
/>

<Route
  path="/admin/users"
  element={
    <DashboardLayout>
      <Users />
    </DashboardLayout>
  }
/>

<Route
  path="/admin/create-branch"
  element={
    <DashboardLayout>
      <CreateBranch />
    </DashboardLayout>
  }
/>


<Route
  path="/admin/branches"
  element={
    <DashboardLayout>
      <BranchTable />
    </DashboardLayout>
  }
/>


<Route
  path="/admin/create-vehicle"
  element={
    <DashboardLayout>
      <CreateVehicle />
    </DashboardLayout>
  }
/>

<Route
  path="/admin/create-geofence"
  element={
    <DashboardLayout>
      <CreateGeofence />
    </DashboardLayout>
  }
/>

<Route
  path="/admin/view-geofence/:geofenceName"
  element={
    <DashboardLayout>
  <ViewGeofencePage />
  </DashboardLayout>
}
/>

<Route
  path="/map-admin/dashboard"
  element={
    <MapAdminDashboardLayout >
      <Dashboard />
    </MapAdminDashboardLayout >
  }
/>

<Route
  path="/map-admin"
  element={
    <MapAdminDashboardLayout >
      <MapWithSearchAndAddMarker />
    </MapAdminDashboardLayout >
  }
/>

<Route
  path="/map-admin/route"
  element={
    <MapAdminDashboardLayout >
      <RouteMap />
    </MapAdminDashboardLayout >
  }
/>

<Route
  path="/map-admin/layer"
  element={
    <MapAdminDashboardLayout >
      <Maplayers />
    </MapAdminDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/assign-geofence"
  element={
    <BranchDashboardLayout >
      <AssignGeofence />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/assign-geofence/all"
  element={
    <BranchDashboardLayout >
      <AssignedGeofenceList />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/assign-vehicle"
  element={
    <BranchDashboardLayout >
      <AssignVehicle />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/assign-vehicle/all"
  element={
    <BranchDashboardLayout >
      <AssignedVehiclesList />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/employees-location-tracking"
  element={
    <BranchDashboardLayout >
      <EmployeeLocationTracking />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/view-voilations"
  element={
    <BranchDashboardLayout >
      <EmployeeGeoVoilations />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/All-voilations"
  element={
    <BranchDashboardLayout >
      <AllVoilations />
    </BranchDashboardLayout >
  }
  
/>

<Route
  path="/branchmanager/TrackLocation/:employeeId"
  element={
    <BranchDashboardLayout>
      <EmployeeMovementHistory />
    </BranchDashboardLayout>
  }
/>

{/* <Route
  path="/branchmanager/Track"
  element={
    <BranchDashboardLayout >
      <EmployeeTracking />
    </BranchDashboardLayout >
  }
  
/> */}

<Route
  path="/Employee/my-profile"
  element={
    <EmployeeLayout >
      <Myprofile />
    </EmployeeLayout >
  }
  
/>

<Route
  path="/Employee/my-geofence"
  element={
    <EmployeeLayout >
      <Mygeofence />
    </EmployeeLayout >
  }
  
/>

<Route
  path="/Employee/my-vehicle"
  element={
    <EmployeeLayout >
      <Myvehicle />
    </EmployeeLayout >
  }
  
/>

<Route
  path="/Employee/route"
  element={
    <EmployeeLayout >
      <RouteMap />
    </EmployeeLayout >
  }
  
/>

<Route
  path="/"
  element={
      <Login />
  }
  
/>
      </Routes>
    </Router>
  );
}

export default App;


