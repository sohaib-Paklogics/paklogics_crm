import React from "react";

type Stat = { value: string; label: string };

type UsageStatsBarProps = {
  heading?: string | React.ReactNode;
  stats?: Stat[];
};

const defaultStats: Stat[] = [
  { value: "1M+", label: "Active Downloads" },
  { value: "4.86", label: "Average Rating" },
  { value: "60K+", label: "Active Users" },
];

export default function UsageStatsBar({
  heading = (
    <>
      More Than 1M+ People Around
      <br />
      The World Are Already Using
    </>
  ),
  stats = defaultStats,
}: UsageStatsBarProps) {
  return (
    <section className="w-full bg-[#4A171E] text-white mt-6">
      <div className="mx-auto w-[90%]">
        {/* layout: heading on the left, 3 stats on the right */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-6 md:gap-8 py-8 sm:py-10 ">
          {/* Left heading */}
          <h2 className="md:col-span-2 text-[22px] sm:text-[26px] lg:text-[40px] leading-[1.15] font-semibold text-center md:text-left">
            {heading}
          </h2>

          {/* Right stats (3 columns) */}
          <div className="md:col-span-2">
            <div className="grid grid-flow-col auto-cols-max justify-end text-center gap-16">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[22px] sm:text-[26px] lg:text-[32px] font-semibold">
                    {s.value}
                  </span>
                  <span className="mt-1 text-[12.5px] sm:text-[20px] text-white/80">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
