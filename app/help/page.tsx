
import PublicLayout from '@/components/layout/PublicLayout';
import HelpContent from './HelpContent';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
    title: 'Help Center | Sarvtra Labs',
    description: 'Find answers to common questions about Sarvtra Labs (Sarwatra Labs) robotics courses, enrollment, and support.',
});

export default function HelpPage() {
    return (
        <PublicLayout>
            <HelpContent />
        </PublicLayout>
    );
}
