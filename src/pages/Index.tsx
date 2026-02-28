import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MyAnalysesSection from "@/components/MyAnalysesSection";
import FavoritesSection from "@/components/FavoritesSection";
import RecentSection from "@/components/RecentSection";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      {user && (
        <>
          <MyAnalysesSection />
          <FavoritesSection />
        </>
      )}
      <RecentSection />
      <FeaturesSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
