import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home.jsx";
import About from "../pages/about/index.jsx";
import Chatx from "../pages/chat/Chatx.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import PrivateLayout from "../layouts/PrivateLayout.jsx";
import Login from "../pages/login/Login.jsx";
import Register from "../pages/Register/Register.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      <Route element={<PrivateLayout />}>
        <Route path="/chat" element={<Chatx />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
