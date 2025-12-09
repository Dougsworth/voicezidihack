import { Phone, MessageSquare, Users, CheckCircle } from "lucide-react";
import { CARIBBEAN_COLORS } from "@/constants";

const steps = [
  {
    icon: Phone,
    title: "Call or Text",
    description: "Leave a voice message or text us what work you need or what skills you offer"
  },
  {
    icon: MessageSquare,
    title: "We Listen",
    description: "Our smart system understands your Caribbean accent and local expressions"
  },
  {
    icon: Users,
    title: "Get Matched",
    description: "We connect you with workers or job posters in your area"
  },
  {
    icon: CheckCircle,
    title: "Get It Done",
    description: "Meet, agree on details, and get the work completed"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-32" style={{ backgroundColor: CARIBBEAN_COLORS.neutral[50] }}>
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ 
              backgroundColor: `${CARIBBEAN_COLORS.secondary[500]}15`,
              color: CARIBBEAN_COLORS.secondary[600]
            }}>
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
              Simple as 1, 2, 3, 4
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>
              No apps, no complicated sign-ups. Just speak naturally and let us do the rest.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${CARIBBEAN_COLORS.secondary[500]}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: CARIBBEAN_COLORS.secondary[600] }} />
                  </div>
                  
                  {/* Step Number */}
                  <div 
                    className="w-8 h-8 mx-auto mb-4 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: CARIBBEAN_COLORS.accent[500] }}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
                    {step.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Connection Lines for Desktop */}
          <div className="hidden lg:block relative -mt-32 mb-16">
            <div className="absolute top-16 left-1/4 right-1/4 flex justify-between">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="w-24 h-0.5 -mt-0.5"
                  style={{ backgroundColor: `${CARIBBEAN_COLORS.secondary[500]}30` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;