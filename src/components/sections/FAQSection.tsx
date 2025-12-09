import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CARIBBEAN_COLORS } from "@/constants";

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
    <section className="py-20 md:py-32" style={{ backgroundColor: CARIBBEAN_COLORS.neutral[0] }}>
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ 
              backgroundColor: `${CARIBBEAN_COLORS.accent[500]}15`,
              color: CARIBBEAN_COLORS.accent[600]
            }}>
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>
              Got questions? We've got answers.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border transition-all duration-300"
                style={{
                  backgroundColor: CARIBBEAN_COLORS.neutral[50],
                  borderColor: CARIBBEAN_COLORS.neutral[200]
                }}
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value="item" className="border-0">
                    <AccordionTrigger 
                      className="px-6 py-6 text-left text-lg font-medium hover:no-underline w-full flex justify-between items-center [&[data-state=open]>svg]:rotate-180"
                      style={{ color: CARIBBEAN_COLORS.neutral[900] }}
                    >
                      <span className="pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent 
                      className="px-6 pb-6 text-base leading-relaxed animate-accordion-down"
                      style={{ color: CARIBBEAN_COLORS.neutral[600] }}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
