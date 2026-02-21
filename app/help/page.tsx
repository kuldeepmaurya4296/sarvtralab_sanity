
import PublicLayout from '@/components/layout/PublicLayout';
import HelpContent from './HelpContent';
import { constructMetadata } from '@/lib/seo';
import { getSupportCategories, getSupportArticles } from '@/lib/actions/content.actions';

export const metadata = constructMetadata({
    title: 'Help Center | Sarvtra Labs',
    description: 'Find answers to common questions about Sarvtra Labs (Sarwatra Labs) robotics courses, enrollment, and support.',
});

export default async function HelpPage() {
    const [categories, articles] = await Promise.all([
        getSupportCategories(),
        getSupportArticles()
    ]);

    return (
        <PublicLayout>
            <HelpContent categories={categories} articles={articles} />
        </PublicLayout>
    );
}
