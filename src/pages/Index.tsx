import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MyAnalysesSection from "@/components/MyAnalysesSection";
import RecentSection from "@/components/RecentSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MyAnalysesSection />
      <RecentSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
