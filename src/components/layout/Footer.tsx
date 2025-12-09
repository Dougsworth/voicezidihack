import { Phone, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";

const Footer = () => {
  const phoneNumber = "+1-876-555-LINK";
  const displayNumber = "1-876-555-LINK";

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-ocean flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                LinkUp<span className="text-primary">Work</span>
              </span>
            </div>
            <p className="text-background/70 mb-6 max-w-sm">
              The Caribbean's voice-first gig platform. Call, talk, get it done.
            </p>
            
            {/* Phone CTA */}
            <a 
              href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center gap-3 px-5 py-3 bg-background/10 rounded-xl hover:bg-background/20 transition-colors"
            >
              <Phone className="w-5 h-5 text-accent" />
              <span className="font-bold text-lg">{displayNumber}</span>
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#how-it-works" className="text-background/70 hover:text-background transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#post-job" className="text-background/70 hover:text-background transition-colors">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="#find-work" className="text-background/70 hover:text-background transition-colors">
                  Find Work
                </a>
              </li>
              <li>
                <a href="#gigs" className="text-background/70 hover:text-background transition-colors">
                  Browse Gigs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:hello@linkupwork.com" 
                  className="flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@linkupwork.com
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/18765551234" 
                  className="flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
            </ul>
            
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://instagram.com/linkupwork" 
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/linkupwork" 
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2024 LinkUpWork Caribbean. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy" className="text-background/50 hover:text-background transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-background/50 hover:text-background transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-background/50 text-sm flex items-center gap-1">
            Made with ❤️ in Jamaica 🇯🇲
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
