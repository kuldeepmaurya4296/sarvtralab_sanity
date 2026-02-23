'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    BookOpen,
    Clock,
    Users,
    Star,
    ChevronRight,
    ChevronDown,
    Award,
    BarChart3,
    CheckCircle2,
    GraduationCap,
    TrendingUp,
    CreditCard,
    Shield,
    CalendarClock,
    Sparkles,
    UserCheck,
    Eye,
    IndianRupee,
    Timer,
    AlertTriangle,
    Zap,
    ArrowUpRight,
    Layers
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from 'framer-motion';

import { getSchoolCoursesAndPlansData } from '@/lib/actions/dashboard.actions';

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
        case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'dropped': return 'bg-red-100 text-red-700 border-red-200';
        case 'expired': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
}

// ────────────────────────────────────────────────────────────────────
// Page Component
// ────────────────────────────────────────────────────────────────────
export default function SchoolCoursesPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');

    // Course filters
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Beneficiaries
    const [beneficiarySearch, setBeneficiarySearch] = useState('');

    // Course detail dialog
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'school')) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    useEffect(() => {
        if (tabParam && ['courses', 'plan', 'beneficiaries'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        const loadData = async () => {
            if (user?.role === 'school') {
                try {
                    const result = await getSchoolCoursesAndPlansData(user.id);
                    setData(result);
                } catch (error) {
                    console.error("Failed to load data", error);
                    toast.error("Failed to load courses & plans data");
                } finally {
                    setIsLoadingData(false);
                }
            }
        };
        if (user && !isAuthLoading) loadData();
    }, [user, isAuthLoading]);

    // ── Filtered courses ──
    const filteredCourses = useMemo(() => {
        if (!data?.purchasedCourses) return [];
        return data.purchasedCourses.filter((course: any) => {
            const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
            const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
            return matchesSearch && matchesLevel && matchesCategory;
        });
    }, [data, searchQuery, levelFilter, categoryFilter]);

    // ── Filtered beneficiaries ──
    const filteredBeneficiaries = useMemo(() => {
        if (!data?.beneficiaries) return [];
        return data.beneficiaries.filter((b: any) =>
            b.name?.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
            b.email?.toLowerCase().includes(beneficiarySearch.toLowerCase())
        );
    }, [data, beneficiarySearch]);

    if (isAuthLoading || isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Error loading data.</div>;
    }

    const { summary, plan, beneficiaries, purchasedCourses } = data;

    return (
        <DashboardLayout role="school" userName={data.school.name} userEmail={data.school.email}>
            <div className="space-y-6">
                {/* ───── Page Header ───── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Layers className="h-6 w-6 text-primary" />
                            Courses & Plans
                        </h1>
                        <p className="text-muted-foreground">
                            Complete overview of student purchases, plans, and beneficiaries
                        </p>
                    </div>
                </div>

                {/* ───── Summary Stat Cards ───── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryStatCard
                        icon={BookOpen}
                        label="Courses Purchased"
                        value={summary.totalCoursesWithEnrollments}
                        sub={`${summary.totalEnrollments} total enrollments`}
                        color="from-violet-500/10 to-purple-500/5 border-violet-200"
                        iconColor="bg-violet-100 text-violet-600"
                    />
                    <SummaryStatCard
                        icon={Users}
                        label="Active Beneficiaries"
                        value={summary.beneficiaryCount}
                        sub={`of ${summary.totalStudents} total students`}
                        color="from-emerald-500/10 to-green-500/5 border-emerald-200"
                        iconColor="bg-emerald-100 text-emerald-600"
                    />
                    <SummaryStatCard
                        icon={TrendingUp}
                        label="Completion Rate"
                        value={`${summary.overallCompletionRate}%`}
                        sub={`${summary.totalCompletedEnrollments} completed`}
                        color="from-blue-500/10 to-cyan-500/5 border-blue-200"
                        iconColor="bg-blue-100 text-blue-600"
                    />
                    <SummaryStatCard
                        icon={IndianRupee}
                        label="Total Student Spend"
                        value={formatCurrency(summary.totalStudentSpend)}
                        sub="across all courses"
                        color="from-amber-500/10 to-yellow-500/5 border-amber-200"
                        iconColor="bg-amber-100 text-amber-600"
                    />
                </div>

                {/* ───── Tabs ───── */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/60 p-1 h-auto flex-wrap">
                        <TabsTrigger value="courses" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <BookOpen className="h-4 w-4" />
                            Student Courses
                        </TabsTrigger>
                        <TabsTrigger value="plan" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Shield className="h-4 w-4" />
                            Active Plan
                        </TabsTrigger>
                        <TabsTrigger value="beneficiaries" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <UserCheck className="h-4 w-4" />
                            Plan Beneficiaries
                        </TabsTrigger>
                    </TabsList>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* TAB 1 : Student Courses                                */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="courses" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="courses-search"
                                            placeholder="Search courses..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                                        <SelectTrigger className="w-full sm:w-[160px]" id="level-filter">
                                            <SelectValue placeholder="Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Levels</SelectItem>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-full sm:w-[180px]" id="category-filter">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="foundation">Foundation</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {filteredCourses.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">No Courses Found</h3>
                                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
                                        {purchasedCourses.length === 0
                                            ? "None of your students have purchased courses yet."
                                            : "No courses match your current filters."}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredCourses.map((course: any) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        onViewDetails={() => {
                                            setSelectedCourse(course);
                                            setIsDetailOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* TAB 2 : Active Plan                                    */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="plan" className="space-y-6">
                        {plan ? (
                            <>
                                <ActivePlanCard plan={plan} beneficiaryCount={beneficiaries.length} totalStudents={summary.totalStudents} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <PlanInfoCard
                                        icon={CalendarClock}
                                        title="Expiry Date"
                                        value={plan.expiryDate}
                                        sub={plan.isExpired ? 'Plan has expired' : `${plan.daysRemaining} days remaining`}
                                        variant={plan.isExpired ? 'danger' : plan.daysRemaining <= 30 ? 'warning' : 'success'}
                                    />
                                    <PlanInfoCard
                                        icon={Users}
                                        title="Beneficiaries"
                                        value={beneficiaries.length.toString()}
                                        sub={`${summary.totalStudents - beneficiaries.length} students not yet enrolled`}
                                        variant="info"
                                    />
                                    <PlanInfoCard
                                        icon={IndianRupee}
                                        title="Plan Price"
                                        value={plan.price || 'N/A'}
                                        sub={`Billed ${plan.period}`}
                                        variant="neutral"
                                    />
                                </div>

                                {/* Plan Features */}
                                {plan.features?.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                                Plan Features & Benefits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {plan.features.map((feature: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border">
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm font-medium text-foreground">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">No Active Plan</h3>
                                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
                                        Your school doesn&apos;t have an active subscription plan. Consider upgrading to unlock premium features.
                                    </p>
                                    <Button className="mt-6" onClick={() => router.push('/schools')}>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Browse Plans
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* TAB 3 : Plan Beneficiaries                             */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="beneficiaries" className="space-y-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="beneficiary-search"
                                            placeholder="Search students by name or email..."
                                            className="pl-9"
                                            value={beneficiarySearch}
                                            onChange={(e) => setBeneficiarySearch(e.target.value)}
                                        />
                                    </div>
                                    <Badge variant="outline" className="whitespace-nowrap px-3 py-1.5">
                                        {beneficiaries.length} Beneficiaries
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {filteredBeneficiaries.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <UserCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground">
                                        {beneficiaries.length === 0 ? 'No Beneficiaries Yet' : 'No Results Found'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground/70 mt-1">
                                        {beneficiaries.length === 0
                                            ? "No students have active course enrollments yet."
                                            : "Try a different search term."}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredBeneficiaries.map((b: any) => (
                                    <BeneficiaryCard key={b.id} beneficiary={b} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* ───── Course Detail Dialog ───── */}
                <CourseDetailDialog
                    course={selectedCourse}
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                />
            </div>
        </DashboardLayout>
    );
}

// ════════════════════════════════════════════════════════════════════
// Sub Components
// ════════════════════════════════════════════════════════════════════

function SummaryStatCard({ icon: Icon, label, value, sub, color, iconColor }: {
    icon: any; label: string; value: string | number; sub: string; color: string; iconColor: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border bg-gradient-to-br ${color} transition-all hover:shadow-lg`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>
        </motion.div>
    );
}

function CourseCard({ course, onViewDetails }: { course: any; onViewDetails: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="h-full flex flex-col hover:shadow-lg transition-all border-transparent hover:border-primary/20 group">
                {/* Course Header */}
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {course.category && (
                                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                                        {course.category}
                                    </Badge>
                                )}
                                {course.level && (
                                    <Badge variant="outline" className="text-[10px]">
                                        {course.level}
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                        </div>
                    </div>
                    {course.description && (
                        <CardDescription className="line-clamp-2 mt-1">{course.description}</CardDescription>
                    )}
                </CardHeader>

                {/* Enrollment Stats */}
                <CardContent className="flex-1 pt-0 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                            <p className="text-lg font-bold text-emerald-700">{course.totalEnrolled}</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Enrolled</p>
                        </div>
                        <div className="text-center p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-lg font-bold text-blue-700">{course.completedCount}</p>
                            <p className="text-[10px] text-blue-600 font-medium">Completed</p>
                        </div>
                        <div className="text-center p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                            <p className="text-lg font-bold text-amber-700">{course.activeCount}</p>
                            <p className="text-[10px] text-amber-600 font-medium">Active</p>
                        </div>
                    </div>

                    {/* Avg Progress */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">Avg. Progress</span>
                            <span className="font-bold text-foreground">{course.avgProgress}%</span>
                        </div>
                        <Progress value={course.avgProgress} className="h-2" />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{course.duration || 'N/A'}</span>
                        </div>
                        {course.price > 0 && (
                            <div className="flex items-center gap-1 font-medium text-foreground">
                                <IndianRupee className="h-3 w-3" />
                                <span>{course.price}</span>
                            </div>
                        )}
                        {course.rating && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{course.rating}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <div className="px-6 pb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={onViewDetails}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details & Students
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}

function ActivePlanCard({ plan, beneficiaryCount, totalStudents }: { plan: any; beneficiaryCount: number; totalStudents: number }) {
    const progressPercent = totalStudents > 0 ? Math.round((beneficiaryCount / totalStudents) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className={`relative overflow-hidden ${plan.isExpired
                ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/30'
                : 'border-primary/20 bg-gradient-to-br from-primary/5 via-purple-50/30 to-blue-50/20'
                }`}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.06]">
                    <Shield className="h-32 w-32" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

                <CardContent className="relative z-10 p-6 space-y-5">
                    {/* Plan Title + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className={plan.isExpired
                                    ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'
                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }>
                                    {plan.isExpired ? (
                                        <><AlertTriangle className="h-3 w-3 mr-1" /> Expired</>
                                    ) : (
                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                                    )}
                                </Badge>
                                {plan.popular && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                        <Sparkles className="h-3 w-3 mr-1" /> Popular
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-primary">{plan.price || 'Free'}</p>
                            <p className="text-xs text-muted-foreground">per {plan.period}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Student Adoption</span>
                                <span className="font-bold">{beneficiaryCount}/{totalStudents}</span>
                            </div>
                            <Progress value={progressPercent} className="h-2.5" />
                            <p className="text-xs text-muted-foreground">{progressPercent}% of students benefiting from the plan</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {!plan.isExpired && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/60 border flex-1">
                                    <Timer className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xl font-bold text-foreground">{plan.daysRemaining}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Days Left</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/60 border flex-1">
                                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-bold text-foreground">{plan.expiryDate}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Expires</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function PlanInfoCard({ icon: Icon, title, value, sub, variant }: {
    icon: any; title: string; value: string; sub: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
    const variants = {
        success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', text: 'text-emerald-700' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', text: 'text-amber-700' },
        danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-700' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-700' },
        neutral: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600', text: 'text-gray-700' },
    };
    const v = variants[variant];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${v.bg} ${v.border}`}>
                <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/80 ${v.icon}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
                        <p className={`text-lg font-bold ${v.text}`}>{value}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function BeneficiaryCard({ beneficiary }: { beneficiary: any }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover:shadow-md transition-all hover:border-primary/20">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {beneficiary.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{beneficiary.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{beneficiary.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px] px-2">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {beneficiary.grade}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {beneficiary.coursesEnrolled} Enrolled
                                </Badge>
                                {beneficiary.coursesCompleted > 0 && (
                                    <Badge variant="outline" className="text-[10px] px-2 bg-blue-50 text-blue-700 border-blue-200">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        {beneficiary.coursesCompleted} Done
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    {beneficiary.joinedAt && (
                        <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            Joined: {formatDate(beneficiary.joinedAt)}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function CourseDetailDialog({ course, open, onOpenChange }: {
    course: any; open: boolean; onOpenChange: (open: boolean) => void;
}) {
    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Course Details: {course.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[85vh]">
                    <div className="p-6 space-y-6">
                        {/* Course Header */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {course.category && (
                                    <Badge className="bg-primary text-primary-foreground">{course.category}</Badge>
                                )}
                                {course.level && <Badge variant="outline">{course.level}</Badge>}
                                {course.grade && (
                                    <Badge variant="secondary">
                                        <GraduationCap className="h-3 w-3 mr-1" />{course.grade}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold">{course.title}</h2>
                            {course.description && (
                                <p className="text-muted-foreground">{course.description}</p>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                <Users className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-emerald-700">{course.totalEnrolled}</p>
                                <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Total Enrolled</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                                <CheckCircle2 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-blue-700">{course.completedCount}</p>
                                <p className="text-[10px] text-blue-600 uppercase tracking-wider font-medium">Completed</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <TrendingUp className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-amber-700">{course.avgProgress}%</p>
                                <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Avg Progress</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
                                <BarChart3 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-purple-700">{course.activeCount}</p>
                                <p className="text-[10px] text-purple-600 uppercase tracking-wider font-medium">Active Now</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Enrolled Students Table */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                Students Enrolled ({course.students?.length || 0})
                            </h3>
                            {course.students?.length > 0 ? (
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/50 border-b">
                                                    <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Student</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Grade</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Status</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Progress</th>
                                                    <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground">Enrolled On</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {course.students.map((student: any, idx: number) => (
                                                    <tr key={student.id || idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="py-2.5 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                                    {student.name?.charAt(0)?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{student.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{student.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-4 text-muted-foreground">{student.grade}</td>
                                                        <td className="py-2.5 px-4">
                                                            <Badge variant="outline" className={`text-[10px] ${getStatusColor(student.status)}`}>
                                                                {student.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2.5 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={student.progress} className="h-1.5 w-16" />
                                                                <span className="text-xs font-medium">{student.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-4 text-muted-foreground text-xs">{formatDate(student.enrolledAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No students enrolled yet.
                                </div>
                            )}
                        </div>

                        {/* Curriculum */}
                        {course.curriculum?.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        Curriculum ({course.curriculum.length} Modules)
                                    </h3>
                                    <div className="space-y-2">
                                        {course.curriculum.map((module: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{module.title}</p>
                                                    {module.duration && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />{module.duration}
                                                        </p>
                                                    )}
                                                </div>
                                                {module.lessons?.length > 0 && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {module.lessons.length} lessons
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
