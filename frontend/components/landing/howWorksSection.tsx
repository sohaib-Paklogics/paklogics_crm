import React from "react";

type Step = {
  title: string;
  body: string;
  icon?: string;
};

type HowItWorksProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  steps?: Step[];
  rightImage?: string;
};

const HowItWorksSection: React.FC<HowItWorksProps> = ({
  eyebrow = "HOW IT WORKS?",
  title = "Easy Process To Get Started",
  description = "Experience a smooth onboarding journey designed to help your team adopt Validiz",
  steps = [
    {
      title: "Create Your Account",
      body: "Sign up in minutes and personalize your workspace to match your agency or team structure",
      icon: "/account-icon.svg",
    },
    {
      title: "Set Up Your Pipeline",
      body: "Easily customize sales pipelines, roles, and commission rules to reflect how your business operates.",
      icon: "/pipeline-icon.svg",
    },
    {
      title: "Start Managing Smarter",
      body: "Assign leads, track tasks with Kanban boards, and generate reports—all from one intuitive dashboard.",
      icon: "/manager-icon.svg",
    },
  ],
  rightImage = "/login-img.png", // <- swap with your image
}) => {
  return (
    <section className="w-full bg-white mt-6">
      <div className="mx-auto w-[90%] ">
        {/* Header copy */}
        <header className="text-center pt-8">
          <div className="text-[22px] font-extrabold tracking-wider uppercase  text-primary">{eyebrow}</div>
          <h2 className="mt-2 text-[32px] sm:text-[40px] font-bold text-[#0A1425]">{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[20px] leading-relaxed text-[#0A1425]">{description}</p>
        </header>

        {/* Two-column content */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8 items-stretch">
          {/* Left: steps */}
          <div className="space-y-14 text-left flex flex-col justify-center h-full">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-start gap-5">
                {/* Bigger icon box */}
                <div className="mt-1 grid h-[72px] w-[72px] place-items-center">
                  <img src={s.icon} alt={s.title} className="w-12 h-12" />
                </div>

                <div>
                  <h3 className="text-[24px] font-semibold text-[#0A1425]">{s.title}</h3>
                  <p className="mt-1 max-w-xl text-[16px] leading-relaxed text-[#0A1425]">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: smaller image inside container */}
          <div className="relative w-full h-full flex justify-end items-center">
            <img src={rightImage} alt="App preview" className="w-[80%] h-auto object-contain" />
          </div>
        </div>

        {/* Extra bottom spacing */}
        <div className="h-6 md:h-10" />
      </div>
    </section>
  );
};

export default HowItWorksSection;
