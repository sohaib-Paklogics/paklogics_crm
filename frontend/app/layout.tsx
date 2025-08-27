import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HydrateAuth from "@/stores/HydrateAuth";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/common/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Validiz CRM - Staffing & Hiring Management",
  description:
    "Validiz CRM is an AI-ready, modern customer relationship management platform designed specifically for tech agencies, service-based businesses, and growing startups. With a clean, intuitive interface and powerful workflow automation features, Validiz helps sales and operations teams stay organized, move faster, and close more deals confidently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HydrateAuth>{children}</HydrateAuth>

        <Toaster position="top-right" closeButton />
        <ScrollToTop />
      </body>
    </html>
  );
}
