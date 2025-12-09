import { Phone, Wrench, Zap, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = [
  {
    icon: Wrench,
    quote: "Mi do painting, tiling, and basic plumbing. Available weekends.",
  },
  {
    icon: Zap,
    quote: "I'm a licensed electrician in Kingston, available for emergency calls",
  },
  {
    icon: Truck,
    quote: "Mi have a van and can do deliveries anywhere in St. Catherine",
  },
];

const ForWorkersSection = () => {
  const phoneNumber = "+1-876-555-LINK";

  return (
    <section id="find-work" className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Examples - On left for visual balance */}
          <div className="order-2 lg:order-1 space-y-4">
            <p className="text-sm font-medium text-muted-foreground mb-6">
              Examples of what workers say:
            </p>
            {examples.map((example, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-accent/30 transition-all shadow-soft hover:shadow-medium group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <example.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-foreground italic text-lg leading-relaxed">
                  "{example.quote}"
                </p>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              For Workers
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Looking for Work?{" "}
              <span className="text-gradient-ocean">Let People Find You</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Call in and tell us your skills and availability. We'll create a profile so people looking for help can find you. Get notified when jobs match what you do.
            </p>

            <a href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}>
              <Button variant="ocean" size="lg">
                <Phone className="w-5 h-5" />
                Register Your Skills
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWorkersSection;
