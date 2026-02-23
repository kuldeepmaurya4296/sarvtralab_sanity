
'use client';
import { motion } from 'framer-motion';
import { GraduationCap, Wrench, Users, Trophy, BarChart3, Award } from 'lucide-react';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  GraduationCap,
  Wrench,
  Users,
  Trophy,
  BarChart3,
  Award
};

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const FeaturesSection = ({ features: propFeatures }: { features?: FeatureItem[] }) => {
  const defaultFeatures: FeatureItem[] = [
    { id: 'feat-001', title: 'CBSE Aligned Curriculum', description: 'Our courses are designed in accordance with NCF 2023, NEP 2020, and CBSE Skill Education Framework.', icon: 'GraduationCap' },
    { id: 'feat-002', title: 'Hands-on Learning', description: 'Project-based learning with real robotics kits delivered to your doorstep.', icon: 'Wrench' },
    { id: 'feat-003', title: 'Expert Instructors', description: 'Learn from IIT/NIT alumni and industry professionals with years of experience.', icon: 'Users' },
    { id: 'feat-004', title: 'Competition Ready', description: 'Prepare for national and international robotics competitions like ATL, WRO, and more.', icon: 'Trophy' },
    { id: 'feat-005', title: 'Progress Tracking', description: 'Real-time progress reports for students, parents, and schools.', icon: 'BarChart3' },
    { id: 'feat-006', title: 'Certification', description: 'Industry-recognized certificates on course completion.', icon: 'Award' }
  ];
  const displayFeatures = propFeatures && propFeatures.length > 0 ? propFeatures : defaultFeatures;

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="badge-primary mb-4 inline-block"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            Why Parents & Schools{' '}
            <span className="gradient-text">Trust Sarvtra Labs</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading"
          >
            We combine industry expertise with innovative teaching methods to deliver
            world-class robotics education.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayFeatures.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <motion.div
                key={(feature as any)._id || feature.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="feature-card group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 p-8"
              >
                <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
                  {IconComponent && <IconComponent className="w-7 h-7" />}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;


