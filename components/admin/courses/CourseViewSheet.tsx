'use client';
import { useState } from 'react';

import {
    Clock,
    FileText,
    GraduationCap,
    DollarSign,
    BarChart,
    CheckCircle2,
    Layers,
    Plus,
    Edit,
    Trash2,
    Shield,
    Package,
    BookOpen,
    Lightbulb,
    Sparkles,
    Target,
    PlayCircle,
    Video,
    ListChecks,
    HelpCircle,
    ChevronRight,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Course, MaterialCategory, CourseStep } from '@/types/course';

interface CourseViewSheetProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export function CourseViewSheet({ course, open, onOpenChange, onEdit, onDelete }: CourseViewSheetProps) {
    const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Course Details</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full">
                    <div className="pb-8">
                        {/* Hero Section */}
                        <div className="bg-muted/30 p-6 border-b">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="bg-background">{course.category}</Badge>
                                <Badge variant={course.level === 'Advanced' ? 'destructive' : course.level === 'Intermediate' ? 'default' : 'secondary'}>
                                    {course.level}
                                </Badge>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {course.description}
                            </p>

                            {/* Skill Focus */}
                            {course.skillFocus && course.skillFocus.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {course.skillFocus.map((skill: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col items-center p-3 bg-muted/10 rounded-lg border text-center">
                                    <Clock className="h-5 w-5 text-primary mb-1" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Duration</span>
                                    <span className="font-semibold text-sm">{course.duration}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-muted/10 rounded-lg border text-center">
                                    <FileText className="h-5 w-5 text-primary mb-1" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Sessions</span>
                                    <span className="font-semibold text-sm">{course.sessions}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-muted/10 rounded-lg border text-center">
                                    <GraduationCap className="h-5 w-5 text-primary mb-1" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Grade</span>
                                    <span className="font-semibold text-sm">{course.grade}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-muted/10 rounded-lg border text-center">
                                    <DollarSign className="h-5 w-5 text-primary mb-1" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Price</span>
                                    <span className="font-semibold text-sm">₹{(course.price || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Safety Rules */}
                            {course.safetyRules && course.safetyRules.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-red-500" />
                                        Safety Rules
                                    </h4>
                                    <div className="space-y-2">
                                        {course.safetyRules.map((rule: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-sm p-2 bg-red-50/50 rounded-lg border border-red-100">
                                                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                                <span>{rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Materials Required */}
                            {course.materialsRequired && course.materialsRequired.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                                            <Package className="h-4 w-4 text-blue-500" />
                                            Materials Required
                                        </h4>
                                        {course.materialsRequired.map((category: MaterialCategory, catIdx: number) => (
                                            <div key={catIdx} className="space-y-2">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{category.categoryName}</p>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {category.items?.map((item, itemIdx: number) => (
                                                        <div key={itemIdx} className="flex items-center justify-between p-2 rounded-md bg-muted/20 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                <span>{item.name}</span>
                                                            </div>
                                                            {item.quantity && (
                                                                <Badge variant="outline" className="text-[10px]">{item.quantity}</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Steps Preview */}
                            {course.steps && course.steps.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            Step-by-Step Instructions ({course.steps.length} steps)
                                        </h4>
                                        <div className="border rounded-md divide-y overflow-hidden">
                                            {course.steps.map((step: CourseStep, idx: number) => (
                                                <div key={idx} className="p-3 hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                            {step.stepNumber}
                                                        </span>
                                                        <span className="font-medium text-sm">{step.title}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground ml-8">
                                                        {step.actions?.length || 0} actions
                                                        {step.partsNeeded && step.partsNeeded.length > 0 && ` • ${step.partsNeeded.length} parts needed`}
                                                        {step.output && ` • Output: ${step.output}`}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Learning Outcomes */}
                            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                                            <Target className="h-4 w-4 text-green-500" />
                                            Learning Outcomes
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {course.learningOutcomes.map((outcome: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                                    <span>{outcome}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Extension Activities */}
                            {course.extensionActivities && course.extensionActivities.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                                            <Sparkles className="h-4 w-4 text-violet-500" />
                                            Extension Activities
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {course.extensionActivities.map((activity: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2 p-2 bg-violet-50/50 rounded-lg">
                                                    <Sparkles className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                                                    <span>{activity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Teacher Note */}
                            {course.teacherNote && (
                                <>
                                    <Separator />
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                                            <Lightbulb className="h-4 w-4 text-amber-600" />
                                            Teacher&apos;s Note
                                        </h4>
                                        <p className="text-sm text-amber-800 leading-relaxed">{course.teacherNote}</p>
                                    </div>
                                </>
                            )}

                            {/* Features */}
                            {course.features && course.features.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                                            <BarChart className="h-4 w-4 text-primary" />
                                            Course Highlights
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {course.features.map((feature: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {/* Curriculum */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                                        <Layers className="h-4 w-4 text-primary" />
                                        Curriculum Preview
                                    </h4>
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0"
                                        onClick={() => setIsSyllabusOpen(true)}
                                    >
                                        View Full Syllabus
                                    </Button>
                                </div>
                                <div className="border rounded-md divide-y overflow-hidden">
                                    {(course.curriculum && course.curriculum.length > 0) ? (
                                        course.curriculum.map((module: any, idx: number) => (
                                            <div key={module.id || idx} className="p-4 hover:bg-muted/20 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-sm">Module {idx + 1}: {module.title}</span>
                                                    <Badge variant="outline" className="text-[10px]">{module.duration}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {module.lessons.length} Lessons including practical exercises.
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center bg-muted/5 flex flex-col items-center">
                                            <Layers className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                            <p className="text-muted-foreground text-sm">No curriculum modules defined yet.</p>
                                            <Button variant="outline" size="sm" className="mt-4" onClick={() => { onOpenChange(false); onEdit(course); }}>
                                                <Plus className="h-3 w-3 mr-2" /> Add Module
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Action Footer */}
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={() => { onOpenChange(false); onEdit(course); }}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Course
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => { onOpenChange(false); onDelete(course); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
            {/* Full Syllabus Modal */}
            <Dialog open={isSyllabusOpen} onOpenChange={setIsSyllabusOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Full Course Syllabus: {course.title}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-8">
                            {(course.curriculum && course.curriculum.length > 0) ? (
                                course.curriculum.map((module: any, idx: number) => (
                                    <div key={module.id || idx} className="space-y-4">
                                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                                            <div>
                                                <h5 className="font-bold text-sm">Module {idx + 1}: {module.title}</h5>
                                                <p className="text-xs text-muted-foreground">{module.lessons?.length || 0} Lessons</p>
                                            </div>
                                            <Badge variant="secondary">{module.duration}</Badge>
                                        </div>
                                        
                                        <div className="pl-4 space-y-3">
                                            {module.lessons?.map((lesson: any, lIdx: number) => (
                                                <div key={lesson.id || lIdx} className="flex items-center gap-3 group">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-medium text-primary border border-primary/10">
                                                        {lIdx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium truncate">{lesson.title}</span>
                                                            {lesson.lessonType === 'video' && <Video className="h-3 w-3 text-muted-foreground" />}
                                                            {lesson.lessonType === 'pdf' && <FileText className="h-3 w-3 text-muted-foreground" />}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground capitalize">
                                                            <span>{lesson.lessonType || 'lesson'}</span>
                                                            <span>•</span>
                                                            <span>{lesson.duration}</span>
                                                        </div>
                                                        {lesson.description && (
                                                            <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 italic" dangerouslySetInnerHTML={{ __html: lesson.description }} />
                                                        )}
                                                        {lesson.resourceUrls && lesson.resourceUrls.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {lesson.resourceUrls.map((url: string, uIdx: number) => (
                                                                    <a key={uIdx} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                                                        Link {uIdx + 1}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    <Layers className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>No curriculum modules defined for this course yet.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t bg-muted/30 flex justify-end">
                        <Button variant="outline" onClick={() => setIsSyllabusOpen(false)}>Close Syllabus</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
}
