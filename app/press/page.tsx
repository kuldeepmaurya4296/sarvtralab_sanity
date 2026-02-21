
import PublicLayout from '@/components/layout/PublicLayout';
import PressContent from './PressContent';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
    title: 'Press & Media | Sarvtra Labs',
    description: 'Get the latest press releases, brand assets, and media contact information for Sarvtra Labs (Sarwatra Labs).',
});

export default function PressPage() {
    return (
        <PublicLayout>
            <PressContent />
        </PublicLayout>
    );
}
