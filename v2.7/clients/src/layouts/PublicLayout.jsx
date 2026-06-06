import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Navbar from "../components/Navbar";

export default function PublicLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/chat" />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
