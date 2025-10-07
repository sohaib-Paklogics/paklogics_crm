"use client";
import React from "react";

type Link = { label: string; href: string };
type FooterProps = {
  brand?: { logoSrc: string; alt?: string; blurb: string };
  pagesLeft?: Link[];
  pagesRight?: Link[];
  utilities?: Link[];
  legal?: { rightsHref?: string; termsHref?: string; privacyHref?: string };
  onSubscribe?: (email: string) => void;
};

export default function Footer({
  brand = {
    logoSrc: "/validz-logo.svg",
    alt: "Validiz",
    blurb:
      "Simplify client management and supercharge your team’s productivity with Validiz CRM",
  },
  pagesLeft = [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Blog Post", href: "#" },
    { label: "Help Center", href: "#" },
  ],
  pagesRight = [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Customer Reviews", href: "#" },
    { label: "Contact", href: "#" },
  ],
  utilities = [
    { label: "Login", href: "#" },
    { label: "Sign Up", href: "#" },
    { label: "Reset Password", href: "#" },
    { label: "404 Not Found", href: "#" },
  ],
  legal = { rightsHref: "#", termsHref: "#", privacyHref: "#" },
  onSubscribe,
}: FooterProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString() || "";
    onSubscribe?.(email);
  }

  return (
    <footer id="contact" className="w-[90%] mx-auto bg-white scroll-mt-20">
      {/* ---------- Newsletter ---------- */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,520px] items-center gap-6">
          {/* Left text */}
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#0A1425]">
              Subscribe To Our Newsletter
            </h3>
            <p className="text-[13px] sm:text-[14px] md:text-[16px] text-[#0A1425]">
              Join the 5000+ People That Use Softnio Products.
            </p>
          </div>

          {/* Right form */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex md:justify-end"
            aria-label="Newsletter form"
          >
            <div className="flex flex-col sm:flex-row w-full md:w-[520px] gap-3">
              {/* Input */}
              <input
                name="email"
                type="email"
                required
                placeholder="Enter Your Email"
                className="w-full sm:flex-1 h-11 rounded-md border border-gray-300 px-4 text-[14px] sm:text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {/* Button */}
              <button
                type="submit"
                className="w-full sm:w-auto h-11 px-5 rounded-md bg-secondary text-white text-[14px] sm:text-[15px] font-semibold hover:bg-[#5f3c15] transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ---------- Middle: logo + links ---------- */}
      <div className="w-full px-4 md:px-6 py-12">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Brand / blurb / socials (Left) */}
            <div>
              <img
                src={brand.logoSrc}
                alt={brand.alt || "Brand"}
                className="h-10 w-auto"
              />
              <p className="mt-6 text-[16px] text-[#0A1425] max-w-[360px] leading-relaxed">
                {brand.blurb}
              </p>

              <div className="mt-6 flex items-center gap-4">
                {[
                  {
                    label: "Facebook",
                    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z",
                  },
                  {
                    label: "Twitter",
                    path: "M22.46 6c-.77.35-1.6.59-2.46.7a4.27 4.27 0 0 0 1.87-2.37 8.48 8.48 0 0 1-2.7 1.03 4.24 4.24 0 0 0-7.22 3.87A12.05 12.05 0 0 1 3.15 4.9a4.23 4.23 0 0 0 1.32 5.66 4.2 4.2 0 0 1-1.92-.53v.06a4.25 4.25 0 0 0 3.4 4.16 4.3 4.3 0 0 1-1.91.07 4.25 4.25 0 0 0 3.96 2.94A8.52 8.52 0 0 1 2 19.55a12.02 12.02 0 0 0 6.51 1.91c7.81 0 12.09-6.47 12.09-12.08l-.01-.55A8.53 8.53 0 0 0 22.46 6z",
                  },
                  {
                    label: "LinkedIn",
                    path: "M6.94 8.99h-3v10h3v-10zm-1.5-5a1.74 1.74 0 1 0 0 3.49 1.74 1.74 0 0 0 0-3.49zM21 19v-5.6c0-3-1.6-4.4-3.7-4.4-1.7 0-2.5.95-2.9 1.62V9h-3v10h3v-5.4c0-1.43.27-2.82 2.05-2.82 1.75 0 1.78 1.64 1.78 2.9V19H21z",
                  },
                  {
                    label: "Telegram",
                    path: "M9.04 15.47 8.9 19.1c.5 0 .72-.22.98-.48l2.36-2.26 4.88 3.58c.9.5 1.54.24 1.79-.84l3.24-15.18.01-.01c.29-1.35-.49-1.88-1.38-1.55L1.26 9.14c-1.32.51-1.3 1.25-.23 1.58l5.63 1.73 13.05-8.23c.61-.37 1.17-.17.71.21L9.04 15.47z",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="h-9 w-9 grid place-items-center rounded-md bg-[#6E461A] text-white hover:bg-[#7b542d] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: 3 columns (Pages Left, Pages Right, Utilities) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Column 1 */}
              <div>
                <h4 className="text-[20px] font-bold text-[#0A1425] text-left">
                  Pages
                </h4>
                <ul className="mt-4 space-y-5 text-[16px] text-left">
                  {pagesLeft.map((l) => (
                    <li key={l.label}>
                      <a
                        className="text-[#0A1425] hover:text-gray-600"
                        href={l.href}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <h4 className="text-[20px] font-bold text-[#0A1425] text-left">
                  Pages
                </h4>
                <ul className="mt-4 space-y-5 text-[16px] text-left">
                  {pagesRight.map((l) => (
                    <li key={l.label}>
                      <a
                        className="text-[#0A1425] hover:text-gray-600"
                        href={l.href}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 → spans full width on mobile, centers content */}
              <div className="col-span-2 lg:col-span-1 flex flex-col items-start">
                <h4 className="text-[16px] font-bold text-[#0A1425] text-center lg:text-left">
                  Utility Pages
                </h4>
                <ul className="mt-4 space-y-5 text-[16px] text-center lg:text-left">
                  {utilities.map((l) => (
                    <li key={l.label}>
                      <a
                        className="text-[#0A1425] hover:text-gray-600"
                        href={l.href}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="mt-12 border-gray-200" />

        {/* Bottom legal row */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Left side (© text) */}
          <p className="text-sm sm:text-[15px] md:text-[16px] font-medium text-[#0A1425]">
            © 2011 - {new Date().getFullYear()}. All Rights Reserved.
          </p>

          {/* Right side (links) */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-3 gap-y-2 text-sm sm:text-[15px] md:text-[16px] font-medium text-[#0A1425]">
            <a href={legal.rightsHref} className="hover:text-gray-600">
              All Rights
            </a>
            <span className="hidden md:inline text-gray-400">|</span>

            <a href={legal.termsHref} className="hover:text-gray-600">
              Terms &amp; Conditions
            </a>
            <span className="hidden md:inline text-gray-400">|</span>

            <a href={legal.privacyHref} className="hover:text-gray-600">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
