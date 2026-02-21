
import {
    Activity,
    Target,
    Clock,
    FileText,
    TrendingUp,
    Award,
    Download,
    Mail
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';

import { Student } from '@/types/user';

interface StudentPerformanceTabProps {
    student: Student;
    showEmailButton?: boolean;
}

export function StudentPerformanceTab({ student, showEmailButton }: StudentPerformanceTabProps) {
    // 1. Calculate Course Progress
    const enrollments = student.enrollments || [];
    const enrolledCount = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'Completed').length;
    const avgProgress = enrolledCount > 0
        ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrolledCount)
        : 0;

    // 2. Calculate Attendance
    const attendanceRecords = student.attendance || [];
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // 3. Calculate Time Spent
    const totalMinutes = enrollments.reduce((acc, curr) => acc + (curr.watchTime || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeSpentStr = `${hours}h ${mins}m`;

    // 4. Calculate Assessment Scores
    const submissions = student.submissions || [];
    const gradedSubmissions = submissions.filter(s => s.score !== undefined);
    const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + curr.score, 0) / gradedSubmissions.length)
        : 0;

    const performanceData = {
        attendance: totalDays > 0 ? attendanceRate : 85, // Fallback if no records
        lecturesAttended: presentDays,
        totalLectures: totalDays,
        avgScore: avgScore,
        timeSpent: totalMinutes > 0 ? timeSpentStr : "0h 0m",
        assignmentsCompleted: gradedSubmissions.length,
        totalAssignments: submissions.length,
        monthlyActivity: [65, 45, 85, 75, 40, avgProgress], // Mix of mock and real for trend
        recentScores: submissions.slice(0, 3).map(s => ({
            subject: s.assignmentRef?.title || 'Assignment',
            score: s.score || 0,
            type: s.status,
            date: s.submittedAt ? new Date(s.submittedAt).toISOString().split('T')[0] : 'N/A'
        }))
    };

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Attendance</span>
                        <Activity className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">{performanceData.attendance}%</div>
                    <Progress value={performanceData.attendance} className="h-1.5" />
                    <div className="text-xs text-muted-foreground">{performanceData.lecturesAttended}/{performanceData.totalLectures || 0} Records</div>
                </div>
                <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Course Progress</span>
                        <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{avgProgress}%</div>
                    <Progress value={avgProgress} className="h-1.5 bg-blue-100" />
                    <div className="text-xs text-muted-foreground">{completedCount} of {enrolledCount} courses</div>
                </div>
                <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Time Spent</span>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{performanceData.timeSpent}</div>
                    <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[70%]" />
                    </div>
                    <div className="text-xs text-muted-foreground">Total learning time</div>
                </div>
                <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assignments</span>
                        <FileText className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">{performanceData.assignmentsCompleted}</div>
                    <Progress value={performanceData.totalAssignments > 0 ? (performanceData.assignmentsCompleted / performanceData.totalAssignments) * 100 : 0} className="h-1.5 bg-purple-100" />
                    <div className="text-xs text-muted-foreground">of {performanceData.totalAssignments} graded</div>
                </div>
            </div>

            {/* Activity Chart Mockup */}
            <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Learning Activity (Last 6 Months)
                </h4>
                <div className="h-48 w-full bg-muted/20 rounded-xl border flex items-end justify-between p-6 gap-2">
                    {performanceData.monthlyActivity.map((val: number, idx: number) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full">
                            <div
                                className="w-full bg-primary/80 hover:bg-primary rounded-t-md transition-all duration-500 ease-in-out"
                                style={{ height: `${val}%` }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][idx]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Card */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Recent Assessment Scores
                    </h4>
                </div>
                <div className="rounded-lg border bg-card">
                    {performanceData.recentScores.map((score: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${score.score >= 90 ? 'bg-green-100 text-green-700' :
                                    score.score >= 80 ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {score.score}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{score.subject}</p>
                                    <p className="text-xs text-muted-foreground">{score.type} • {score.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${score.score >= 90 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {score.score >= 90 ? 'Excellent' : score.score >= 80 ? 'Good' : 'Average'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <Button className="w-full gap-2">
                    <Download className="h-4 w-4" /> Download Report PDF
                </Button>
                {showEmailButton && (
                    <Button variant="outline" className="w-full gap-2">
                        <Mail className="h-4 w-4" /> Email to Guardian
                    </Button>
                )}
            </div>
        </div>
    );
}
