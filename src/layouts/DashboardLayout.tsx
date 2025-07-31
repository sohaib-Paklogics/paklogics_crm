// layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
// import Sidebar from "@/components/dashboard/Sidebar";
// import Topbar from "@/components/dashboard/Topbar";

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar goes first */}
      {/* <Topbar /> */}

      {/* Main area with sidebar and page content */}
      <div className="flex flex-1">
        {/* <Sidebar /> */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
