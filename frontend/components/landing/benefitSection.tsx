import React from "react";

type Benefit = {
  title: string;
  text: string;
  icon: string;
};

type Props = {
  // LEFT column
  topImage?: string;
  ratingLabel?: string;
  bottomFrameFront?: string;
  bottomFrameBack?: string;

  // RIGHT column
  topLeft?: Benefit;
  topRight?: Benefit;
  bottom?: Benefit;
};

const Card: React.FC<{ b: Benefit; className?: string }> = ({
  b,
  className,
}) => {
  const isGrowth = b.title === "Growth Enablement";

  return (
    <div
      className={[
        "rounded-[40px] border bg-[#FBF6F0] p-6 md:p-7 shadow-sm hover:shadow-md transition-all flex",
        isGrowth ? "flex-row items-center gap-6" : "flex-col",
        className || "",
      ].join(" ")}
    >
      {/* Icon */}
      <img
        src={b.icon}
        alt=""
        className={`${
          isGrowth
            ? "w-[70px] h-[70px] flex-shrink-0"
            : "w-[60px] h-[60px] mb-6 sm:mb-8"
        }`}
      />

      {/* Text Content */}
      <div className="flex flex-col flex-grow">
        <h4
          className={`font-semibold text-left ${
            isGrowth
              ? "text-lg sm:text-xl md:text-2xl text-[#0A1425]"
              : "text-base sm:text-lg text-[#0A1425]"
          }`}
        >
          {b.title}
        </h4>
        <p
          className={`mt-2 leading-relaxed whitespace-pre-line text-left ${
            isGrowth
              ? "text-sm sm:text-base md:text-lg text-[#0A1425]"
              : "text-sm sm:text-[15.63px] text-[#0A1425]"
          }`}
        >
          {b.text}
        </p>
      </div>
    </div>
  );
};

const TrustAndBenefitsSection: React.FC<Props> = ({
  topImage = "/reviews-icon.png",
  ratingLabel = "10k+ Reviews (4.5 out of 5)",
  bottomFrameFront = "/comm-cards.png",

  topLeft = {
    title: "Compliance",
    text: "Connect managers, sales reps, and developers with built-in chat and Kanban boards, ensuring projects move forward without delays.",
    icon: "/feature-card-icon.svg",
  },
  topRight = {
    title: "Cost Savings",
    text: "Cut down on manual processes with automation that reduces overhead and improves resource allocation.",
    icon: "/feature1-icon.svg",
  },
  bottom = {
    title: "Growth Enablement",
    text: `Support team development with performance dashboards
and clear visibility into goals, progress, 
and achievements.`,
    icon: "/grow-icon.svg",
  },
}) => {
  return (
    <section className="w-full bg-white">
      <div className="w-[90%] mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.05fr_1fr] md:gap-4 items-stretch">
          {/* LEFT CONTAINER */}
          <div className="relative h-full">
            <div className="h-full rounded-[40px] border bg-[#FBF6F0] py-6 md:py-7 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* top decorative image */}
              <div className="flex justify-center items-center">
                <img
                  src={topImage}
                  alt="community"
                  className="h-10 sm:h-11 w-auto select-none"
                />
              </div>

              {/* rating pill */}
              <div className="mt-2 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[20px] font-medium text-[#0A1425]">
                  {ratingLabel}
                </div>
              </div>

              <div className="flex justify-center items-center">
                <img src="/wavy-icon.svg" />
              </div>

              {/* stacked frame preview */}
              <div className="relative mt-6 flex justify-center items-center flex-grow">
                <img
                  src={bottomFrameFront}
                  alt="preview front"
                  className="relative w-[100%] min-w-[200px]"
                />
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER */}
          <div className="flex flex-col gap-4 h-full">
            {/* top two cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
              <Card b={topLeft} className="h-full" />
              <Card b={topRight} className="h-full" />
            </div>

            {/* bottom growth card */}
            <div className="h-[220px] sm:h-[260px] md:h-[280px]">
              <Card b={bottom} className="h-full" />
            </div>
          </div>
        </div>

        {/* spacing */}
        <div className="h-4 sm:h-6" />
      </div>
    </section>
  );
};

export default TrustAndBenefitsSection;
