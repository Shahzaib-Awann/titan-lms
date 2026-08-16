import HeroSection from "@/components/pages/landing-page/hero-section";
import Navbar from "@/components/pages/landing-page/navbar";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-full">
      <Navbar />
      <HeroSection />
    </div>
  );
}
