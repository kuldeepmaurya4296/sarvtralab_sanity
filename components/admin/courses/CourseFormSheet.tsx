'use client';

import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Course } from '@/types/course';
import { Plus, Trash2, GripVertical, Video, FileText, Layers, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import TiptapEditor from '../TiptapEditor';

interface CourseFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<Course> | null;
    mode: 'add' | 'edit';
    onSubmit: (data: any) => void;
}

interface MaterialItemForm {
    name: string;
    quantity: string;
}

interface MaterialCategoryForm {
    categoryName: string;
    items: MaterialItemForm[];
}

interface StepForm {
    stepNumber: number;
    title: string;
    partsNeeded: string[];
    actions: string[];
    tips: string;
    output: string;
}

interface LessonForm {
    title: string;
    duration: string;
    lessonType: 'video' | 'pdf' | 'quiz' | 'project';
    videoUrl?: string;
    lessonId?: string;
    description?: string;
    resourceUrls?: string[];
}

interface CurriculumModuleForm {
    title: string;
    duration: string;
    lessons: LessonForm[];
    moduleId?: string;
}

export function CourseFormSheet({ open, onOpenChange, initialData, mode, onSubmit }: CourseFormSheetProps) {
    const defaultForm = {
        title: '',
        description: '',
        grade: '',
        duration: '',
        sessions: 0,
        price: 0,
        category: 'foundation',
        level: 'Beginner',
        image: '/placeholder.svg',
        skillFocus: [] as string[],
        safetyRules: [] as string[],
        learningOutcomes: [] as string[],
        extensionActivities: [] as string[],
        teacherNote: '',
        materialsRequired: [] as MaterialCategoryForm[],
        steps: [] as StepForm[],
        dynamicHtml: '',
        totalHours: 0,
        curriculum: [] as CurriculumModuleForm[],
    };

    const [formData, setFormData] = useState(defaultForm);

    // Temp inputs for array fields
    const [newSkill, setNewSkill] = useState('');
    const [newSafetyRule, setNewSafetyRule] = useState('');
    const [newOutcome, setNewOutcome] = useState('');
    const [newExtActivity, setNewExtActivity] = useState('');

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    grade: initialData.grade || '',
                    duration: initialData.duration || '',
                    sessions: initialData.sessions || 0,
                    totalHours: initialData.totalHours || 0,
                    price: initialData.price || 0,
                    category: initialData.category || 'foundation',
                    level: initialData.level || 'Beginner',
                    image: initialData.image || '/placeholder.svg',
                    skillFocus: initialData.skillFocus || [],
                    safetyRules: initialData.safetyRules || [],
                    learningOutcomes: initialData.learningOutcomes || [],
                    extensionActivities: initialData.extensionActivities || [],
                    teacherNote: initialData.teacherNote || '',
                    materialsRequired: (initialData.materialsRequired || []).map(mc => ({
                        categoryName: mc.categoryName || '',
                        items: (mc.items || []).map(i => ({ name: i.name || '', quantity: i.quantity || '' }))
                    })),
                    steps: (initialData.steps || []).map(s => ({
                        stepNumber: s.stepNumber || 0,
                        title: s.title || '',
                        partsNeeded: s.partsNeeded || [],
                        actions: s.actions || [],
                        tips: s.tips || '',
                        output: s.output || '',
                    })),
                    dynamicHtml: initialData.dynamicHtml || '',
                    curriculum: (initialData.curriculum || []).map(m => ({
                        title: m.title || '',
                        duration: m.duration || '',
                        moduleId: m.moduleId || `mod-${Math.random().toString(36).substr(2, 9)}`,
                        lessons: (m.lessons || []).map((l: any) => ({
                            title: l.title || '',
                            duration: l.duration || '',
                            lessonType: l.lessonType || 'video',
                            videoUrl: l.videoUrl || '',
                            lessonId: l.lessonId || `les-${Math.random().toString(36).substr(2, 9)}`,
                            description: l.description || '',
                            resourceUrls: l.resourceUrls || [],
                        }))
                    })),
                });
            } else {
                setFormData(defaultForm);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, initialData]);

    const handleSubmit = () => {
        onSubmit(formData);
        onOpenChange(false);
    };

    // --- Helper: Array field add/remove ---
    const addToArray = (field: 'skillFocus' | 'safetyRules' | 'learningOutcomes' | 'extensionActivities', value: string) => {
        if (!value.trim()) return;
        setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    };

    const removeFromArray = (field: 'skillFocus' | 'safetyRules' | 'learningOutcomes' | 'extensionActivities', index: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    // --- Curriculum Helpers ---
    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            curriculum: [...prev.curriculum, { 
                title: '', 
                duration: '', 
                lessons: [], 
                moduleId: `mod-${Date.now()}` 
            }]
        }));
    };

    const removeModule = (mIdx: number) => {
        setFormData(prev => ({
            ...prev,
            curriculum: prev.curriculum.filter((_, i) => i !== mIdx)
        }));
    };

    const updateModule = (mIdx: number, field: keyof CurriculumModuleForm, value: any) => {
        setFormData(prev => {
            const newCurriculum = [...prev.curriculum];
            newCurriculum[mIdx] = { ...newCurriculum[mIdx], [field]: value };
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const addLesson = (mIdx: number) => {
        setFormData(prev => {
            const newCurriculum = [...prev.curriculum];
            newCurriculum[mIdx] = {
                ...newCurriculum[mIdx],
                lessons: [
                    ...newCurriculum[mIdx].lessons,
                    { 
                        title: '', 
                        duration: '', 
                        lessonType: 'video', 
                        videoUrl: '', 
                        lessonId: `les-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        description: '',
                        resourceUrls: []
                    }
                ]
            };
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const removeLesson = (mIdx: number, lIdx: number) => {
        setFormData(prev => {
            const newCurriculum = [...prev.curriculum];
            const newLessons = [...newCurriculum[mIdx].lessons.filter((_, i) => i !== lIdx)];
            newCurriculum[mIdx] = { ...newCurriculum[mIdx], lessons: newLessons };
            return { ...prev, curriculum: newCurriculum };
        });
    };

    const updateLesson = (mIdx: number, lIdx: number, field: keyof LessonForm, value: any) => {
        setFormData(prev => {
            const newCurriculum = [...prev.curriculum];
            const newLessons = [...newCurriculum[mIdx].lessons];
            newLessons[lIdx] = { ...newLessons[lIdx], [field]: value };
            newCurriculum[mIdx] = { ...newCurriculum[mIdx], lessons: newLessons };
            return { ...prev, curriculum: newCurriculum };
        });
    };

    // --- Material Category helpers ---
    const addMaterialCategory = () => {
        setFormData(prev => ({
            ...prev,
            materialsRequired: [...prev.materialsRequired, { categoryName: '', items: [{ name: '', quantity: '' }] }]
        }));
    };
    const removeMaterialCategory = (idx: number) => {
        setFormData(prev => ({ ...prev, materialsRequired: prev.materialsRequired.filter((_, i) => i !== idx) }));
    };
    const updateMaterialCategory = (idx: number, key: string, value: any) => {
        setFormData(prev => {
            const updated = [...prev.materialsRequired];
            (updated[idx] as any)[key] = value;
            return { ...prev, materialsRequired: updated };
        });
    };
    const addMaterialItem = (catIdx: number) => {
        setFormData(prev => {
            const updated = [...prev.materialsRequired];
            updated[catIdx].items.push({ name: '', quantity: '' });
            return { ...prev, materialsRequired: updated };
        });
    };
    const removeMaterialItem = (catIdx: number, itemIdx: number) => {
        setFormData(prev => {
            const updated = [...prev.materialsRequired];
            updated[catIdx].items = updated[catIdx].items.filter((_, i) => i !== itemIdx);
            return { ...prev, materialsRequired: updated };
        });
    };
    const updateMaterialItem = (catIdx: number, itemIdx: number, key: string, value: string) => {
        setFormData(prev => {
            const updated = [...prev.materialsRequired];
            (updated[catIdx].items[itemIdx] as any)[key] = value;
            return { ...prev, materialsRequired: updated };
        });
    };

    // --- Step helpers ---
    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { stepNumber: prev.steps.length + 1, title: '', partsNeeded: [], actions: [''], tips: '', output: '' }]
        }));
    };
    const removeStep = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }))
        }));
    };
    const updateStep = (idx: number, key: string, value: any) => {
        setFormData(prev => {
            const updated = [...prev.steps];
            (updated[idx] as any)[key] = value;
            return { ...prev, steps: updated };
        });
    };
    const addStepAction = (stepIdx: number) => {
        setFormData(prev => {
            const updated = [...prev.steps];
            updated[stepIdx].actions.push('');
            return { ...prev, steps: updated };
        });
    };
    const removeStepAction = (stepIdx: number, actionIdx: number) => {
        setFormData(prev => {
            const updated = [...prev.steps];
            updated[stepIdx].actions = updated[stepIdx].actions.filter((_, i) => i !== actionIdx);
            return { ...prev, steps: updated };
        });
    };
    const updateStepAction = (stepIdx: number, actionIdx: number, value: string) => {
        setFormData(prev => {
            const updated = [...prev.steps];
            updated[stepIdx].actions[actionIdx] = value;
            return { ...prev, steps: updated };
        });
    };
    const addStepPart = (stepIdx: number, value: string) => {
        if (!value.trim()) return;
        setFormData(prev => {
            const updated = [...prev.steps];
            updated[stepIdx].partsNeeded.push(value.trim());
            return { ...prev, steps: updated };
        });
    };
    const removeStepPart = (stepIdx: number, partIdx: number) => {
        setFormData(prev => {
            const updated = [...prev.steps];
            updated[stepIdx].partsNeeded = updated[stepIdx].partsNeeded.filter((_, i) => i !== partIdx);
            return { ...prev, steps: updated };
        });
    };

    // Reusable chip-list input helper
    const renderChipInput = (
        label: string,
        items: string[],
        field: 'skillFocus' | 'safetyRules' | 'learningOutcomes' | 'extensionActivities',
        tempValue: string,
        setTempValue: (v: string) => void,
        placeholder: string
    ) => (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addToArray(field, tempValue);
                            setTempValue('');
                        }
                    }}
                />
                <Button type="button" size="sm" variant="outline" onClick={() => { addToArray(field, tempValue); setTempValue(''); }}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {items.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {item}
                        <button type="button" onClick={() => removeFromArray(field, idx)} className="hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full h-full sm:max-w-none p-0 flex flex-col border-none">
                <SheetHeader className="p-6 border-b">
                    <div className="container mx-auto max-w-5xl">
                        <SheetTitle className="text-2xl">{mode === 'add' ? 'Create New Course' : 'Edit Course Details'}</SheetTitle>
                        {mode === 'add' && (
                            <SheetDescription>Design a new learning track with step-by-step content.</SheetDescription>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="container mx-auto max-w-5xl p-6 space-y-8">
                        <Accordion type="multiple" defaultValue={['basic', 'content']} className="space-y-2">
                            {/* Basic Info */}
                            <AccordionItem value="basic" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">📋 Basic Information</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Course Title</Label>
                                        <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="grade">Target Grade</Label>
                                            <Input id="grade" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g. Class 4-6" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration</Label>
                                            <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 3 Months" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sessions">No. of Sessions</Label>
                                            <Input id="sessions" type="number" value={formData.sessions} onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="totalHours">Total Hours</Label>
                                            <Input id="totalHours" type="number" value={formData.totalHours} onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (₹)</Label>
                                            <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="foundation">Foundation</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Difficulty Level</Label>
                                            <Select value={formData.level} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="image">Course Image URL</Label>
                                        <Input 
                                            id="image" 
                                            value={formData.image} 
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                                            placeholder="https://images.unsplash.com/..." 
                                        />
                                        <p className="text-[10px] text-muted-foreground">URL for the course thumbnail/cover image.</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Content & Skills */}
                            <AccordionItem value="content" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">🎯 Skills & Outcomes</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    {renderChipInput('Skill Focus', formData.skillFocus, 'skillFocus', newSkill, setNewSkill, 'e.g. Creativity')}
                                    {renderChipInput('Learning Outcomes', formData.learningOutcomes, 'learningOutcomes', newOutcome, setNewOutcome, 'e.g. Understand open & closed circuits')}
                                    {renderChipInput('Extension Activities', formData.extensionActivities, 'extensionActivities', newExtActivity, setNewExtActivity, 'e.g. Use 2 LEDs in parallel')}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Safety Rules */}
                            <AccordionItem value="safety" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">🛡️ Safety Rules</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    {renderChipInput('Safety Rules', formData.safetyRules, 'safetyRules', newSafetyRule, setNewSafetyRule, 'e.g. Do not short the battery directly')}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Materials */}
                            <AccordionItem value="materials" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">📦 Materials Required</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    {formData.materialsRequired.map((cat, catIdx) => (
                                        <div key={catIdx} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={cat.categoryName}
                                                    onChange={e => updateMaterialCategory(catIdx, 'categoryName', e.target.value)}
                                                    placeholder="Category name (e.g. Electronics)"
                                                    className="font-semibold"
                                                />
                                                <Button type="button" size="icon" variant="ghost" onClick={() => removeMaterialCategory(catIdx)} className="text-destructive hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            {cat.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-center gap-2 pl-4">
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={item.name}
                                                        onChange={e => updateMaterialItem(catIdx, itemIdx, 'name', e.target.value)}
                                                        placeholder="Item name"
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        value={item.quantity}
                                                        onChange={e => updateMaterialItem(catIdx, itemIdx, 'quantity', e.target.value)}
                                                        placeholder="Qty"
                                                        className="w-20"
                                                    />
                                                    <Button type="button" size="icon" variant="ghost" onClick={() => removeMaterialItem(catIdx, itemIdx)} className="text-destructive hover:text-destructive h-8 w-8">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button type="button" size="sm" variant="outline" onClick={() => addMaterialItem(catIdx)} className="ml-4">
                                                <Plus className="w-3 h-3 mr-1" /> Add Item
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addMaterialCategory} className="w-full">
                                        <Plus className="w-4 h-4 mr-2" /> Add Material Category
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Steps */}
                            <AccordionItem value="steps" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">🔧 Step-by-Step Instructions</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    {formData.steps.map((step, stepIdx) => (
                                        <div key={stepIdx} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-primary">Step {step.stepNumber}</span>
                                                <Button type="button" size="icon" variant="ghost" onClick={() => removeStep(stepIdx)} className="text-destructive hover:text-destructive h-7 w-7">
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <Input
                                                value={step.title}
                                                onChange={e => updateStep(stepIdx, 'title', e.target.value)}
                                                placeholder="Step title (e.g. Prepare the Card Base)"
                                            />
                                            {/* Parts needed */}
                                            <div className="space-y-1">
                                                <Label className="text-xs">Parts Needed</Label>
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {step.partsNeeded.map((part, pIdx) => (
                                                        <span key={pIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">
                                                            {part}
                                                            <button type="button" onClick={() => removeStepPart(stepIdx, pIdx)}>
                                                                <Trash2 className="w-2.5 h-2.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Type part & press Enter"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addStepPart(stepIdx, (e.target as HTMLInputElement).value);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            {/* Actions */}
                                            <div className="space-y-1">
                                                <Label className="text-xs">Actions</Label>
                                                {step.actions.map((action, aIdx) => (
                                                    <div key={aIdx} className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground w-5">{aIdx + 1}.</span>
                                                        <Input
                                                            value={action}
                                                            onChange={e => updateStepAction(stepIdx, aIdx, e.target.value)}
                                                            placeholder="Describe the action"
                                                            className="h-8 text-sm flex-1"
                                                        />
                                                        <Button type="button" size="icon" variant="ghost" onClick={() => removeStepAction(stepIdx, aIdx)} className="h-6 w-6 text-destructive">
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" size="sm" variant="ghost" onClick={() => addStepAction(stepIdx)} className="text-xs h-7">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Action
                                                </Button>
                                            </div>
                                            <Input
                                                value={step.tips}
                                                onChange={e => updateStep(stepIdx, 'tips', e.target.value)}
                                                placeholder="💡 Tip (optional)"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                value={step.output}
                                                onChange={e => updateStep(stepIdx, 'output', e.target.value)}
                                                placeholder="✔ Expected output (e.g. Card base ready)"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addStep} className="w-full">
                                        <Plus className="w-4 h-4 mr-2" /> Add Step
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Curriculum */}
                             <AccordionItem value="curriculum" className="border rounded-lg px-4">
                                 <AccordionTrigger className="font-semibold text-sm">📚 Course Curriculum</AccordionTrigger>
                                 <AccordionContent className="space-y-4 pt-2">
                                     {formData.curriculum.map((module, mIdx) => (
                                         <div key={mIdx} className="border rounded-lg p-4 space-y-4 bg-muted/20">
                                             <div className="flex items-center justify-between gap-4">
                                                 <div className="flex-1 space-y-2">
                                                     <div className="flex items-center justify-between">
                                                         <Label className="text-xs font-bold text-primary capitalize">Module {mIdx + 1}</Label>
                                                         <Button type="button" size="icon" variant="ghost" onClick={() => removeModule(mIdx)} className="text-destructive h-7 w-7">
                                                             <Trash2 className="w-4 h-4" />
                                                         </Button>
                                                     </div>
                                                     <Input
                                                         value={module.title}
                                                         onChange={e => updateModule(mIdx, 'title', e.target.value)}
                                                         placeholder="Module title (e.g. Introduction to Robotics)"
                                                         className="font-semibold"
                                                     />
                                                     <Input
                                                         value={module.duration}
                                                         onChange={e => updateModule(mIdx, 'duration', e.target.value)}
                                                         placeholder="Module duration (e.g. 2 Weeks)"
                                                         className="h-8 text-xs"
                                                     />
                                                 </div>
                                             </div>
 
                                             <div className="space-y-3 pl-4 border-l-2 border-primary/10">
                                                 <Label className="text-xs font-semibold">Lessons</Label>
                                                 {module.lessons.map((lesson, lIdx) => (
                                                     <div key={lIdx} className="space-y-2 p-3 bg-muted/40 rounded-md border border-border/50 shadow-sm">
                                                         <div className="flex items-center justify-between">
                                                             <div className="flex items-center gap-2">
                                                                 <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                     {lIdx + 1}
                                                                 </div>
                                                                 <span className="text-xs font-medium">Lesson Details</span>
                                                             </div>
                                                             <Button type="button" size="icon" variant="ghost" onClick={() => removeLesson(mIdx, lIdx)} className="text-destructive h-6 w-6">
                                                                 <Trash2 className="w-3 h-3" />
                                                             </Button>
                                                         </div>
                                                         
                                                         <Input
                                                             value={lesson.title}
                                                             onChange={e => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                                             placeholder="Lesson title"
                                                             className="h-8 text-sm"
                                                         />
                                                         
                                                         <div className="grid grid-cols-2 gap-2">
                                                             <Select value={lesson.lessonType} onValueChange={val => updateLesson(mIdx, lIdx, 'lessonType', val as any)}>
                                                                 <SelectTrigger className="h-8 text-xs">
                                                                     <SelectValue placeholder="Type" />
                                                                 </SelectTrigger>
                                                                 <SelectContent>
                                                                     <SelectItem value="video">🎥 Video Content</SelectItem>
                                                                     <SelectItem value="pdf">📄 PDF Document</SelectItem>
                                                                     <SelectItem value="quiz">📝 Quiz</SelectItem>
                                                                     <SelectItem value="project">🛠️ Project</SelectItem>
                                                                 </SelectContent>
                                                             </Select>
                                                             <Input
                                                                 value={lesson.duration}
                                                                 onChange={e => updateLesson(mIdx, lIdx, 'duration', e.target.value)}
                                                                 placeholder="Duration (e.g. 15m)"
                                                                 className="h-8 text-xs"
                                                             />
                                                         </div>
                                                         
                                                         {lesson.lessonType === 'video' && (
                                                             <Input
                                                                 value={lesson.videoUrl}
                                                                 onChange={e => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                                                 placeholder="Video URL (Vimeo/Tutor Player)"
                                                                 className="h-8 text-xs"
                                                             />
                                                         )}

                                                         {/* Lesson Content / Description */}
                                                         <div className="space-y-2">
                                                             <Label className="text-[10px] font-bold uppercase text-muted-foreground">Lesson Content</Label>
                                                             <TiptapEditor 
                                                                 value={lesson.description || ''} 
                                                                 onChange={(html: string) => updateLesson(mIdx, lIdx, 'description', html)} 
                                                             />
                                                         </div>

                                                         {/* Lesson Resources */}
                                                         <div className="space-y-2">
                                                             <Label className="text-[10px] font-bold uppercase text-muted-foreground">Resource Links</Label>
                                                             <div className="space-y-2">
                                                                 {(lesson.resourceUrls || []).map((url, urlIdx) => (
                                                                     <div key={urlIdx} className="flex gap-2">
                                                                         <Input 
                                                                             value={url} 
                                                                             onChange={e => {
                                                                                 const newUrls = [...(lesson.resourceUrls || [])];
                                                                                 newUrls[urlIdx] = e.target.value;
                                                                                 updateLesson(mIdx, lIdx, 'resourceUrls', newUrls);
                                                                             }}
                                                                             placeholder="https://..."
                                                                             className="h-8 text-xs flex-1"
                                                                         />
                                                                         <Button 
                                                                             type="button" 
                                                                             size="icon" 
                                                                             variant="ghost" 
                                                                             onClick={() => {
                                                                                 const newUrls = (lesson.resourceUrls || []).filter((_, i) => i !== urlIdx);
                                                                                 updateLesson(mIdx, lIdx, 'resourceUrls', newUrls);
                                                                             }}
                                                                             className="h-8 w-8 text-destructive"
                                                                         >
                                                                             <Trash2 className="w-3 h-3" />
                                                                         </Button>
                                                                     </div>
                                                                 ))}
                                                                 <Button 
                                                                     type="button" 
                                                                     variant="outline" 
                                                                     size="sm" 
                                                                     onClick={() => {
                                                                         const newUrls = [...(lesson.resourceUrls || []), ''];
                                                                         updateLesson(mIdx, lIdx, 'resourceUrls', newUrls);
                                                                     }}
                                                                     className="w-full h-8 text-xs border-dashed"
                                                                 >
                                                                     <Plus className="w-3 h-3 mr-1" /> Add Resource Link
                                                                 </Button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))}
                                                 <Button type="button" size="sm" variant="ghost" onClick={() => addLesson(mIdx)} className="w-full text-xs h-8 border border-dashed border-primary/20 hover:bg-primary/5 text-primary">
                                                     <Plus className="w-3 h-3 mr-1" /> Add Lesson
                                                 </Button>
                                             </div>
                                         </div>
                                     ))}
                                     <Button type="button" variant="outline" onClick={addModule} className="w-full border-primary/30 text-primary hover:bg-primary/5">
                                         <Plus className="w-4 h-4 mr-2" /> Add Curriculum Module
                                     </Button>
                                 </AccordionContent>
                             </AccordionItem>

                            {/* Dynamic Content (Tiptap) */}
                            <AccordionItem value="dynamic" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">✨ Dynamic Rich Content</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <TiptapEditor 
                                        value={formData.dynamicHtml} 
                                        onChange={(html: string) => setFormData({ ...formData, dynamicHtml: html })} 
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Use this editor to add images, videos, and complex text formatting.
                                     </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Teacher Note */}
                            <AccordionItem value="teacher" className="border rounded-lg px-4">
                                <AccordionTrigger className="font-semibold text-sm">📝 Teacher Note</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <Textarea
                                        value={formData.teacherNote}
                                        onChange={e => setFormData({ ...formData, teacherNote: e.target.value })}
                                        placeholder="Notes and guidance for teachers (e.g. This activity aligns with NEP 2020...)"
                                        rows={4}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-background">
                    <div className="container mx-auto max-w-5xl flex gap-4">
                        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="flex-[2]">{mode === 'add' ? 'Create Course' : 'Save Changes'}</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
