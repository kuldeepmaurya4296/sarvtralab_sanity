'use client';

import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Clock, Star, IndianRupee, Play,
    FileText, Calendar, Shield, Lightbulb, BookOpen,
    Package, CheckCircle2, Wrench, GraduationCap, Sparkles, Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Course, CurriculumModule, Lesson, MaterialCategory, CourseStep } from '@/types/course';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkEnrollmentStatus } from '@/lib/actions/student.actions';
import { toast } from 'sonner';

// Custom components for Portable Text rendering
const richContentComponents = {
    block: {
        h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h3>,
        normal: ({ children }: any) => <p className="text-base text-muted-foreground mb-4 leading-relaxed">{children}</p>,
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground bg-primary/5 py-4 pr-4 rounded-r-lg">
                {children}
            </blockquote>
        ),
    },
    list: {
        bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ul>,
        number: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ol>,
    },
};

interface CourseDetailContentProps {
    course: Course;
}

export default function CourseDetailContent({ course }: CourseDetailContentProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (user && user.role === 'student') {
                try {
                    const status = await checkEnrollmentStatus(user.id, course.id);
                    setIsEnrolled(status);
                } catch (e) {
                    console.error(e);
                }
            }
            setIsChecking(false);
        };
        checkStatus();
    }, [user, course.id]);

    return (
        <>
            {/* Breadcrumb */}
            <section className="pt-24 pb-4 bg-muted/50 border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex overflow-x-auto no-scrollbar whitespace-nowrap items-center gap-2 text-sm text-muted-foreground pb-2 md:pb-0">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{course.title}</span>
                    </nav>
                </div>
            </section>

            {/* Hero Section */}
            <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left - Course Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block
                                    ${course.category === 'foundation' ? 'bg-primary/10 text-primary' :
                                        course.category === 'intermediate' ? 'bg-orange-100 text-orange-600' :
                                            'bg-cyan-100 text-cyan-600'
                                    }`}>
                                    {course.grade} • {course.level}
                                </span>
                                {course.ageGroup && course.ageGroup.replace(/[–—-]/g, '-') !== course.grade.replace(/[–—-]/g, '-') && (
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-violet-100 text-violet-700">
                                        {course.ageGroup}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {course.title}
                            </h1>

                            <p className="text-lg text-muted-foreground mb-6">
                                {course.description}
                            </p>

                            {/* Skill Focus Tags */}
                            {course.skillFocus && course.skillFocus.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="text-sm font-semibold text-foreground mr-1">Skill Focus:</span>
                                    {course.skillFocus.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex flex-col p-3 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Duration
                                    </div>
                                    <span className="font-bold text-foreground">{course.duration || 'Flexible'}</span>
                                </div>
                                <div className="flex flex-col p-3 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Sessions
                                    </div>
                                    <span className="font-bold text-foreground">{course.sessions || 1} Sessions</span>
                                </div>
                                <div className="flex flex-col p-3 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Hours
                                    </div>
                                    <span className="font-bold text-foreground">{(course.totalHours || 0).toLocaleString()} Hours</span>
                                </div>
                                <div className="flex flex-col p-3 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                                        <Users className="w-3.5 h-3.5" />
                                        Students
                                    </div>
                                    <span className="font-bold text-foreground">{(course.studentsEnrolled || 0).toLocaleString()} Students</span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-6">
                                Instructor: <span className="font-semibold text-foreground">{typeof course.instructor === 'string' ? course.instructor : 'Sarvtra Expert'}</span>
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {(course.tags || []).map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white border rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right - Pricing Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:pl-8"
                        >
                            <div className="bg-white rounded-2xl shadow-xl border p-6 sticky top-24">
                                <div className="aspect-video bg-muted rounded-xl mb-6 overflow-hidden relative">
                                    <Image
                                        src={course.image || "/robotics-illustration.jpg"}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-4xl font-bold text-foreground">
                                        ₹{(course.price || 0).toLocaleString()}
                                    </span>
                                    {course.originalPrice && (
                                        <>
                                            <span className="text-xl text-muted-foreground line-through">
                                                ₹{course.originalPrice.toLocaleString()}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 ml-2">
                                                {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                {course.emiAvailable && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-6 border border-green-100">
                                        <IndianRupee className="w-5 h-5 text-green-600" />
                                        <div>
                                            <span className="text-green-600 font-bold block text-sm">0% EMI Available</span>
                                            <span className="text-muted-foreground text-xs">from ₹{course.emiAmount}/month for {course.emiMonths} months</span>
                                        </div>
                                    </div>
                                )}

                                {isEnrolled ? (
                                    <Link href="/student/dashboard" className="block w-full mb-3">
                                        <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        className="w-full h-12 text-lg font-bold"
                                        disabled={isChecking}
                                        onClick={() => {
                                            if (!user) {
                                                router.push(`/login?redirect=/checkout/course/${course.id || (course as any).customId || (course as any)._id}`);
                                                return;
                                            }

                                            // Only students can enroll in individual courses
                                            if (user.role !== 'student') {
                                                toast.error("Only students can purchase individual courses. Please log in with a student account.");
                                                return;
                                            }

                                            // Users who are students MUST be linked to a school
                                            if (!(user as any).schoolId) {
                                                toast.error("Please specify your school in your profile before enrolling.");
                                                router.push('/student/dashboard'); // Or direct to profile edit
                                                return;
                                            }

                                            if (!user.profileCompleted) {
                                                toast.error("Please complete your profile first!");
                                                router.push('/student/dashboard');
                                                return;
                                            }

                                            router.push(`/checkout/course/${course.id || (course as any).customId || (course as any)._id}`);
                                        }}
                                    >
                                        {isChecking ? 'Checking...' : 'Enroll Now'}
                                    </Button>
                                )}

                                {!isEnrolled && (
                                    <Button variant="outline" className="w-full mb-6 h-12 font-medium">
                                        Book Free Demo
                                    </Button>
                                )}

                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="font-medium text-foreground">{course.sessions} sessions total</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="font-medium text-foreground">Robotics Kit Included</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="font-medium text-foreground">Certification on completion</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Dynamic Portable Text Content (from Sanity Studio) */}
                            {course.richContent && course.richContent.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-card p-6 md:p-8 rounded-3xl border shadow-sm"
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        Course Overview
                                    </h2>
                                    <div className="prose prose-blue max-w-none text-foreground/80">
                                        <PortableText value={course.richContent} components={richContentComponents} />
                                    </div>
                                </motion.div>
                            )}

                            {/* Dynamic HTML Content (from Custom Admin Dashboard) */}
                            {course.dynamicHtml && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-card p-6 md:p-8 rounded-3xl border shadow-sm overflow-hidden"
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        Detailed Project Manual
                                    </h2>
                                    <div
                                        className="prose prose-blue max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-img:rounded-xl prose-img:max-w-full"
                                        dangerouslySetInnerHTML={{ __html: course.dynamicHtml }}
                                    />
                                </motion.div>
                            )}
                            {/* Safety Rules */}
                            {course.safetyRules && course.safetyRules.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-red-500" />
                                        Safety First
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.safetyRules.map((rule, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-red-900 font-medium">{rule}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Callout */}
                                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                                        <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                        <p className="text-sm text-amber-900">
                                            <strong>Pro Tip:</strong> Read all instructions before starting the build to ensure a smooth making experience.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Materials Required */}
                            {course.materialsRequired && course.materialsRequired.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Package className="w-6 h-6 text-primary" />
                                        What&apos;s in the Kit?
                                    </h2>
                                    <div className="space-y-8">
                                        {course.materialsRequired.map((category: MaterialCategory, idx) => (
                                            <div key={idx} className="space-y-4">
                                                <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <Wrench className="w-4 h-4" />
                                                    {category.categoryName}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {category.items.map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border group hover:border-primary transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                            <span className="px-2 py-1 bg-white rounded-md text-xs font-bold shadow-sm">
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step-by-Step Build Manual */}
                            {course.steps && course.steps.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        Step-by-Step Build Manual
                                    </h2>

                                    <div className="relative border-l-2 border-primary/20 ml-2 md:ml-4 space-y-12">
                                        {course.steps.map((step: CourseStep, idx) => (
                                            <div key={idx} className="relative pl-8 md:pl-10">
                                                {/* Step Number Bubble */}
                                                <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg z-10">
                                                    {step.stepNumber}
                                                </div>

                                                <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm group hover:border-primary transition-colors">
                                                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>

                                                    {/* Parts Needed Chip */}
                                                    {step.partsNeeded && step.partsNeeded.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            <span className="text-xs font-bold uppercase text-muted-foreground pt-1">Parts:</span>
                                                            {step.partsNeeded.map((part, pIdx) => (
                                                                <span key={pIdx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                                                                    {part}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Actions List */}
                                                    <ul className="space-y-3 mb-6">
                                                        {step.actions.map((action, aIdx) => (
                                                            <li key={aIdx} className="flex items-start gap-3">
                                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                                <span className="text-sm text-muted-foreground leading-relaxed">{action}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    {/* Tips and Outputs */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {step.tips && (
                                                            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
                                                                <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                                <p className="text-xs text-blue-800 italic"><strong>Tip:</strong> {step.tips}</p>
                                                            </div>
                                                        )}
                                                        {step.output && (
                                                            <div className="p-3 bg-green-50/50 rounded-lg border border-green-100 flex items-start gap-3">
                                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                                <p className="text-xs text-green-800 font-bold"><strong>Expected:</strong> {step.output}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Learning Outcomes */}
                            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <GraduationCap className="w-6 h-6 text-green-600" />
                                        Learning Outcomes
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.learningOutcomes.map((outcome, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <span className="text-sm text-green-900 font-medium">{outcome}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Curriculum Preview (Static or Dynamic) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    {(course.curriculum || []).map((module: CurriculumModule, idx) => (
                                        <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-2xl px-6 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <AccordionTrigger className="hover:no-underline py-6">
                                                <div className="flex flex-col items-start text-left gap-1">
                                                    <span className="text-sm font-bold text-primary uppercase tracking-wider">Module {idx + 1}</span>
                                                    <span className="text-lg font-bold text-foreground">{module.title}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">{(module.lessons || []).length} lessons • {module.duration}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-6">
                                                <div className="space-y-4">
                                                    {(module.lessons || []).map((lesson: Lesson, lessonIdx) => (
                                                        <div key={lessonIdx} className="space-y-3">
                                                            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 group hover:border-primary transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                                                        {lessonIdx + 1}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{lesson.title}</span>
                                                                        <span className="text-[10px] text-muted-foreground">{lesson.duration} • {lesson.lessonType || 'lesson'}</span>
                                                                    </div>
                                                                </div>
                                                                {lesson.lessonType === 'video' ? <Play className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                                                            </div>
                                                            {lesson.description && (
                                                                <div className="pl-12 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.description }} />
                                                            )}
                                                            {lesson.resourceUrls && lesson.resourceUrls.length > 0 && (
                                                                <div className="pl-12 flex flex-wrap gap-2">
                                                                    {lesson.resourceUrls.map((url, uIdx) => (
                                                                        <a key={uIdx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary text-xs font-semibold rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
                                                                            <FileText className="w-3 h-3" />
                                                                            Resource {uIdx + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </motion.div>

                            {/* Extension Activities */}
                            {course.extensionActivities && course.extensionActivities.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-violet-600" />
                                        Extension Activities (Optional)
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {course.extensionActivities.map((activity, idx) => (
                                            <div key={idx} className="p-4 bg-violet-50 rounded-xl border border-violet-100 flex items-start gap-4">
                                                <Sparkles className="w-6 h-6 text-violet-500 flex-shrink-0" />
                                                <p className="text-sm text-violet-900 font-medium">{activity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Teacher Note */}
                            {course.teacherNote && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                        <Lightbulb className="w-12 h-12 text-amber-200" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-900">
                                        <Lightbulb className="w-6 h-6" />
                                        Teacher&apos;s Note
                                    </h2>
                                    <p className="text-amber-800 leading-relaxed font-medium italic relative z-10">
                                        &ldquo;{course.teacherNote}&rdquo;
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar stuff (like more courses) can go here */}
                    </div>
                </div>
            </section>
        </>
    );
}
