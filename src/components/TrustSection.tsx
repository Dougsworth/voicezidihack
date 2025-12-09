import { Shield, Phone, Users, Star } from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "Phone Verified",
    description: "Every poster verified by phone number",
  },
  {
    icon: Users,
    title: "Community Reporting",
    description: "Report bad actors to keep the community safe",
  },
  {
    icon: Shield,
    title: "Your Identity Protected",
    description: "Your phone number is your secure identity",
  },
  {
    icon: Star,
    title: "Ratings Coming Soon",
    description: "Reviews and ratings system launching soon",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Trust & Safety
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Safe and Simple
          </h2>
          <p className="text-lg text-muted-foreground">
            We keep the community secure so you can focus on getting things done.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-card rounded-2xl border border-border shadow-soft"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
