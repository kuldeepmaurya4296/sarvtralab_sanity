'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, Search, Eye, Mail, Phone, BookOpen, GraduationCap, MapPin, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTeacherStudentsData } from '@/lib/actions/teacher.actions';

export default function TeacherStudentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'teacher')) {
            router.push('/login');
        } else if (user && user.role === 'teacher') {
            fetchStudents();
        }
    }, [user, authLoading, router]);

    const fetchStudents = async () => {
        try {
            const data = await getTeacherStudentsData(user!.id);
            setStudents(data);
        } catch (error) {
            console.error("Fetch students error:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (authLoading || isLoadingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'teacher') return null;

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="teacher" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" /> My Students
                        </h1>
                        <p className="text-muted-foreground text-sm">Monitor students who have access to your courses</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search students or courses..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Enrolled</p>
                                <p className="text-xl font-bold">{students.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/5 border-green-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Learners</p>
                                <p className="text-xl font-bold">{students.filter(s => s.status === 'active').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/5 border-blue-500/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unique Courses</p>
                                <p className="text-xl font-bold">{new Set(students.map(s => s.course)).size}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-muted/50 overflow-hidden shadow-sm">
                    <CardContent className="p-0">
                        <div className="rounded-md border-none">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-bold">Student Identity</TableHead>
                                        <TableHead className="font-bold">Academic Detail</TableHead>
                                        <TableHead className="font-bold">Course Access</TableHead>
                                        <TableHead className="font-bold">Progress</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users className="h-8 w-8 opacity-20" />
                                                    <span>No students matching your search.</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(s => (
                                        <TableRow key={s.id} className="hover:bg-muted/30 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                        <AvatarImage src={s.avatar} />
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{s.name}</span>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-2.5 w-2.5" /> {s.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="secondary" className="w-fit text-[10px] h-4 uppercase font-bold tracking-tighter">Grade {s.grade}</Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-2.5 w-2.5" /> School ID: {s.schoolId || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium text-sm text-slate-700">
                                                    <BookOpen className="h-4 w-4 text-primary/60" />
                                                    {s.course}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 w-24">
                                                    <div className="flex justify-between items-center px-0.5">
                                                        <span className="text-[10px] font-bold text-primary">{s.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${s.progress}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={s.status === 'active' ? 'default' : 'secondary'}
                                                    className={`capitalize text-[9px] h-5 ${s.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}`}
                                                >
                                                    {s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[180px]">
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View Student Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Mail className="mr-2 h-4 w-4" /> Message Student
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Phone className="mr-2 h-4 w-4" /> Contact Guardian
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
