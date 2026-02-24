'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { createDoc, updateDoc, deleteDoc, uploadAssetToSanity } from '@/lib/actions/cms.actions';
import { getBlogPosts, getBlogPostBySlug } from '@/lib/actions/content.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Upload } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';

export default function BlogManagerPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const data = await getBlogPosts();
            setBlogs(data || []);
        } catch (error) {
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingBlog({
            title: '',
            slug: { current: '' },
            excerpt: '',
            content: '',
            date: new Date().toISOString(),
            author: 'Admin',
            image: '',
            category: 'General',
            readTime: 5,
            order: 0
        });
        setView('edit');
    };

    const handleEdit = (blog: any) => {
        setEditingBlog({
            ...blog,
            slug: blog.slug || { current: '' }
        });
        setView('edit');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            const res = await deleteDoc(id);
            if (res.success) {
                toast.success("Blog deleted successfully");
                fetchBlogs();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (e) {
            toast.error("Error deleting blog");
        }
    };

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
        if (!editingBlog.title || !editingBlog.slug?.current) {
            toast.error("Title and Slug are required.");
            return;
        }

        setIsSaving(true);
        const payload = { ...editingBlog };

        // Remove Sanity internal fields before updating if they exist
        const id = payload._id;
        delete payload._id;
        delete payload._createdAt;
        delete payload._updatedAt;
        delete payload._rev;
        delete payload._type;

        try {
            let res;
            if (id) {
                res = await updateDoc(id, payload);
            } else {
                res = await createDoc('blogPost', payload);
            }

            if (res.success) {
                toast.success("Blog saved successfully");
                setView('list');
                fetchBlogs();
            } else {
                toast.error(res.error || "Failed to save blog");
            }
        } catch (e) {
            toast.error("Error saving blog");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="superadmin" userName="Admin" userEmail="admin@sarvtra.com">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="superadmin" userName="Admin" userEmail="admin@sarvtra.com">
            <div className="max-w-7xl mx-auto space-y-6">

                {view === 'list' && (
                    <Card className="rounded-none border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Blog Management</CardTitle>
                                <CardDescription>Create and manage articles for the public blog.</CardDescription>
                            </div>
                            <Button onClick={handleCreateNew} className="rounded-none">
                                <Plus className="w-4 h-4 mr-2" /> New Post
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blogs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No blog posts found. Create your first post!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {blogs.map((blog) => (
                                        <TableRow key={blog._id}>
                                            <TableCell className="font-medium">{blog.title}</TableCell>
                                            <TableCell>{blog.category}</TableCell>
                                            <TableCell>{new Date(blog.date || blog._createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{blog.author}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(blog._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {view === 'edit' && editingBlog && (
                    <Card className="rounded-none border-border">
                        <CardHeader className="flex flex-row items-center gap-4 bg-muted/20 border-b">
                            <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <CardTitle className="text-xl font-bold">{editingBlog._id ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
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
                                                // Auto-generate slug if it's a new post or slug is empty
                                                const slugObj = !editingBlog._id || !editingBlog.slug?.current
                                                    ? { current: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }
                                                    : editingBlog.slug;
                                                setEditingBlog({ ...editingBlog, title, slug: slugObj });
                                            }}
                                            className="text-lg font-semibold rounded-none h-12"
                                            placeholder="The Future of Robotics in Education"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL Slug</Label>
                                        <Input
                                            value={editingBlog.slug?.current || ''}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, slug: { current: e.target.value } })}
                                            className="rounded-none bg-muted/30"
                                            placeholder="future-of-robotics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Excerpt (Short Summary)</Label>
                                        <Input
                                            value={editingBlog.excerpt}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                                            className="rounded-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</Label>
                                        <TiptapEditor
                                            value={editingBlog.content || ''}
                                            onChange={(html) => setEditingBlog({ ...editingBlog, content: html })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Author Name</Label>
                                        <Input
                                            value={editingBlog.author || ''}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                                            className="rounded-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                                        <Input
                                            value={editingBlog.category || ''}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                                            className="rounded-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Featured Image/Video URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingBlog.image || ''}
                                                onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                                                className="rounded-none flex-1"
                                                placeholder="https://..."
                                            />
                                            <div className="relative overflow-hidden w-12 flex-shrink-0 border bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                                                {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleImageUpload}
                                                    accept="image/*,video/*"
                                                    disabled={isUploadingImage}
                                                    title="Upload Media"
                                                />
                                            </div>
                                        </div>
                                        {editingBlog.image && (
                                            <div className="mt-2 aspect-video bg-muted border relative overflow-hidden flex items-center justify-center">
                                                {editingBlog.image.match(/\.(mp4|webm|ogg)$/i) ? (
                                                    <video src={editingBlog.image} controls className="w-full h-full object-contain bg-black" />
                                                ) : (
                                                    <img src={editingBlog.image} alt="Preview" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Read Time (minutes)</Label>
                                        <Input
                                            type="number"
                                            value={editingBlog.readTime || 5}
                                            onChange={(e) => setEditingBlog({ ...editingBlog, readTime: parseInt(e.target.value) })}
                                            className="rounded-none"
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <Button
                                            className="w-full rounded-none h-12 font-bold"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            {editingBlog._id ? 'Update Post' : 'Publish Post'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </DashboardLayout>
    );
}

