import React, { useState } from "react";
import { Form, Input, Button, message, Typography, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const checkUsername = async (_, value) => {
    if (!value || value.length < 3) return Promise.reject("Min 3 characters");
    if (/\s/.test(value)) {
      return Promise.reject("Username cannot contain spaces");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return Promise.reject("Only letters, numbers and underscore allowed");
    }
    setUsernameStatus("validating");
    const { data } = await api.get(`/check-username/${value}`);
    setUsernameStatus(data.available ? "success" : "error");
    return data.available
      ? Promise.resolve()
      : Promise.reject("Username taken");
  };

  const checkEmail = async (_, value) => {
    if (!value || !/\S+@\S+\.\S+/.test(value))
      return Promise.reject("Invalid email");
    setEmailStatus("validating");
    const { data } = await api.get(`/check-email/${encodeURIComponent(value)}`);
    setEmailStatus(data.available ? "success" : "error");
    return data.available
      ? Promise.resolve()
      : Promise.reject("Email already used");
  };

  const onFinish = async (vals) => {
    setLoading(true);
    try {
      const { data } = await api.post("/register", vals);
      login(data.data);
      message.success("Account created!");
      nav("/chat");
    } catch (e) {
      message.error(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={pageStyle}>
        <div style={cardStyle}>
          <Title
            level={3}
            style={{ color: "#fff", textAlign: "center", marginBottom: 32 }}
          >
            Create Account
          </Title>
          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            disabled={loading}
          >
            <Form.Item
              name="username"
              hasFeedback
              validateStatus={usernameStatus}
              rules={[{ required: true }, { validator: checkUsername }]}
            >
              <Input placeholder="Username" style={inputStyle} />
            </Form.Item>
            <Form.Item
              name="email"
              hasFeedback
              validateStatus={emailStatus}
              rules={[{ required: true }, { validator: checkEmail }]}
            >
              <Input placeholder="Ex. user@az.com" style={inputStyle} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
              <Input.Password
                className="icon_color_light"
                placeholder="Password (min 6 chars)"
                style={inputStyle}
              />
            </Form.Item>
            <Button htmlType="submit" block style={btnStyle} loading={loading}>
              Register
            </Button>
          </Form>
          <Text
            style={{
              color: "#888",
              display: "block",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#667eea" }}>
              Login
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
  background: "var(--secondary-color)",
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
