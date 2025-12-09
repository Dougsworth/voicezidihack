import {
  Header,
  Footer,
  HeroSection,
  WhyVoiceSection,
  HowItWorksSection,
  TrustSection,
  FAQSection
} from "@/components";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhyVoiceSection />
        <TrustSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
