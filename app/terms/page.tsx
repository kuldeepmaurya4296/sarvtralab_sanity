import PublicLayout from '@/components/layout/PublicLayout';
import { getLegalDocBySlug } from '@/lib/actions/content.actions';

export default async function TermsPage() {
    const doc = await getLegalDocBySlug('terms');

    if (!doc) {
        return (
            <PublicLayout>
                <div className="container mx-auto px-4 py-32 text-center">
                    <h1 className="text-4xl font-bold mb-8 text-muted-foreground uppercase tracking-widest opacity-20">Legal Content Unavailable</h1>
                    <p>The terms of service are currently being updated. Please check back later.</p>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black mb-12 uppercase tracking-tighter border-b-4 border-primary pb-4 inline-block">
                    {doc.title}
                </h1>
                <div className="prose dark:prose-invert max-w-none space-y-12 text-foreground">
                    {(doc.sections || []).map((section: any, idx: number) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-primary">
                                {section.heading}
                            </h2>
                            {section.subheading && (
                                <h3 className="text-lg font-semibold text-muted-foreground italic">
                                    {section.subheading}
                                </h3>
                            )}
                            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {section.paragraph}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}

