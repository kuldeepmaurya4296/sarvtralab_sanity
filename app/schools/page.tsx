
import PublicLayout from '@/components/layout/PublicLayout';
import { getAllPlans } from '@/lib/actions/plan.actions';
import { getOrganizationDetails, getFeatures } from '@/lib/actions/content.actions';
import SchoolsClient from './SchoolsClient';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
    title: 'For Schools | Sarvtra Labs',
    description: 'Transform your school\'s STEM program with Sarvtra Labs (Sarwatra Labs). Comprehensive robotics curriculum, teacher training, and lab setup for schools.',
});

export default async function SchoolsPage() {
    const [plans, organization, features] = await Promise.all([
        getAllPlans(),
        getOrganizationDetails(),
        getFeatures()
    ]);

    return (
        <PublicLayout>
            <SchoolsClient
                plans={plans}
                organization={organization}
                benefits={features}
            />
        </PublicLayout>
    );
}
