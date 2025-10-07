"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(true);
  const [active, setActive] = useState<string>("Home");

  // Fix: Add missing handler
  const handleClick = () => {
    console.log("Login/Register clicked");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const threshold = heroHeight * 0.1; // 10% of hero section
      setIsTransparent(window.scrollY < threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  interface MenuItem {
    label: string;
    href: string;
  }

  const menuItems: MenuItem[] = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Blogs", href: "#blogs" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed text-black top-0 left-0 w-full z-50 ${isTransparent ? "bg-transparent" : "bg-white shadow-md"}`}
    >
      {/* Outer container */}
      {/* Outer container */}
      <div className="w-[90%] mx-auto py-2 flex items-center justify-between">
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <a href="/">
            <img src="/validz-logo.svg" alt="NavBar-logo" className="w-[150px] md:w-[180px] lg:w-[200px] h-auto" />
          </a>
        </div>

        {/* Desktop Nav - Slightly left aligned */}
        <div className="hidden md:flex justify-center flex-grow mr-12 lg:mr-16">
          <ul className="flex gap-6 lg:gap-12 font-bold text-black text-[16px]">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setActive(item.label)}
                  className={`${active === item.label ? "underline text-[#6E461A]" : ""} hover:underline`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop Button - Right */}
        <div className="hidden md:flex flex-shrink-0">
          <button
            onClick={handleClick}
            className="bg-secondary hover:bg-[#8b5e30] text-white px-5 py-2 rounded-lg font-medium hover:text-white transition"
          >
            Subscribe
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsOpen(false)}>
            <X size={28} className="text-black" />
          </button>
        </div>
        <ul className="px-6 py-6 space-y-6 text-lg">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`block hover:underline ${active === item.label ? "text-[#6E461A] font-semibold" : ""}`}
                onClick={() => {
                  setActive(item.label);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="px-6">
          <button
            onClick={handleClick}
            className="w-full py-2 bg-[#6E461A] text-white rounded-lg font-medium hover:bg-[#43280c] transition"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Dark overlay behind sidebar */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsOpen(false)} />}
    </header>
  );
};

export default Header;
