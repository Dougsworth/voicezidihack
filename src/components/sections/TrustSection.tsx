import { Shield, Phone, Users, Star, CheckCircle2 } from "lucide-react";

const TrustSection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-teal-50/30 to-blue-50/20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust & Safety Badge */}
          <div className="inline-flex items-center justify-center mb-6">
            <span className="px-5 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200/50">
              Trust & Safety
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
            Safe and Simple
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            We keep the community secure so you can focus on getting things done.
          </p>

          {/* Trust Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              {
                icon: Phone,
                title: "Phone Verified",
                description: "Every poster verified by phone number",
              },
              {
                icon: Shield,
                title: "Identity Protected",
                description: "Your phone number is your secure identity",
              },
              {
                icon: Users,
                title: "Community Reporting",
                description: "Report bad actors to keep everyone safe",
              },
              {
                icon: CheckCircle2,
                title: "Content Moderation",
                description: "All voice notes reviewed for safety",
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 bg-teal-100 text-teal-600">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
