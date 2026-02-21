
import PublicLayout from '@/components/layout/PublicLayout';
import CareersContent from './CareersContent';
import { constructMetadata } from '@/lib/seo';
import { getJobs } from '@/lib/actions/content.actions';

export const metadata = constructMetadata({
    title: 'Careers | Join Our Team | Sarvtra Labs',
    description: 'Join Sarvtra Labs (Sarwatra Labs) and help revolutionize robotics education in India. Explore our current job openings and career opportunities.',
});

export default async function CareersPage() {
    const jobs = await getJobs();

    return (
        <PublicLayout>
            <CareersContent jobs={jobs} />
        </PublicLayout>
    );
}
