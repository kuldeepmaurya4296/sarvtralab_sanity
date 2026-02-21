
import PublicLayout from '@/components/layout/PublicLayout';
import PressContent from './PressContent';
import { constructMetadata } from '@/lib/seo';
import { getPressReleases } from '@/lib/actions/content.actions';

export const metadata = constructMetadata({
    title: 'Press & Media | Sarvtra Labs',
    description: 'Get the latest press releases, brand assets, and media contact information for Sarvtra Labs (Sarwatra Labs).',
});

export default async function PressPage() {
    const releases = await getPressReleases();

    return (
        <PublicLayout>
            <PressContent releases={releases} />
        </PublicLayout>
    );
}
