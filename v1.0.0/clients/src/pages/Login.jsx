import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  console.log("project start login");
  console.log("azx", window.location.origin);
  const onFinish = async (vals) => {
    setLoading(true);
    try {
      const { data } = await api.post("/login", {
        identity: vals.identity,
        password: vals.password,
      });
      login(data.user);
      message.success(`Welcome, ${data.user.username}!`);
      nav("/chat");
    } catch (e) {
      message.error(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={pageStyle}>
        <div style={cardStyle}>
          <Title
            level={3}
            style={{ color: "#fff", textAlign: "center", marginBottom: 32 }}
          >
            Welcome Back
          </Title>
          <Spin spinning={loading}>
            <Form layout="vertical" onFinish={onFinish} size="large">
              <Form.Item
                name="identity"
                rules={[{ required: true, message: "Enter username or email" }]}
              >
                <Input placeholder="Username or Email" style={inputStyle} />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password placeholder="Password" style={inputStyle} />
              </Form.Item>
              <Button
                htmlType="submit"
                block
                style={btnStyle}
                loading={loading}
              >
                Login
              </Button>
            </Form>
          </Spin>
          <Text
            style={{
              color: "#888",
              display: "block",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No account?{" "}
            <Link to="/register" style={{ color: "#667eea" }}>
              Register
            </Link>
          </Text>
        </div>
      </div>
    </>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--page-gradient)",
};
const cardStyle = {
  background: "var(--bg-darkest)",
  borderRadius: 16,
  padding: "40px 36px",
  width: 380,
  boxShadow: "0 20px 60px #0008",
  border: "1px solid #333",
};
const inputStyle = {
  background: "#12122a",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: 8,
};
const btnStyle = {
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  border: "none",
  height: 46,
  borderRadius: 10,
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
};
