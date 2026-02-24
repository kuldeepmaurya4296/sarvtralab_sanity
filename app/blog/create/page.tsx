'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDoc, uploadAssetToSanity } from '@/lib/actions/cms.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';
import Link from 'next/link';

export default function CreateBlogPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [editingBlog, setEditingBlog] = useState({
        title: '',
        slug: { current: '' },
        excerpt: '',
        content: '',
        date: new Date().toISOString(),
        author: '',
        image: '',
        category: 'General',
        readTime: 5,
        order: 0
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadAssetToSanity(formData);
            if (res.success && res.url) {
                setEditingBlog({ ...editingBlog, image: res.url });
                toast.success("Media uploaded successfully");
            } else {
                toast.error(res.error || "Failed to upload media");
            }
        } catch (err) {
            toast.error("Error uploading media");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!editingBlog.title || !editingBlog.slug?.current || !editingBlog.author) {
            toast.error("Title, Author name, and Slug are required.");
            return;
        }

        setIsSaving(true);
        const payload = { ...editingBlog };

        try {
            const res = await createDoc('blogPost', payload);

            if (res.success) {
                toast.success("Blog published successfully!");
                router.push('/blog');
            } else {
                toast.error(res.error || "Failed to publish blog");
            }
        } catch (e) {
            toast.error("Error publishing blog");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20 pt-32">
            <div className="max-w-5xl mx-auto space-y-6 px-4">
                <Card className="rounded-xl border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 border-b rounded-t-xl">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/blog">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <CardTitle className="text-2xl font-bold">Write a New Blog Post</CardTitle>
                            <CardDescription>Share your insights and stories with the community.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Post Title</Label>
                                    <Input
                                        value={editingBlog.title}
                                        onChange={(e) => {
                                            const title = e.target.value;
                                            const slugObj = { current: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') };
                                            setEditingBlog({ ...editingBlog, title, slug: slugObj });
                                        }}
                                        className="text-lg font-semibold h-12"
                                        placeholder="The Future of Robotics in Education"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL Slug</Label>
                                    <Input
                                        value={editingBlog.slug.current}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: { current: e.target.value } })}
                                        className="bg-muted/30"
                                        placeholder="future-of-robotics"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Excerpt (Short Summary)</Label>
                                    <Input
                                        value={editingBlog.excerpt}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                                        placeholder="Briefly describe what this post is about..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</Label>
                                    <TiptapEditor
                                        value={editingBlog.content}
                                        onChange={(html) => setEditingBlog({ ...editingBlog, content: html })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name (Author)</Label>
                                    <Input
                                        value={editingBlog.author}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                                    <Input
                                        value={editingBlog.category}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                                        placeholder="e.g. Education, Technology"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Image</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={editingBlog.image}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                            className="flex-1 text-sm"
                                            placeholder="https://..."
                                        />
                                        <div className="relative overflow-hidden w-12 flex-shrink-0 border bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors rounded-md">
                                            {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                disabled={isUploadingImage}
                                                title="Upload Image"
                                            />
                                        </div>
                                    </div>
                                    {editingBlog.image && (
                                        <div className="mt-2 aspect-video rounded-md bg-muted border relative overflow-hidden flex items-center justify-center">
                                            <img src={editingBlog.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Read Time (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={editingBlog.readTime}
                                        onChange={(e) => setEditingBlog({ ...editingBlog, readTime: parseInt(e.target.value) })}
                                        min={1}
                                    />
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <Button
                                        className="w-full h-12 font-bold rounded-xl"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Publish Post
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-4">
                                        By publishing, you agree to our content guidelines.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
