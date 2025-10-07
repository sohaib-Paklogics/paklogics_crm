import TrustAndBenefitsSection from "@/components/landing/benefitSection";
import BlogSection from "@/components/landing/blogSection";
import DataDrivenSection from "@/components/landing/dataDrivenSection";
import FeaturesSection from "@/components/landing/featureSection";
import Footer from "@/components/landing/footer";
import GrowthBanner from "@/components/landing/growth";
import Header from "@/components/landing/header";
import HeroSection from "@/components/landing/heroSection";
import HowItWorksSection from "@/components/landing/howWorksSection";
import ReviewsSection from "@/components/landing/reviewSection";
import UsageStatsBar from "@/components/landing/statBar";
import React from "react";

const Page = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="w-full shrink-0">
        <Header />
      </header>

     
      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className=" text-center">
         {/* Hero Section */}
      <section className="w-full">
        <HeroSection />
        <FeaturesSection/>
        <DataDrivenSection/>
        <TrustAndBenefitsSection/>
        <HowItWorksSection/>
        <UsageStatsBar/>
        <ReviewsSection/>
        <BlogSection /> 
        <GrowthBanner/>
      </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full shrink-0">
        <Footer />
      </footer>
    </div>
  );
};

export default Page;
