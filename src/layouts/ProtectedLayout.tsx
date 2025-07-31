// src/layouts/ProtectedLayout.tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import PageLoader from "@/components/common/PageLoader";
import useAuthStore from "@/store/useAuthStore";

const ProtectedLayout = () => {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <PageLoader />;

  return <Outlet />;
};

export default ProtectedLayout;
