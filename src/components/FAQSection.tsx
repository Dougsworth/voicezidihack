import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need to download an app?",
    answer: "No. Just call our number from any phone—smartphone, landline, or basic phone. No app required.",
  },
  {
    question: "How much does it cost to post?",
    answer: "Posting is free. We take a small fee only when a job is completed successfully.",
  },
  {
    question: "What if I don't speak \"proper\" English?",
    answer: "We understand Caribbean English—patois, accent, local expressions. Just speak naturally, the way you talk to your friends and family.",
  },
  {
    question: "How do I get paid?",
    answer: "You and the person who hired you work that out directly—cash, bank transfer, whatever works for both of you.",
  },
  {
    question: "What areas do you cover?",
    answer: "We're starting in Jamaica and expanding across the Caribbean. More islands coming soon!",
  },
  {
    question: "How do workers get notified about new jobs?",
    answer: "Once you register your skills, we'll call or text you when matching jobs are posted in your area.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 shadow-soft data-[state=open]:shadow-medium transition-shadow"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
