import React, { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    // Clear user session
    localStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("jwt_token");
    localStorage.removeItem("user_roles");

    // Optional: Show message briefly before redirect
    const timer = setTimeout(() => {
      window.location.href = "/login"; // full page reload
    }, 1500); // 1.5-second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
      <h1 className="text-xl font-bold mb-2">Déconnexion...</h1>
      <p>Redirection vers la page de connexion.</p>
    </div>
  );
};

export default Logout;
