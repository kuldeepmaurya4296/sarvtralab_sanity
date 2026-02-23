
'use client';
import { motion } from 'framer-motion';
import { Users, School, MapPin, Trophy } from 'lucide-react';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Users,
  School,
  MapPin,
  Trophy
};

interface StatItem {
  label: string;
  value: string;
  iconName: string;
}

export default function StatsSection({ stats: propStats }: { stats?: StatItem[] }) {
  const defaultStats: StatItem[] = [
    { label: 'Students Trained', value: '15,000+', iconName: 'Users' },
    { label: 'Partner Schools', value: '120+', iconName: 'School' },
    { label: 'States Covered', value: '18', iconName: 'MapPin' },
    { label: 'Competition Winners', value: '250+', iconName: 'Trophy' }
  ];

  const stats = propStats && propStats.length > 0 ? propStats : defaultStats;

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-primary/70">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.iconName];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-foreground/10 flex items-center justify-center">
                  {IconComponent && <IconComponent className="w-7 h-7 text-primary-foreground" />}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm md:text-base text-primary-foreground/80">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
