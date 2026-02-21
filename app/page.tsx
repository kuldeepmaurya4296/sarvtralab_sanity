import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CoursesSection from '@/components/home/CoursesSection';
import VideosSection from '@/components/home/VideosSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import CTASection from '@/components/home/CTASection';
import PublicLayout from '@/components/layout/PublicLayout';
import { constructMetadata } from '@/lib/seo';
import { getHomePageData } from '@/lib/actions/content.actions';
import { getAllCourses } from '@/lib/actions/course.actions';

export const metadata = constructMetadata({
  title: 'Sarvtra Labs - Empowering Next-Gen Innovators',
  description: 'Sarvtra Labs (Sarwatra Labs) is an innovative EduTech platform offering specialized robotics, AI, and STEM education for students, schools, and government initiatives.',
});

export default async function Home() {
  const [homeData, courses] = await Promise.all([
    getHomePageData(),
    getAllCourses()
  ]);

  return (
    <PublicLayout>
      <HeroSection />
      <StatsSection stats={homeData?.stats} />
      <FeaturesSection features={homeData?.features} />
      <CoursesSection courses={courses} />
      <VideosSection videos={homeData?.videos} />
      <TestimonialsSection testimonials={homeData?.testimonials} />
      <FAQSection faqs={homeData?.faqs} />
      <CTASection organization={homeData?.organization} />
    </PublicLayout>
  );
}
