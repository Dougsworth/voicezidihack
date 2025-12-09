import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ForPostersSection from "@/components/ForPostersSection";
import ForWorkersSection from "@/components/ForWorkersSection";
import WhyVoiceSection from "@/components/WhyVoiceSection";
import BrowseGigsSection from "@/components/BrowseGigsSection";
import ComingSoonSection from "@/components/ComingSoonSection";
import TrustSection from "@/components/TrustSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ForPostersSection />
        <ForWorkersSection />
        <WhyVoiceSection />
        <BrowseGigsSection />
        <ComingSoonSection />
        <TrustSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
