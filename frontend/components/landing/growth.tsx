"use client";
import React from "react";

const GrowthBanner: React.FC = () => {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-[14px]",
        "bg-gradient-to-br from-[#6E461A] to-[#40280E]",
        "text-white",
        "px-6 sm:px-10 lg:px-14",
        "py-10",
        "mx-auto w-[87%]",
      ].join(" ")}
      aria-label="Growth Banner"
    >
      {/* Layout */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full lg:w-[90%]">
          {/* Left — Heading + CTAs */}
          <div>
            <h1 className="font-bold leading-tight tracking-[-0.01em] text-left">
              <span className="text-[32px] sm:text-[42px] md:text-[42px] lg:text-[48px]">
                Start Managing
              </span>
              <span className="block text-[32px] sm:text-[42px] md:text-[46px] lg:text-[48px]">
                Smarter To Accelerate
              </span>
              <span className="block text-[32px] sm:text-[42px] md:text-[46px] lg:text-[48px]">
                Your Growth
              </span>
            </h1>
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Primary */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex justify-center h-[46px] items-center rounded-md bg-white px-6 text-[15px] font-semibold text-[#2a2016] shadow hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                Get Started
              </button>
              {/* Secondary */}
              <a
                href="/pricing"
                className="w-full sm:w-auto inline-flex justify-center h-[46px] items-center rounded-md border border-white/70 px-6 text-[15px] font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                Pricing & Plans
              </a>
            </div>
          </div>
          {/* Right — Image */}
          <div className="relative flex justify-end lg:-mr-12">
            <img
              src="/growth-section.png"
              alt="Product preview"
              className="w-full max-w-[520px] lg:max-w-[500px] rounded-md object-contain"
            />
          </div>
        </div>
      </div>
      {/* Border edge */}
      <div className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-black/10" />
    </section>
  );
};

export default GrowthBanner;
