"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface ScrollToTopProps {
  trigger?: any; // Accept any value to re-trigger on step change
}

const ScrollToTop = ({ trigger }: ScrollToTopProps) => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, trigger]); // Scrolls on route or custom trigger change

  return null;
};

export default ScrollToTop;
