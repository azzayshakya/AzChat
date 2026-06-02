import React from "react";

import { BrowserRouter } from "react-router-dom";

import { ConfigProvider, theme } from "antd";
import { AuthProvider } from "./AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
