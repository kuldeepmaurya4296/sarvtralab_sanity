import {
    getOrganizationDetails,
    getFeatures,
    getShowcaseVideos,
    getFooterSections,
    getTeamMembers,
    getLegalDocs
} from '@/lib/actions/content.actions';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CMSManager from './components/CMSManager';
import { Globe } from 'lucide-react';

export default async function WebsiteCMSPage() {
    // Fetch initial data for all website content schemas
    const [org, features, videos, footerSections, teamMembers, legalDocs] = await Promise.all([
        getOrganizationDetails(),
        getFeatures(),
        getShowcaseVideos(),
        getFooterSections(),
        getTeamMembers(),
        getLegalDocs()
    ]);

    return (
        <DashboardLayout role="superadmin" userName="Super Admin" userEmail="admin@sarvtra.com">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-none border border-border/50 bg-background px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                    {/* Decorative Background */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-primary/20 bg-primary/5 text-primary mb-4 text-xs font-semibold tracking-wide uppercase">
                            <Globe className="w-4 h-4" /> Integrated Content System
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Website Manager</h1>
                        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                            Control and update public-facing static content dynamically. Changes made here apply directly to the website, bypassing traditional database interfaces for faster workflows.
                        </p>
                    </div>
                </div>

                {/* CMS Manager Form with Tabs */}
                <CMSManager
                    organization={org}
                    features={features}
                    videos={videos}
                    footerSections={footerSections}
                    teamMembers={teamMembers}
                    legalDocs={legalDocs}
                />
            </div>
        </DashboardLayout>
    );
}
