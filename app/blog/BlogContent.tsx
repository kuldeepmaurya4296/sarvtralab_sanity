
'use client';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function BlogContent({ posts }: { posts: any[] }) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'superadmin' || session?.user?.role === 'admin';
    const displayPosts = posts && posts.length > 0 ? posts : [];

    // Pagination logic
    const POSTS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(displayPosts.length / POSTS_PER_PAGE) || 1;

    // Get current posts
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const currentPosts = displayPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <section className="pt-32 pb-16 bg-muted/50">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex justify-center"
                    >
                        <Button asChild className="rounded-full shadow-lg gap-2 font-semibold">
                            <Link href="/blog/create">
                                <Plus className="w-5 h-5" />
                                Create New Blog
                            </Link>
                        </Button>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Insights & Updates
                    </motion.h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Latest news, trends in robotics education, and updates from Sarvtra Labs.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentPosts.map((post, index) => (
                            <motion.div
                                key={post.id || post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
                            >
                                <div className="h-48 bg-muted relative overflow-hidden shrink-0">
                                    {post.image ? (
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                            {post.category || 'STEM'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1" suppressHydrationWarning>
                                                <Calendar className="w-3 h-3" /> {new Date(post.date || post._createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> {post.author || 'Sarvtra Labs'}
                                            </span>
                                        </div>
                                        {post.readTime && <span className="font-medium">{post.readTime} min read</span>}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto gap-1 text-primary mt-auto self-start" asChild>
                                        <Link href={`/blog/${post.slug?.current || post._id}`}>
                                            Read Article <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                        {displayPosts.length === 0 && (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                No blog posts found.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t pt-8 gap-4">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to <span className="font-semibold text-foreground">{Math.min(startIndex + POSTS_PER_PAGE, displayPosts.length)}</span> of <span className="font-semibold text-foreground">{displayPosts.length}</span> posts
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </Button>
                                <span className="text-sm font-medium mx-2 border px-4 py-2 rounded-md bg-muted">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
