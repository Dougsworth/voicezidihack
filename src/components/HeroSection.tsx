import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const phoneNumber = "+1-876-555-LINK";
  const displayNumber = "1-876-555-LINK";

  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-gradient-hero overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-highlight/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Voice-First Gig Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Call. Talk.{" "}
            <span className="text-gradient-sunset">Get It Done.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Post a job or find work with just a phone call. No app, no typing—just speak naturally and we handle the rest.
          </p>

          {/* Phone Number Display */}
          <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a 
              href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center gap-3 px-6 py-4 bg-card rounded-2xl shadow-medium border border-border hover:border-primary transition-all hover:shadow-glow group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-sunset flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Call now to post or find work</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{displayNumber}</p>
              </div>
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <a href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}>
              <Button variant="hero" size="lg">
                <Phone className="w-5 h-5" />
                Post a Gig Now
              </Button>
            </a>
            <a href="#gigs">
              <Button variant="heroSecondary" size="lg">
                Browse Available Gigs
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-border/50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-sm text-muted-foreground mb-4">Trusted by Caribbean communities</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">500+</span>
                <span className="text-sm">Jobs Posted</span>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">1,200+</span>
                <span className="text-sm">Workers Registered</span>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">🇯🇲</span>
                <span className="text-sm">Made in Jamaica</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 60L60 54C120 48 240 36 360 42C480 48 600 72 720 78C840 84 960 72 1080 60C1200 48 1320 36 1380 30L1440 24V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V60Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
