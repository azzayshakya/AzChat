import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import About from '../pages/about/index.jsx';

import Chatx from '../pages/chat/Chatx.jsx';
import Admin from '../pages/admin/Admin.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import Home from '../pages/Home.jsx';
import PrivateLayout from '../layouts/PrivateLayout.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route element={<PrivateLayout />}>
        <Route path="/chat" element={<Chatx />} />

        <Route path="/azadmin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
