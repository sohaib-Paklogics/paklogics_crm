import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import authImg from "@/assets/auth-img.png";
import { Link } from "react-router-dom";
interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">
        {/* logo */}
        <div className="z-10 absolute top-4 left-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Link to="/" className="flex items-center gap-2">
            {/* <img src="/logo.png" alt="Logo" className="h-16 w-16 rounded-full" /> */}
            <p>Template</p>
          </Link>
        </div>
        {/* left img side */}
        <div className="hidden min-h-screen w-1/3 md:block">
          <img
            src={authImg}
            alt="Modern house exterior"
            className="h-full w-full object-cover"
          />
        </div>
        {children}
      </div>
    </ThemeProvider>
  );
};

export default AuthLayout;
