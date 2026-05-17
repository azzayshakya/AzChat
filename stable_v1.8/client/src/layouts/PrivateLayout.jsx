import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function PrivateLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Navbar height */}
      <Navbar />

      {/* Remaining page area */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
