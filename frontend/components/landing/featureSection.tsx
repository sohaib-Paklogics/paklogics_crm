"use client";
import React from "react";
import Image from "next/image";

/* ---------------- Features Section ---------------- */
const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: "/feature-card-icon.svg",
      title: "Task Boards & Internal Chat",
      desc: "Stay organized with Kanban-style task boards that keeps projects aligned at every stage.",
    },
    {
      id: 2,
      icon: "/feature-card-icon.svg",
      title: "Role-Based Access Control",
      desc: "Manage security and workflows seamlessly by defining roles for admins and managers.",
    },
    {
      id: 3,
      icon: "/feature-card-icon.svg",
      title: "Integrations Made Easy",
      desc: "Connect Validiz CRM with your favorite tools to create a seamless workflow.",
    },
  ];
  return (
    <section id="about" className="w-[90%] mx-auto py-12 md:py-16 bg-white scroll-mt-20">
      {/* header */}
      <div className="w-full mx-auto text-center">
        <div className="text-[22px] font-bold tracking-wider uppercase  text-[#6E461C]">
          FEATURES
        </div>
        <h2 className="mt-1 text-[34px] md:text-[40px] font-bold text-[#0A1425]">
          Discover Powerful Features
        </h2>
        <p className="max-w-2xl mt-2 text-[14px] md:text-[20px] text-[#0A1425] leading-relaxed text-center mx-auto">
          Unlock the tools your agency or startup needs to manage sales,
          projects, and people—smarter and faster.
        </p>
      </div>

      {/* cards grid */}
      <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-10">
        {/* Left Card - Image */}
        <div className="rounded-xl border bg-[#FBF6F0] p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow">
          <div className="h-[60px] w-[60px] rounded-full grid place-items-center bg-[#6E461A] text-amber-900 shrink-0">
            <img src="/feature2-icon.svg" alt="" />
          </div>
          <div className="flex items-start gap-3 pt-2">
            <div>
              <h3 className="text-[18px] md:text-[20px] font-semibold text-[#0A1425] text-left">
                Sales Pipeline Tracking
              </h3>
              <p className="mt-1 text-[13px] md:text-[14px] text-[#0A1425] leading-relaxed text-left">
                Visualize every deal with customizable pipelines, real-time
                status updates, and timely follow-up reminders—so no lead slips
                through the cracks.
              </p>
              <div className="mt-3 flex justify-start">
                <button className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0A1425] hover:opacity-80">
                  Learn More →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-start">
              <Image
                src="/feature1.svg"
                alt="Donut Chart"
                width={50}
                height={300} 
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Card - Image */}
        <div className="rounded-xl border bg-[#FBF6F0] shadow-sm p-6 md:p-7 hover:shadow-md transition-shadow">
          <div className="h-[60px] w-[60px] rounded-full grid place-items-center bg-[#FBF6F0] text-amber-900 shrink-0">
            <img src="/feature1-icon.svg" alt="" />
          </div>
          <div className="flex items-start gap-3 pt-2">
            <div>
              <h3 className="text-[18px] md:text-[20px] font-semibold text-[#0A1425] text-left">
                Automated Reports
              </h3>
              <p className="mt-1 text-[13px] md:text-[14px] text-[#0A1425] leading-relaxed text-left">
                Save time with one-click reporting that delivers insights on
                sales, commissions, and performance metrics—ready to share with
                your team or clients.
              </p>
              <div className="mt-3 flex justify-start">
                <button className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0A1425] hover:opacity-80">
                  Learn More →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bottom-0">
            <div className="rounded-r-md flex items-center justify-end p-4">
              <Image
                src="/feature2.svg"
                alt="Bar Chart"
                width={500}
                height={300}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 mt-8 text-left">
        {features.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border bg-[#FBF6F0] p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* icon */}
            <div className="h-[60px] w-[60px] ">
              <Image src={f.icon} alt={f.title} width={60} height={60} />
            </div>

            {/* text */}
            <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-2 mt-2">
              {f.title}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[#0A1425] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
