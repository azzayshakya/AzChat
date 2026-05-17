import React, { useState } from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { api } from '../../../api';

const { TextArea } = Input;

const inputStyle = {
  background: '#12122a',
  border: '1px solid #333',
  color: '#fff',
  borderRadius: 8,
};

const labelStyle = {
  color: '#9999bb',
  fontSize: 13,
  marginBottom: 6,
  display: 'block',
};

export default function ContactModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSubmit = async (vals) => {
    setLoading(true);
    await api.post('/admin/post-user-query', vals);
    setLoading(false);
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    form.resetFields();
    onClose();
  };

  return (
    // Backdrop
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--secondary-color)',
          borderRadius: 16,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid #2a2a4a',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {sent ? (
          // ── Success state ──────────────────────────────────
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(4,255,88,0.1)',
                border: '1px solid rgba(4,255,88,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                margin: '0 auto 20px',
              }}
            >
              ✅
            </div>
            <h3
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              Message Sent!
            </h3>
            <p
              style={{
                color: '#9999bb',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
            <Button
              block
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                height: 46,
                borderRadius: 10,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Close
            </Button>
          </div>
        ) : (
          // ── Form state ─────────────────────────────────────
          <>
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20,
                  marginBottom: 6,
                }}
              >
                Contact Developer
              </h3>
              <p style={{ color: '#9999bb', fontSize: 13, margin: 0 }}>
                Have a query, suggestion, or issue? Fill the form below.
              </p>
            </div>

            <Spin spinning={loading}>
              <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
                {/* Full Name */}
                <Form.Item
                  name="name"
                  label={<span style={labelStyle}>Full Name *</span>}
                  rules={[{ required: true, message: 'Please enter your name' }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input placeholder="Your full name" style={inputStyle} />
                </Form.Item>

                {/* Message */}
                <Form.Item
                  name="message"
                  label={<span style={labelStyle}>Message *</span>}
                  rules={[{ required: true, message: 'Please enter a message' }]}
                  style={{ marginBottom: 16 }}
                >
                  <TextArea
                    rows={3}
                    placeholder="Describe your query, suggestion, or issue..."
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </Form.Item>

                {/* Location */}
                <Form.Item
                  name="location"
                  label={<span style={labelStyle}>Location</span>}
                  style={{ marginBottom: 16 }}
                >
                  <Input placeholder="Your location (optional)" style={inputStyle} />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                  name="phone"
                  label={<span style={labelStyle}>Phone Number</span>}
                  style={{ marginBottom: 16 }}
                >
                  <Input placeholder="Your phone number (optional)" style={inputStyle} />
                </Form.Item>

                {/* Email */}
                <Form.Item
                  name="email"
                  label={<span style={labelStyle}>Email</span>}
                  rules={[{ type: 'email', message: 'Enter a valid email' }]}
                  style={{ marginBottom: 24 }}
                >
                  <Input placeholder="Your email (optional)" style={inputStyle} />
                </Form.Item>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    block
                    onClick={handleClose}
                    style={{
                      background: 'transparent',
                      border: '1px solid #333',
                      height: 46,
                      borderRadius: 10,
                      color: '#9999bb',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      height: 46,
                      borderRadius: 10,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    Send Message
                  </Button>
                </div>
              </Form>
            </Spin>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        .ant-form-item-label > label { color: #9999bb !important; }
        .ant-input, .ant-input-affix-wrapper, .ant-input-textarea textarea {
          background: #12122a !important;
          border-color: #333 !important;
          color: #fff !important;
        }
        .ant-input::placeholder, textarea::placeholder { color: #555 !important; }
        .ant-input:focus, .ant-input-affix-wrapper:focus-within {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102,126,234,0.15) !important;
        }
      `}</style>
    </div>
  );
}
