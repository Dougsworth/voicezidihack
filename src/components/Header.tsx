import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phoneNumber = "+1-876-555-LINK";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-ocean flex items-center justify-center">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            LinkUp<span className="text-primary">Work</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#post-job" className="text-muted-foreground hover:text-foreground transition-colors">
            Post a Job
          </a>
          <a href="#find-work" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Work
          </a>
          <a href="#gigs" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse Gigs
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}>
            <Button variant="coral" size="default">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-4">
            <a 
              href="#how-it-works" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#post-job" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Post a Job
            </a>
            <a 
              href="#find-work" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Work
            </a>
            <a 
              href="#gigs" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Gigs
            </a>
            <a href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`} className="mt-2">
              <Button variant="coral" size="default" className="w-full">
                <Phone className="w-4 h-4" />
                Call Now
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
