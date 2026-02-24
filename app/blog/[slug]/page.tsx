import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/actions/content.actions';
import PublicLayout from '@/components/layout/PublicLayout';
import { notFound } from 'next/navigation';
import { Calendar, User, Clock, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BlogShareButtons from '../components/BlogShareButtons';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getBlogPostBySlug(resolvedParams.slug);
    console.log(post);
    if (!post) {
        return { title: 'Post Not Found | Sarvtra Labs' };
    }

    return {
        title: `${post.title} | Sarvtra Labs Blog`,
        description: post.excerpt || 'Read the latest from Sarvtra Labs.',
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.image ? [post.image] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getBlogPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedBlogPosts(post._id, 3);
    const safeContent = DOMPurify.sanitize(post.content || '', { ADD_ATTR: ['target'] });

    return (
        <PublicLayout>
            <article className="pt-24 pb-16 min-h-screen bg-background">
                {/* Hero Section */}
                <header className="container mx-auto px-4 max-w-4xl pt-12 pb-8">
                    <Link href="/blog" className="inline-flex items-center text-primary font-semibold text-sm mb-8 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            {post.category || 'Updates'}
                        </span>
                        {post.tags?.map((tag: string, i: number) => (
                            <span key={i} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6 font-display leading-[1.1]">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 border-y border-border py-4 mt-8">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                            <User className="w-4 h-4" />
                            {post.author || 'Sarvtra Labs'}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm" suppressHydrationWarning>
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date || post._createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {post.readTime && (
                            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                                <Clock className="w-4 h-4" />
                                {post.readTime} min read
                            </div>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                            <BlogShareButtons title={post.title} url={`https://sarvtra.com/blog/${resolvedParams.slug}`} />
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.image && (
                    <div className="container mx-auto px-4 max-w-5xl mb-16">
                        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-muted relative">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container mx-auto px-4 max-w-3xl">
                    <div
                        className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-p:text-foreground/80 prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl max-w-none text-foreground/90 font-sans leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: safeContent }}
                    />
                </div>

                {/* Related Posts */}
                {relatedPosts && relatedPosts.length > 0 && (
                    <div className="container mx-auto px-4 max-w-5xl mt-24 pt-16 border-t border-border">
                        <h3 className="text-2xl font-bold font-display tracking-tight mb-8">Related Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((rp: any) => (
                                <Link href={`/blog/${rp.slug?.current || rp._id}`} key={rp._id} className="group flex flex-col gap-4">
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted relative">
                                        {rp.image ? (
                                            <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-background/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {rp.category || 'Blog'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                            {rp.title}
                                        </h4>
                                        <div className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-2">
                                            <span suppressHydrationWarning>{new Date(rp.date || rp._createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span>&bull;</span>
                                            <span>{rp.readTime || 5} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </article>
        </PublicLayout>
    );
}
