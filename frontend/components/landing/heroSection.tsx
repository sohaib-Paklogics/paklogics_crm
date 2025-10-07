"use client";
import Image from "next/image";
import React from "react";

const HeroSection = () => {
  return (
    <section id="home" className="relative w-full bg-gradient-to-r from-[#FBF6F0] via-[#FBF6F0] to-white py-16">
      {/* Outer wrapper with 90% width */}
      <div className="w-[96%] mx-auto flex flex-col items-center text-center mt-20">
        {/* Top Subtitle */}
        <h4 className="uppercase text-[22px] sm:text-base font-extrabold text-primary tracking-wide text-center px-2">
          Redefining how agencies build client success
        </h4>

        {/* Main Heading */}
        <h1
          className="
    mt-4 
    text-[28px]    
    sm:text-[36px]    
    md:text-[44px]   
    lg:text-[56px]   
    xl:text-[64px]   
    font-extrabold 
    text-[#0A1425] 
    leading-[1.2] 
    text-center 
    px-4
  "
        >
          SMART CRM FOR MODERN TEAMS
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-4xl mx-auto text-base sm:text-[20px] md:text-xl text-[#0A1425] leading-relaxed text-center px-4">
          Validiz CRM brings clarity to sales, projects, and commissions with AI-ready workflows. Empower your team to
          track leads, assign tasks, and scale relationships—all from a platform designed for speed and simplicity.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-row gap-4">
          <a
            href="/login"
            className="bg-secondary hover:bg-secondary/80 text-white px-6 py-3 rounded-md text-sm sm:text-base font-semibold shadow-md transition-all text-center"
          >
            Get Started
          </a>
          <a
            href="#learn-more"
            className="bg-transparent border border-secondary hover:bg-white text-gray-900 px-6 py-3 rounded-md text-sm sm:text-base font-semibold shadow-md transition-all text-center"
          >
            Learn More
          </a>
        </div>

        {/* Dashboard Image */}
        <div className="relative w-full mt-12 flex justify-center">
          <div className="relative w-full">
            <Image
              src="/hero-section1.png"
              alt="CRM Dashboard"
              width={1364}
              height={659}
              className="w-full h-auto object-contain hidden sm:block"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
