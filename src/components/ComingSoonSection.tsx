import { TrendingUp, Mic, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ComingSoonSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "You're on the list!",
        description: "We'll let you know when the Voice Budget Assistant launches.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-warm rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-highlight-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 text-center text-highlight-foreground">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-highlight-foreground/20 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Coming Soon
              </span>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Voice Budget Assistant
              </h2>
              
              <p className="text-lg text-highlight-foreground/80 max-w-xl mx-auto mb-8">
                Soon you'll be able to call in after a gig and tell us what you earned. We'll help you budget—track your income, plan for expenses, and save a little. All by voice, no spreadsheets required.
              </p>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  <span className="text-sm font-medium">Voice Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Track Earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-5 h-5" />
                  <span className="text-sm font-medium">Smart Savings</span>
                </div>
              </div>

              {/* Waitlist Form */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-3 rounded-xl bg-highlight-foreground/20 border border-highlight-foreground/30 text-highlight-foreground placeholder:text-highlight-foreground/50 focus:outline-none focus:border-highlight-foreground/60 transition-colors"
                />
                <Button 
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="bg-highlight-foreground text-highlight hover:bg-highlight-foreground/90"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection;
