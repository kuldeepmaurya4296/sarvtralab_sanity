'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users, Star, ArrowRight, IndianRupee, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getAllCourses } from '@/lib/actions/course.actions';

const courseCategories = [
  { id: 'foundation', name: 'Foundation Maker', grades: 'Class 4-6', color: 'primary' },
  { id: 'intermediate', name: 'Intermediate Robotics', grades: 'Class 7-10', color: 'secondary' },
  { id: 'advanced', name: 'Advanced Pre-Engineering', grades: 'Class 11-12', color: 'accent' }
];

interface CourseData {
  id: string;
  customId?: string;
  _id?: string;
  title: string;
  description: string;
  grade: string;
  category: string;
  price: number;
  originalPrice: number;
  emiAvailable: boolean;
  emiAmount?: number;
  totalHours: number;
  sessions?: number;
  studentsEnrolled: number;
  rating: number;
  skillFocus?: string[];
  image?: string;
}

interface CoursesSectionProps {
  courses?: CourseData[];
}

const defaultCourses: CourseData[] = [];

const CoursesSection = ({ courses }: CoursesSectionProps) => {
  const featuredCourses = (courses && courses.length > 0 ? courses : defaultCourses).slice(0, 3);

  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="badge-secondary mb-4 inline-block"
          >
            Our Programs
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            CBSE-Aligned{' '}
            <span className="gradient-text-secondary">Robotics Courses</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading"
          >
            From beginners to advanced learners, we have the perfect track for every student.
          </motion.p>
        </div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {courseCategories.map((category) => (
            <div
              key={category.id}
              className={`px-6 py-3 rounded-full border-2 transition-all cursor-pointer
                ${category.id === 'foundation' ? 'border-primary bg-primary/5 text-primary' :
                  category.id === 'intermediate' ? 'border-secondary bg-secondary/5 text-secondary' :
                    'border-accent bg-accent/5 text-accent'
                }`}
            >
              <span className="font-semibold">{category.name}</span>
              <span className="text-sm opacity-70 ml-2">({category.grades})</span>
            </div>
          ))}
        </motion.div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course._id || course.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="course-card group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl">
                <Image
                  src={course.image || "/robotics-illustration.jpg"}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${course.category === 'foundation' ? 'bg-primary text-primary-foreground' :
                      course.category === 'intermediate' ? 'bg-secondary text-secondary-foreground' :
                        'bg-accent text-accent-foreground'
                    }`}>
                    {course.grade}
                  </span>
                </div>
                {course.emiAvailable && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="emi-badge">
                      <IndianRupee className="w-3 h-3" />
                      0% EMI
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 md:p-8 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-base text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  {course.skillFocus && course.skillFocus.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.skillFocus.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/5 text-primary border border-primary/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{course.totalHours || 0}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{course.sessions || 1} Sessions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{(course.studentsEnrolled || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="mt-6">
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        ₹{(course.price || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ₹{(course.originalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                    <Link href={`/courses/${course.id || course.customId || course._id}`}>
                      <Button size="sm" variant="outline" className="gap-1 hover:scale-105 transition-all">
                        View <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {course.emiAvailable && (
                    <p className="text-xs text-success mt-2">
                      EMI from ₹{course.emiAmount?.toLocaleString()}/month
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/courses">
            <Button size="lg" className="btn-hero-secondary hover:scale-105 hover:shadow-lg transition-all text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl">
              View All Courses
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;


