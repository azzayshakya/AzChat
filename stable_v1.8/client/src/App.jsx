import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import { ConfigProvider, theme } from 'antd';
import { AuthProvider } from './AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    // <ConfigProvider
    //   theme={{
    //     algorithm: theme.darkAlgorithm,

    //     token: {
    //       colorPrimary: '#667eea',

    //       borderRadius: 8,

    //       colorBgContainer: '#1a1a2e',
    //     },
    //   }}
    // >
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
    // </ConfigProvider>
  );
}
