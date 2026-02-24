'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createMaterial, getTeacherCoursesData } from '@/lib/actions/teacher.actions';

interface MaterialUploadDialogProps {
    teacherId: string;
    onComplete?: () => void;
}

export function MaterialUploadDialog({ teacherId, onComplete }: MaterialUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        course: '',
        type: 'PDF',
    });

    useEffect(() => {
        if (open) {
            getTeacherCoursesData(teacherId).then(setCourses);
        }
    }, [open, teacherId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.course) {
            toast.error("Please fill all fields");
            return;
        }

        setIsUploading(true);
        try {
            await createMaterial({
                ...formData,
                size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Simulating size
            });
            toast.success("Material uploaded successfully");
            setOpen(false);
            setFormData({ title: '', course: '', type: 'PDF' });
            onComplete?.();
        } catch (error) {
            toast.error("Failed to upload material");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Upload Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Teaching Material</DialogTitle>
                    <DialogDescription>
                        Add new resources for your students.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Material Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Robotics Module 1"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course">Select Course</Label>
                        <Select
                            value={formData.course}
                            onValueChange={(val) => setFormData({ ...formData, course: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.title}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">File Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PDF">PDF Document</SelectItem>
                                <SelectItem value="PPTX">PowerPoint</SelectItem>
                                <SelectItem value="DOCX">Word Document</SelectItem>
                                <SelectItem value="ZIP">Zip Archive</SelectItem>
                                <SelectItem value="VIDEO">Video Link</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full gap-2" disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {isUploading ? 'Uploading...' : 'Confirm Upload'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
