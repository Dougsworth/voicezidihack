import { Phone, Paintbrush, Truck, UtensilsCrossed, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = [
  {
    icon: Paintbrush,
    quote: "Mi need a man fi fix mi fence this Saturday",
  },
  {
    icon: UtensilsCrossed,
    quote: "Looking for someone to cater a birthday party for 30 people",
  },
  {
    icon: Truck,
    quote: "Need a truck to move furniture from Portmore to Half Way Tree",
  },
  {
    icon: Camera,
    quote: "Want a photographer for mi daughter graduation",
  },
];

const ForPostersSection = () => {
  const phoneNumber = "+1-876-555-LINK";

  return (
    <section id="post-job" className="py-20 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
              For Job Posters
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Need Help?{" "}
              <span className="text-gradient-sunset">Just Call and Tell Us</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              No app to download. No forms to fill out. Just call, describe the job—painting, plumbing, cleaning, delivery, catering, whatever—and we handle the rest. Your listing goes live in minutes and workers in your area can find it.
            </p>

            <a href={`tel:${phoneNumber.replace(/[^+\d]/g, '')}`}>
              <Button variant="coral" size="lg">
                <Phone className="w-5 h-5" />
                Post a Job Now
              </Button>
            </a>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground mb-6">
              Examples of what people post:
            </p>
            {examples.map((example, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-all shadow-soft hover:shadow-medium group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <example.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-foreground italic text-lg leading-relaxed">
                  "{example.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForPostersSection;
