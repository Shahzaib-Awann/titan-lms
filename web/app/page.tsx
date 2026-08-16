import AIPoweredFeaturesSection from "@/components/pages/landing-page/aI-powered-features-section";
import FAQSection from "@/components/pages/landing-page/faq-section";
import Footer from "@/components/pages/landing-page/footer";
import HeroSection from "@/components/pages/landing-page/hero-section";
import HowItWorksSection from "@/components/pages/landing-page/how-it-works-section";
import Navbar from "@/components/pages/landing-page/navbar";
import PlatformSection from "@/components/pages/landing-page/platform-section";
import PowerfulDashboardSection from "@/components/pages/landing-page/powerful-dashboard-section";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-full">
      <Navbar />
      <HeroSection />
      <PlatformSection />
      <HowItWorksSection />
      <AIPoweredFeaturesSection />
      <PowerfulDashboardSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
