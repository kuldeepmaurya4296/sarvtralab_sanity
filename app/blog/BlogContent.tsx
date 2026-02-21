
'use client';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogContent({ posts }: { posts: any[] }) {
    const displayPosts = posts && posts.length > 0 ? posts : [];

    return (
        <>
            <section className="pt-32 pb-16 bg-muted/50">
                <div className="container mx-auto px-4 text-center">
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
                        {displayPosts.map((post, index) => (
                            <motion.div
                                key={post.id || post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                            >
                                <div className="h-48 bg-muted relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500" />
                                    {/* Placeholder for actual image */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                            {post.category || 'STEM'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {post.date || new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" /> {post.author || 'Sarvtra Labs'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto gap-1 text-primary" asChild>
                                        <Link href={`/blog/${post.id || post._id}`}>
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
                </div>
            </section>
        </>
    );
}
