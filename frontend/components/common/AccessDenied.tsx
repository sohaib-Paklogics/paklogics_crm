import React from "react";
import { MainLayout } from "../layout/main-layout";
import { Shield } from "lucide-react";

const AccessDenied = () => {
  return (
    <MainLayout>
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">
          Access denied. Admin privileges required.
        </p>
      </div>
    </MainLayout>
  );
};

export default AccessDenied;
