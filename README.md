# BIIT MAP SERVER - Enterprise Tracking Platform

This repository contains the frontend for a comprehensive GIS-based enterprise system designed for real-time traffic simulation, employee tracking, and geofence management. The platform provides distinct dashboards and functionalities for different user roles, including Organization Admins, Map Admins, Branch Managers, and Employees.

## Key Features

-   **Role-Based Dashboards**: Tailored user experiences for four distinct roles:
    -   **Organization Admin**: Manages users, branches, vehicles, and global geofences.
    -   **Map Admin**: Creates and manages map layers, routes, and threat zones.
    -   **Branch Manager**: Oversees branch employees, assigns resources, and monitors activity and violations.
    -   **Employee**: Views personal profile, assigned vehicle, geofences, and routes.
-   **Real-time Employee Tracking**: Live monitoring of employee locations on an interactive map, with status indicators for geofence violations.
-   **Movement History & Playback**: Visualize and replay the historical movement of employees with controls for playback speed and time-range filtering.
-   **Geofence Management**:
    -   Create and manage custom polygonal geofences.
    -   Assign geofences to employees with specific access types (Authorized/Restricted) and time-based rules.
    -   Detect and log geofence violations in real-time.
-   **Advanced Mapping & GIS**:
    -   Route planning and visualization using GraphHopper.
    -   Dynamic layer management for displaying custom data like locations, lines (e.g., utility lines, railways), and threat zones.
    -   Simulation of traffic congestion and vehicle movement.
-   **Resource Management**:
    -   **User Management**: Add, view, and manage user accounts and roles.
    -   **Vehicle Management**: Add new vehicles to the organization's fleet.
    -   **Branch Management**: Create and manage organizational branches.

## Tech Stack

-   **Frontend**: React, Vite
-   **Styling**: Tailwind CSS
-   **Mapping**: Leaflet, React-Leaflet, Leaflet-Draw
-   **Routing & APIs**: Axios, `@mapbox/polyline`
-   **UI Components**: Framer Motion, React Select, React Icons, Lucide React
-   **Real-time Communication**: Socket.IO Client
-   **Notifications**: React Hot Toast, React Toastify

## Project Structure

The `src` directory is organized by user roles and features, promoting a clear separation of concerns.

```
src/
├── BranchManager/      # Components and pages for the Branch Manager role
├── Context/            # React Context for global state management
├── Employees/          # Components and pages for the Employee role
├── MapAdmin/           # Components and pages for the Map Admin role
├── OrganizationAdmin/  # Components and pages for the Organization Admin role
├── components/         # Shared UI components (Header, Sidebars, etc.)
├── layouts/            # Layout wrappers for different user dashboards
├── App.jsx             # Main application component with routing
└── Login.jsx           # Application login page
```

## Prerequisites

Before running the frontend, ensure the following backend services are running:
1.  **Main API Server**: on `http://localhost:3000`
2.  **Map Tile Server**: on `http://localhost:9090`
3.  **GraphHopper Routing Engine**: on `http://localhost:8988`

## Getting Started

To get a local copy up and running, follow these simple steps.

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/devfaizanarshad/TrafficSimGIS-System.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd TrafficSimGIS-System
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Application

1.  Start the development server:
    ```sh
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production to the `dist` folder.
-   `npm run lint`: Lints the project files using ESLint.
-   `npm run preview`: Serves the production build locally for preview.
