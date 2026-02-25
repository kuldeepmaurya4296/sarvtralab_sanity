'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { ChartCard, AreaChartComponent } from '@/components/dashboard/Charts';
import { getTeacherDashboardOverview } from '@/lib/actions/teacher.actions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Users,
    FileText,
    Clock,
    TrendingUp,
    Calendar,
    ArrowRight,
    School as SchoolIcon,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function TeacherDashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'teacher')) {
            router.push('/login');
        }

        const fetchData = async () => {
            if (user?.id && user.role === 'teacher') {
                try {
                    const res = await getTeacherDashboardOverview();
                    setData(res);
                } catch (error) {
                    console.error("Dashboard error:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoading) return <DashboardLoading />;
    if (!user || user.role !== 'teacher') return null;

    const { stats, recentCourses, assignedSchools, schedule } = data;

    const statCards = [
        { title: 'My Courses', value: stats?.totalCourses || '0', icon: BookOpen, change: '+1', changeType: 'positive' as const },
        { title: 'Active Students', value: stats?.totalStudents || '0', icon: Users, change: '+12', changeType: 'positive' as const },
        { title: 'Resources', value: stats?.totalMaterials || '0', icon: FileText, change: '+5', changeType: 'positive' as const },
        { title: 'Avg Score', value: `${stats?.avgCompletion || 0}%`, icon: TrendingUp, change: '+2.4%', changeType: 'positive' as const },
    ];

    const studentEngagement = [
        { name: 'Monday', students: 40 },
        { name: 'Tuesday', students: 52 },
        { name: 'Wednesday', students: 48 },
        { name: 'Thursday', students: 61 },
        { name: 'Friday', students: 55 },
        { name: 'Saturday', students: 32 },
        { name: 'Sunday', students: 25 },
    ];

    return (
        <DashboardLayout role="teacher" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-bold text-foreground">Teacher Console 👋</h1>
                        <p className="text-muted-foreground text-sm">Welcome back, {user.name}. You have 3 classes scheduled for today.</p>
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <Link href="/teacher/settings">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Badge variant="outline" className="px-1 bg-green-500/10 text-green-600 border-green-200">
                                    {(user as any).availabilityStatus || 'Available'}
                                </Badge>
                                Update Status
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat: any, idx: number) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <StatCard {...stat} className="hover:shadow-md transition-shadow border-primary/10" />
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Primary Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Overview Section */}
                        <Card className="shadow-sm border-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg">Recent Courses</CardTitle>
                                    <CardDescription>Performance of your latest assigned batches</CardDescription>
                                </div>
                                <Link href="/teacher/courses">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 group">
                                        All Courses <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                {recentCourses.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg">
                                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No courses assigned yet</p>
                                    </div>
                                ) : (
                                    recentCourses.map((course: any, idx: number) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group relative flex items-center justify-between p-4 rounded-xl border border-muted/60 bg-white hover:bg-muted/10 transition-all hover:border-primary/20"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm tracking-tight">{course.title}</h4>
                                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.students} Enrolled</span>
                                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Next: {new Date(course.nextClass).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-20 hidden sm:block shrink-0 px-4">
                                                <Badge variant="secondary" className="text-[10px] bg-slate-100">Live</Badge>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Chart Area */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Activity Trends
                                </CardTitle>
                                <CardDescription>Daily student participation across all your courses</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[240px] pt-4">
                                <AreaChartComponent
                                    data={studentEngagement}
                                    dataKey="students"
                                    xAxisKey="name"
                                    color="hsl(var(--primary))"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Daily Schedule */}
                        <Card className="border-primary/10 shadow-sm overflow-hidden ring-1 ring-primary/5">
                            <CardHeader className="pb-3 bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Today&apos;s Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-muted/60">
                                    {schedule.map((cls: any, idx: number) => (
                                        <div key={idx} className="flex p-4 hover:bg-muted/10 transition-colors">
                                            <div className="w-[70px] shrink-0">
                                                <span className="text-xs font-bold text-primary">{cls.time}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold">{cls.course}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="text-[9px] px-1 py-0 h-4 uppercase tracking-tighter bg-primary/20 text-primary border-none">{cls.type}</Badge>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{cls.grade}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assigned Schools */}
                        <Card className="shadow-sm border-blue-100 bg-blue-50/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <SchoolIcon className="h-4 w-4 text-blue-600" />
                                    Assigned Institutions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-2">
                                {assignedSchools.length === 0 ? (
                                    <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-200/50">
                                        <AlertCircle className="h-4 w-4 text-blue-400" />
                                        <span className="text-xs text-blue-600 font-medium">No schools officially linked yet.</span>
                                    </div>
                                ) : (
                                    assignedSchools.map((school: any) => (
                                        <div key={school.id} className="p-3 rounded-lg bg-white border border-blue-100 shadow-sm flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                <SchoolIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold truncate">{school.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground truncate">{school.city} • {school.board}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Productivity Shortcuts */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/teacher/materials" className="group">
                                <div className="p-4 rounded-xl border border-muted/80 bg-white hover:border-primary/40 transition-all text-center">
                                    <FileText className="h-5 w-5 mx-auto mb-2 text-primary opacity-60 group-hover:opacity-100" />
                                    <span className="text-xs font-bold">Materials</span>
                                </div>
                            </Link>
                            <Link href="/teacher/courses" className="group">
                                <div className="p-4 rounded-xl border border-muted/80 bg-white hover:border-primary/40 transition-all text-center">
                                    <Briefcase className="h-5 w-5 mx-auto mb-2 text-primary opacity-60 group-hover:opacity-100" />
                                    <span className="text-xs font-bold">New Course</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function DashboardLoading() {
    return (
        <DashboardLayout role="teacher" userName="..." userEmail="...">
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-64 bg-muted rounded"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 bg-muted rounded-xl"></div>
                    <div className="h-96 bg-muted rounded-xl"></div>
                </div>
            </div>
        </DashboardLayout>
    );
}
