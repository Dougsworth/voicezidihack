import { Phone, MessageCircle, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Phone,
    number: "01",
    title: "Call the Number",
    description: "Dial our local number from any phone—smartphone, landline, whatever you have.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Describe the Job",
    description: "Tell us what you need done or what skills you're offering. Speak naturally—we understand Caribbean English.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Your Listing Goes Live",
    description: "We transcribe your message and create a listing automatically. Workers and job posters connect directly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Simple as 1-2-3
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            No app downloads. No sign-up forms. Just your voice.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative bg-card rounded-2xl p-8 shadow-soft border border-border hover:border-primary/50 hover:shadow-medium transition-all duration-300 group-hover:-translate-y-1">
                {/* Step Number */}
                <span className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-sunset rounded-xl flex items-center justify-center text-accent-foreground font-bold text-lg shadow-medium">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
