import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  // Example: get roles from localStorage (you could also use context or Redux)
  const storedRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");

  const isAuthorized = allowedRoles.some(role => storedRoles.includes(role));

  return isAuthorized ? children : <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
