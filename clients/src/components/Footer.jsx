import React from 'react';
import { Button, Typography, Row, Col, Card, Tag, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MessageOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  BulbOutlined,
  GithubOutlined,
  BugOutlined,
} from '@ant-design/icons';
const { Title, Text } = Typography;
export function Footer() {
  const techStack = ['WebSocket', 'React', 'Node.js'];
  const navLinks = ['Home', 'Login', 'Register', 'About'];
  const projectLinks = ['Changelog', 'Roadmap', 'Report Bug'];

  return (
    <footer
      style={{
        background: 'var(--secondary-color)',
        borderTop: '1px solid #111',
        padding: '10px 32px 28px',
      }}
    >
      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid #111',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <Text style={{ color: '#afaeae', fontSize: 12 }}>
          AZ Chat v{import.meta.env.VITE_APP_VERSION} · Built for local communication ·
        </Text>
      </div>
    </footer>
  );
}
