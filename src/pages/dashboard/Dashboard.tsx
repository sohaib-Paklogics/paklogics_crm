import useAuthStore from "@/store/useAuthStore";
import React from "react";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuthStore();
  return (
    <div>
      <h1 className="text-black">Dahboard</h1>
      {isAuthenticated && user ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <p>Your role: {user?.role}</p>
        </div>
      ) : (
        <p>Please log in to see your dashboard.</p>
      )}
    </div>
  );
};

export default Dashboard;
