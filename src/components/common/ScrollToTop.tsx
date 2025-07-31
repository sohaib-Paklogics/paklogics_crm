import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProps {
  trigger?: any; // Accept any value to re-trigger on step change
}

const ScrollToTop = ({ trigger }: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, trigger]); // Triggers on either page or custom value

  return null;
};

export default ScrollToTop;
