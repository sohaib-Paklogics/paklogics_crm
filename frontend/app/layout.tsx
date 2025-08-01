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
  description: "Modern role-based CRM for staffing and hiring",
  generator: "v0.dev",
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
