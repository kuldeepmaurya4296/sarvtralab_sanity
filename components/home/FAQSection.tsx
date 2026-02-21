
'use client';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQSection = ({ faqs: propFAQs }: { faqs?: FAQItem[] }) => {
  const defaultFAQs: FAQItem[] = [
    { id: 'faq-001', question: 'What age group is suitable for these courses?', answer: 'Our courses are designed for students from Class 4 to Class 12. We have three tracks: Foundation (Class 4-6), Intermediate (Class 7-10), and Advanced (Class 11-12).' },
    { id: 'faq-002', question: 'Do students need any prior experience in coding or robotics?', answer: 'No prior experience is required for the Foundation track. We start from basics and gradually progress to advanced concepts.' },
    { id: 'faq-003', question: 'What is included in the course fee?', answer: 'The course fee includes live sessions, recorded videos, robotics kit, practice exercises, project materials, assessments, and certification.' },
    { id: 'faq-004', question: 'How does the EMI option work?', answer: 'We offer 0% interest EMI options through various payment partners. You can split your course fee into 3, 6, or 9 monthly installments with no additional cost.' },
    { id: 'faq-005', question: 'Can schools enroll their students in bulk?', answer: 'Yes! We offer special institutional packages for schools. Contact our school partnership team for customized solutions and pricing.' },
    { id: 'faq-006', question: 'Is there a refund policy?', answer: 'Yes, we offer a 7-day money-back guarantee. If you are not satisfied with the course, you can request a full refund within 7 days of enrollment.' }
  ];
  const displayFAQs = propFAQs && propFAQs.length > 0 ? propFAQs : defaultFAQs;

  return (
    <section id="faqs" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="badge-secondary mb-4 inline-block"
            >
              FAQs
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-heading"
            >
              Frequently Asked
              <span className="block gradient-text-secondary">Questions</span>
            </motion.h2>
          </div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {displayFAQs.map((faq, index) => (
                <AccordionItem
                  key={faq.id || (faq as any)._id || index}
                  value={faq.id}
                  className="bg-card border rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;


