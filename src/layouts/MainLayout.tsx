import { ThemeProvider } from '@/components/theme-provider';
import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen bg-background">
        {/* <Navbar /> */}
        <main className="flex-1">
          {children}
        </main>
        {/* <Footer /> */}
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
