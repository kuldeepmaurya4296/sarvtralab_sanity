'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, FileText, Plus, Link as LinkIcon, Globe, File, CheckCircle2, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

    const [source, setSource] = useState<'device' | 'link'>('device');
    const [title, setTitle] = useState('');
    const [materialType, setMaterialType] = useState('pdf');
    const [url, setUrl] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            getTeacherCoursesData(teacherId).then(setCourses);
        }
    }, [open, teacherId]);

    const handleToggleCourse = (courseTitle: string) => {
        setSelectedCourses(prev =>
            prev.includes(courseTitle)
                ? prev.filter(c => c !== courseTitle)
                : [...prev, courseTitle]
        );
    };

    const handleSelectAll = () => {
        if (selectedCourses.length === courses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(courses.map(c => c.title));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || selectedCourses.length === 0) {
            toast.error("Please provide a title and select at least one course");
            return;
        }

        if (source === 'link' && !url) {
            toast.error("Please provide a link URL");
            return;
        }

        setIsUploading(true);
        try {
            await createMaterial({
                customId: `mat-${Date.now()}`,
                title,
                courses: selectedCourses,
                course: selectedCourses[0], // For legacy support
                materialType,
                source,
                url: source === 'link' ? url : 'https://storage.example.com/simulated-upload.pdf',
                size: source === 'device' ? `${(Math.random() * 5 + 1).toFixed(1)} MB` : 'URL',
                uploadedAt: new Date().toISOString()
            });
            toast.success("Material added successfully");
            setOpen(false);
            resetForm();
            onComplete?.();
        } catch (error) {
            toast.error("Failed to add material");
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setMaterialType('pdf');
        setSource('device');
        setUrl('');
        setSelectedCourses([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Upload Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Add Teaching Material</DialogTitle>
                    <DialogDescription>
                        Distribute resources to one or more of your assigned courses.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <Tabs value={source} onValueChange={(v: any) => setSource(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="device" className="gap-2">
                                <Upload className="h-4 w-4" /> From Device
                            </TabsTrigger>
                            <TabsTrigger value="link" className="gap-2">
                                <LinkIcon className="h-4 w-4" /> External Link
                            </TabsTrigger>
                        </TabsList>

                        <div className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title / Name</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Intro to Robotics - Lecture 1"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Content Type</Label>
                                    <Select value={materialType} onValueChange={setMaterialType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF Document</SelectItem>
                                            <SelectItem value="video">Video Lesson</SelectItem>
                                            <SelectItem value="doc">Word/Doc</SelectItem>
                                            <SelectItem value="ppt">PowerPoint</SelectItem>
                                            <SelectItem value="zip">Zip Package</SelectItem>
                                            <SelectItem value="link">Web Resource</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {source === 'link' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="url">Resource URL</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                                {source === 'device' && (
                                    <div className="space-y-2">
                                        <Label>Select File</Label>
                                        <div className="h-10 border rounded-md px-3 flex items-center gap-2 bg-muted/20 cursor-pointer overflow-hidden text-xs text-muted-foreground group hover:border-primary transition-colors">
                                            <File className="h-4 w-4" />
                                            <span>Click to browse...</span>
                                            <Input type="file" className="hidden" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Tabs>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Assign to Courses</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] uppercase font-bold tracking-wider"
                                onClick={handleSelectAll}
                            >
                                {selectedCourses.length === courses.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="border rounded-md p-3 max-h-[140px] overflow-y-auto space-y-2 bg-muted/10">
                            {courses.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">No courses available</p>
                            ) : (
                                courses.map((course) => (
                                    <div key={course.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`course-${course.id}`}
                                            checked={selectedCourses.includes(course.title)}
                                            onCheckedChange={() => handleToggleCourse(course.title)}
                                        />
                                        <label
                                            htmlFor={`course-${course.id}`}
                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 py-0.5"
                                        >
                                            {course.title}
                                            <span className="text-[10px] text-muted-foreground ml-2">({course.grade})</span>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {selectedCourses.length} course(s) selected
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full gap-2 h-11" disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Syncing with Database...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Confirm and Distribute</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
