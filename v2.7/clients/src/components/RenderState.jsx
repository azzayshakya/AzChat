import React from "react";
import { Spin, Empty } from "antd";

export default function RenderState({
  loading,
  error,
  isEmpty,
  emptyText,
  children,
}) {
  if (loading) {
    return (
      <div className="centered-state">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="centered-state">{error}</div>;
  }

  if (isEmpty) {
    return (
      <div className="centered-state">
        <Empty description={emptyText} />
      </div>
    );
  }

  return children;
}
