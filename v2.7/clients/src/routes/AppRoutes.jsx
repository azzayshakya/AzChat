import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home.jsx";
import About from "../pages/about/index.jsx";
import Chat from "../pages/Chat/Chat.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import PrivateLayout from "../layouts/PrivateLayout.jsx";
import Login from "../pages/login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import Attendence from "../pages/Attendence/Attendence.jsx";
import Features from "../pages/Features/Features.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/feature" element={<Features />} />

      <Route element={<PrivateLayout />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/attendence" element={<Attendence />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
