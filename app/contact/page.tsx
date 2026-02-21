import PublicLayout from '@/components/layout/PublicLayout';
import ContactContent from '@/components/contact/ContactContent';
import { constructMetadata } from '@/lib/seo';
import { getOrganizationDetails } from '@/lib/actions/content.actions';

export const metadata = constructMetadata({
    title: 'Contact Us | Sarvtra Labs',
    description: 'Get in touch with Sarvtra Labs (Sarwatra Labs). Have questions about our robotics courses, school partnerships, or AI education? We\'re here to help.',
    keywords: ['Contact Sarvtra Labs', 'Sarvatra Labs Bhopal', 'Robotics Course Inquiry', 'School Partnership India', 'Sarwatra Labs Contact'],
});

export default async function ContactPage() {
    const organization = await getOrganizationDetails();

    return (
        <PublicLayout>
            <ContactContent organization={organization} />
        </PublicLayout>
    );
}
