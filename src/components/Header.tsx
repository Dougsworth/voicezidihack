import { MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const whatsappNumber = "18765551465"; // Replace with your actual WhatsApp number
  const whatsappMessage = "Hi! I'd like to post a job or find work through voice note.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="LinkUpWork Caribbean" 
            className="h-10 w-auto" 
          />
          <span className="text-xl font-bold text-foreground">
            LinkUp<span className="text-primary">Work</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/find-work" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Work
          </Link>
          <Link to="/hire-workers" className="text-muted-foreground hover:text-foreground transition-colors">
            Hire Workers
          </Link>
          <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
            Browse All
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button variant="coral" size="default">
              <MessageCircle className="w-4 h-4" />
              Send Voice Note
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
            <Link 
              to="/find-work" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Work
            </Link>
            <Link 
              to="/hire-workers" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Hire Workers
            </Link>
            <Link 
              to="/jobs" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse All
            </Link>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-2">
              <Button variant="coral" size="default" className="w-full">
                <MessageCircle className="w-4 h-4" />
                Send Voice Note
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
