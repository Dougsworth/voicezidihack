import { Phone, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CARIBBEAN_COLORS, HOTLINE } from "@/constants";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    const phone = localStorage.getItem('userPhoneDisplay')
    setUserPhone(phone)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{
      backgroundColor: `${CARIBBEAN_COLORS.neutral[0]}f0`,
      borderColor: CARIBBEAN_COLORS.neutral[200]
    }}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 animate-fadeIn">
          <img 
            src="/linkuplogoimage-removebg-preview.png" 
            alt="LinkUpWork Caribbean Logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
            LinkUp<span style={{ color: CARIBBEAN_COLORS.secondary[600] }}>Work</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/find-work" className="transition-colors" style={{ color: CARIBBEAN_COLORS.neutral[600] }} onMouseEnter={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.neutral[900]} onMouseLeave={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.neutral[600]}>
            Find Work
          </Link>
          <Link to="/hire-workers" className="transition-colors" style={{ color: CARIBBEAN_COLORS.neutral[600] }} onMouseEnter={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.neutral[900]} onMouseLeave={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.neutral[600]}>
            Hire Workers
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {userPhone ? (
            <Link to="/signup" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[50], color: CARIBBEAN_COLORS.secondary[700] }}>
              <User className="w-4 h-4" />
              {userPhone}
            </Link>
          ) : (
            <Link to="/signup">
              <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                Sign Up
              </Button>
            </Link>
          )}
          <a href={HOTLINE.tel}>
            <Button size="default" style={{ 
              backgroundColor: CARIBBEAN_COLORS.accent[500], 
              color: CARIBBEAN_COLORS.neutral[0],
              border: 'none'
            }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = CARIBBEAN_COLORS.accent[600]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = CARIBBEAN_COLORS.accent[500]}>
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          style={{ color: CARIBBEAN_COLORS.neutral[900] }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in border-b" style={{ 
          backgroundColor: CARIBBEAN_COLORS.neutral[0], 
          borderColor: CARIBBEAN_COLORS.neutral[200] 
        }}>
          <nav className="container py-4 flex flex-col gap-4">
            {userPhone && (
              <Link 
                to="/signup"
                className="flex items-center gap-2 py-2 px-3 rounded-lg"
                style={{ backgroundColor: CARIBBEAN_COLORS.secondary[50], color: CARIBBEAN_COLORS.secondary[700] }}
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                {userPhone}
              </Link>
            )}
            <Link 
              to="/find-work" 
              className="transition-colors py-2"
              style={{ color: CARIBBEAN_COLORS.neutral[600] }}
              onClick={() => setIsMenuOpen(false)}
            >
              Find Work
            </Link>
            <Link 
              to="/hire-workers" 
              className="transition-colors py-2"
              style={{ color: CARIBBEAN_COLORS.neutral[600] }}
              onClick={() => setIsMenuOpen(false)}
            >
              Hire Workers
            </Link>
            {!userPhone && (
              <Link 
                to="/signup"
                className="transition-colors py-2 font-medium"
                style={{ color: CARIBBEAN_COLORS.secondary[600] }}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
            <a href={HOTLINE.tel} className="mt-2">
              <Button size="default" className="w-full" style={{ 
                backgroundColor: CARIBBEAN_COLORS.accent[500], 
                color: CARIBBEAN_COLORS.neutral[0],
                border: 'none'
              }}>
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
