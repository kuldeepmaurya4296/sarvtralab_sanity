'use client';

import { useState } from 'react';
import { Plus, Loader2, BookOpen, GraduationCap, Clock, Award, Image as ImageIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createCourse } from '@/lib/actions/course.actions';

export function CourseCreationDialog({ onComplete }: { onComplete: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        grade: '',
        duration: '',
        level: 'Beginner',
        category: 'foundation',
        price: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.grade) {
            toast.error("Title and Grade are required");
            return;
        }

        setIsLoading(true);
        try {
            await createCourse(formData as any);
            toast.success("Course created successfully");
            setOpen(false);
            setFormData({
                title: '',
                description: '',
                grade: '',
                duration: '',
                level: 'Beginner',
                category: 'foundation',
                price: 0,
            });
            onComplete();
        } catch (error) {
            toast.error("Failed to create course");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Create New Course
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Launch New Course</DialogTitle>
                    <DialogDescription>
                        Fill in text details to create a new course. You can add curriculum later.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Master Robotics with Arduino"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What will students learn in this course?"
                            className="min-h-[100px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">Target Grade</Label>
                            <Input
                                id="grade"
                                placeholder="e.g. Grade 8-10"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration</Label>
                            <Input
                                id="duration"
                                placeholder="e.g. 12 Weeks"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="level">Skill Level</Label>
                            <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="foundation">Foundation</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Course Price (INR)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="0 for free"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full gap-2 h-11" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                            {isLoading ? 'Creating Course...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
