
import PublicLayout from '@/components/layout/PublicLayout';
import BlogContent from './BlogContent';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
    title: 'Blog | Insights into Robotics & STEM | Sarvtra Labs',
    description: 'Read the latest updates, news, and insights about robotics, AI, and STEM education in India on the Sarvtra Labs (Sarwatra Labs) blog.',
});

export default function BlogPage() {
    return (
        <PublicLayout>
            <BlogContent />
        </PublicLayout>
    );
}
