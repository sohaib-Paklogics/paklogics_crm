// src/App.tsx

import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "@/routes/routes";
import { Suspense } from "react";
import PageLoader from "./components/common/PageLoader";
import ScrollToTop from "./components/common/ScrollToTop";
import { Toaster } from "sonner";

function AppRoutes() {
  const element = useRoutes(routes);
  return (
    <Suspense
      fallback={
        <div className="text-center p-10">
          <PageLoader />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
