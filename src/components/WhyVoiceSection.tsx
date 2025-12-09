import { Smartphone, Wifi, Globe, FileText, Key } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Works from any phone",
    description: "Smartphone, landline, or basic phone—all work.",
  },
  {
    icon: Wifi,
    title: "No internet required to post",
    description: "Just need phone signal to make the call.",
  },
  {
    icon: Globe,
    title: "Understands Caribbean accents",
    description: "Patois, accent, local expressions—speak naturally.",
  },
  {
    icon: FileText,
    title: "No signup forms or passwords",
    description: "Your phone number is your account.",
  },
  {
    icon: Key,
    title: "Your phone is your ID",
    description: "Simple, secure, and always with you.",
  },
];

const WhyVoiceSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-ocean text-primary-foreground overflow-hidden">
      <div className="container relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-foreground/20 text-primary-foreground rounded-full text-sm font-medium mb-4">
              Voice First
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              No App. No Typing. Just Talk.
            </h2>
            <p className="text-lg text-primary-foreground/80">
              We built LinkUpWork for real Caribbean people. Not everyone has a smartphone. Not everyone wants to type. Our system understands how you actually talk.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyVoiceSection;
