'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { ChartCard, AreaChartComponent, MultiBarChartComponent } from '@/components/dashboard/Charts';
import { BarChart3, Users, BookOpen, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherReportsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'teacher')) {
            router.push('/login');
        } else if (user && user.role === 'teacher') {
            import('@/lib/actions/teacher.actions').then(({ getTeacherReportsData }) => {
                getTeacherReportsData(user.id).then((res) => {
                    setData(res);
                    setIsLoadingData(false);
                });
            });
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoadingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'teacher' || !data) return null;

    const { totalStudents, totalCourses, totalCompletions, avgScore, monthlyStats, coursePerformance } = data;

    return (
        <DashboardLayout role="teacher" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" /> Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground">Track teaching performance and student progress</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Students" value={totalStudents.toString()} icon={Users} change="+12%" changeType="positive" />
                    <StatCard title="Courses Taught" value={totalCourses.toString()} icon={BookOpen} change="+1" changeType="positive" />
                    <StatCard title="Course Completions" value={totalCompletions.toString()} icon={Award} change="+20%" changeType="positive" />
                    <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} change="+5%" changeType="positive" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Student Enrollment & Completions">
                        <MultiBarChartComponent
                            data={monthlyStats}
                            bars={[
                                { dataKey: 'students', name: 'Enrolled', color: '#6366f1' },
                                { dataKey: 'completions', name: 'Completions', color: '#22c55e' },
                            ]}
                            xAxisKey="name"
                        />
                    </ChartCard>

                    <ChartCard title="Course Performance">
                        <MultiBarChartComponent
                            data={coursePerformance}
                            bars={[
                                { dataKey: 'avgScore', name: 'Avg Score %', color: '#f59e0b' },
                                { dataKey: 'completion', name: 'Completion %', color: '#6366f1' },
                            ]}
                            xAxisKey="name"
                        />
                    </ChartCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
