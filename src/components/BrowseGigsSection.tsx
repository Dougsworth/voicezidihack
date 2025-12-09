import { MapPin, Clock, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const gigs = [
  {
    title: "Painter needed for living room",
    location: "Spanish Town",
    pay: "$15,000",
    posted: "2 hours ago",
    category: "Painting",
  },
  {
    title: "Van driver for delivery run",
    location: "Kingston to Montego Bay",
    pay: "$8,000",
    posted: "5 hours ago",
    category: "Delivery",
  },
  {
    title: "Caterer for birthday party (30 ppl)",
    location: "Portmore",
    pay: "$25,000",
    posted: "1 day ago",
    category: "Catering",
  },
  {
    title: "Electrician for wiring check",
    location: "Half Way Tree",
    pay: "$12,000",
    posted: "1 day ago",
    category: "Electrical",
  },
  {
    title: "Grass cutting and yard cleanup",
    location: "Mandeville",
    pay: "$5,000",
    posted: "2 days ago",
    category: "Landscaping",
  },
  {
    title: "Photographer for graduation",
    location: "New Kingston",
    pay: "$18,000",
    posted: "3 hours ago",
    category: "Photography",
  },
];

const categoryColors: Record<string, string> = {
  Painting: "bg-blue-100 text-blue-700",
  Delivery: "bg-orange-100 text-orange-700",
  Catering: "bg-pink-100 text-pink-700",
  Electrical: "bg-yellow-100 text-yellow-700",
  Landscaping: "bg-green-100 text-green-700",
  Photography: "bg-purple-100 text-purple-700",
};

const BrowseGigsSection = () => {
  return (
    <section id="gigs" className="py-20 md:py-32 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 bg-highlight/20 text-highlight-foreground rounded-full text-sm font-medium mb-4">
              Live Listings
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              See What's Available
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse current gigs in your area
            </p>
          </div>
          <a href="/gigs">
            <Button variant="outline" size="lg">
              View All Gigs
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>

        {/* Gigs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig, index) => (
            <article 
              key={index}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:border-primary/30 hover:shadow-medium transition-all group cursor-pointer"
            >
              {/* Category Badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[gig.category] || 'bg-muted text-muted-foreground'}`}>
                {gig.category}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                {gig.title}
              </h3>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{gig.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{gig.posted}</span>
                </div>
              </div>

              {/* Pay */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold text-primary">{gig.pay}</span>
                </div>
                <span className="text-sm text-muted-foreground">JMD</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseGigsSection;
