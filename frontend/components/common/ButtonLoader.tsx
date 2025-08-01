import React from "react";

export default function ButtonLoader({ size = 4, color = "border-white" }) {
  return (
    <div
      className={`inline-block w-${size} h-${size} border-2 border-t-transparent ${color} rounded-full animate-spin`}
      role="status"
    />
  );
}