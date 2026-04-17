import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { UserManagement } from './pages/UserManagement';

// Actual facilities pages imports
import { Dashboard } from './pages/facilities/Dashboard';
import { ResourceList } from './pages/facilities/ResourceList';
import { ResourceFeed } from './pages/facilities/ResourceFeed';
import { AddResource } from './pages/facilities/AddResource';
import { EditResource } from './pages/facilities/EditResource';
import { ManageResources } from './pages/facilities/ManageResources';
import { MyBookings } from './pages/facilities/MyBookings';
import { ManageBookings } from './pages/facilities/ManageBookings';
import { ResourceDetails } from './pages/facilities/ResourceDetails';
import { QRCodeGenerator } from './pages/facilities/QRCodeGenerator';
import { QRScanner } from './pages/facilities/QRScanner';

const GOOGLE_CLIENT_ID = '502517710174-srgf7jfmv11mp2n4il147dkgpdqd015u.apps.googleusercontent.com';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        {/* AuthProvider wraps everything to provide authentication context */}
        <AuthProvider>
          {/* Global Toasts Notifications */}
          <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium', duration: 3000 }} />

          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<ResourceFeed />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<MainLayout />}>

                {/* Redirect /app to dashboard */}
                <Route index element={<Navigate to="/app/facilities/dashboard" replace />} />

                {/* Facilities & Assets Module Routes */}
                <Route path="facilities/dashboard" element={<Dashboard />} />
                <Route path="facilities/feed" element={<Navigate to="/feed" replace />} />
                <Route path="facilities/resources" element={<ResourceList />} />
                <Route path="facilities/resources/add" element={<AddResource />} />
                <Route path="facilities/resources/manage" element={<ProtectedRoute requiredRole="ADMIN" />} >
                  <Route index element={<ManageResources />} />
                </Route>
                <Route path="facilities/resources/edit/:id" element={<EditResource />} />
                <Route path="facilities/resources/:id" element={<ResourceDetails />} />
                <Route path="facilities/bookings/my" element={<MyBookings />} />
                <Route path="facilities/bookings/manage" element={<ProtectedRoute requiredRole="ADMIN" />}>
                  <Route index element={<ManageBookings />} />
                </Route>

                {/* QR Check-In Routes */}
                <Route path="facilities/scan" element={<QRScanner />} />
                <Route path="facilities/qr-codes" element={<ProtectedRoute requiredRole="ADMIN" />}>
                  <Route index element={<QRCodeGenerator />} />
                </Route>

                {/* Profile Pages */}
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:id" element={<Profile />} />

                {/* User Management (Admin only) */}
                <Route path="users" element={<ProtectedRoute requiredRole="ADMIN" />}>
                  <Route index element={<UserManagement />} />
                </Route>

                {/* Other modules placeholders */}
              </Route>
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<Navigate to="/app/facilities/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
