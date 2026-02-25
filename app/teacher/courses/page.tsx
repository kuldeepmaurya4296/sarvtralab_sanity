'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BookOpen, Users, Search, Eye, Calendar, Clock, Trash2, Edit3, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { CourseCreationDialog } from '@/components/teacher/CourseCreationDialog';
import { getTeacherCoursesData } from '@/lib/actions/teacher.actions';
import { deleteCourse } from '@/lib/actions/course.actions';

export default function TeacherCoursesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'teacher')) {
            router.push('/login');
        } else if (user && user.role === 'teacher') {
            fetchCourses();
        }
    }, [user, authLoading, router]);

    const fetchCourses = async () => {
        try {
            const data = await getTeacherCoursesData(user!.id);
            setCourses(data);
        } catch (error) {
            console.error("Fetch courses error:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
        try {
            const success = await deleteCourse(id);
            if (success) {
                toast.success("Course deleted successfully");
                fetchCourses();
            } else {
                toast.error("Failed to delete course");
            }
        } catch (error) {
            toast.error("Error deleting course");
        }
    };

    if (authLoading || isLoadingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'teacher') return null;

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.grade.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="teacher" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" /> My Courses
                        </h1>
                        <p className="text-muted-foreground text-sm">Create, manage and monitor your learning programs</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search courses..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <CourseCreationDialog onComplete={fetchCourses} />
                    </div>
                </div>

                <Card className="border-muted/50">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-lg">Course Inventory</CardTitle>
                        <CardDescription>Comprehensive list of courses assigned to you or created by you.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pt-6">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-bold">Course Title</TableHead>
                                        <TableHead className="font-bold">Grade</TableHead>
                                        <TableHead className="font-bold">Students</TableHead>
                                        <TableHead className="font-bold">Completion</TableHead>
                                        <TableHead className="font-bold">Performance</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                                                No courses found. Create your first course to get started!
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(c => (
                                        <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{c.title}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">ID: {c.id}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-medium text-[10px]">{c.grade}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <Users className="h-3 w-3 text-slate-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold">{c.students}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium">{c.completed} / {c.lessons || '0'} Lessons</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-24 space-y-1.5">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>Avg Score</span>
                                                        <span>{c.progress}%</span>
                                                    </div>
                                                    <Progress value={c.progress} className="h-1.5" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={c.status === 'active' ? 'default' : 'secondary'}
                                                    className={`capitalize text-[10px] h-5 ${c.status === 'active' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200' : ''}`}
                                                >
                                                    {c.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right border-l">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Course Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/teacher/courses/${c.id}`)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Edit3 className="mr-2 h-4 w-4" /> Edit Course
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => handleDelete(c.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
