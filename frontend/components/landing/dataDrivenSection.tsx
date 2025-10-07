import React from "react";

type MiniCard = {
  title: string;
  body: string;
  icon: string;
};

type DataDrivenProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  leftCards?: [MiniCard, MiniCard];
  rightTitle?: string;
  rightBody?: string;

  rightPreviewTop?: string;
  rightPreviewBottom?: string;
};

const DataDrivenSection: React.FC<DataDrivenProps> = ({
  eyebrow = "Data-Driven Decision Making",
  heading = "Data-Driven Decision\nMaking",
  subheading = "Your workforce with features designed to empower and connect employees.",
  leftCards = [
    {
      title: "Efficiency",
      body: "Automate lead follow-ups, task updates, and reporting—so your team spends more time closing deals, not chasing admin work.",
      icon: "/eff-icon.svg",
    },
    {
      title: "Accuracy",
      body: "Centralize client, sales, and commission data to eliminate errors and keep every department working with reliable insights.",
      icon: "/feature2-icon.svg",
    },
  ],
  rightTitle = "Collaboration",
  rightBody = "Connect managers, sales reps, and developers with built-in chat and Kanban boards, ensuring projects move forward without delays.",
  rightPreviewTop = "/collab-img.png",
}) => {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[90%] ">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1fr] md:gap-4 items-stretch">
          {/* LEFT COLUMN */}
          <div className="h-full flex flex-col">
            <h2 className="text-[42.36px] sm:text-[34px] leading-tight font-semibold text-slate-900 whitespace-pre-line text-left">
              {heading}
            </h2>
            <p className="mt-2 max-w-xl text-[22px] leading-relaxed text-[#424847] text-left">
              {subheading}
            </p>

            {/* Mini cards */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
              {leftCards.map((c, i) => (
                <article
                  key={i}
                  className="rounded-[40px] border bg-[#FBF6F0] p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow h-full"
                >
                  <img
                    src={c.icon}
                    alt={c.title}
                    className="w-[60px] h-[60px] mb-6"
                  />
                  <h3 className="text-[23.06px] font-semibold text-[#0A1425] text-left">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[15.63pxpx] leading-relaxed text-[#0A1425] text-left">
                    {c.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="h-full flex flex-col">
            <div className="rounded-[40px] border bg-[#FBF6F0] p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-center gap-3">
                <div className="grid h-[60px] w-[60px] place-items-center">
                  <img src="/collab-icon.svg" alt="" />
                </div>
                <h3 className="text-[23.06px] font-semibold text-[#0A1425] ">
                  {rightTitle}
                </h3>
              </div>
              <p className="mt-2 max-w-lg text-[15.63pxpx] leading-relaxed text-[#0A1425]  text-left ml-12">
                {rightBody}
              </p>

              {/* Layered mockup */}
              <div className="relative mt-4 flex-grow flex items-end justify-end">
                <img
                  src={rightPreviewTop}
                  alt="kanban card"
                  className="block w-[72%] min-w-[280px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* spacing for large screen */}
        <div className="h-6 md:h-10" />
      </div>
    </section>
  );
};

export default DataDrivenSection;
