'use client';

import { useState, useEffect } from 'react';
import { Search, Download, GraduationCap, Users, School as SchoolIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getGovtStudentData } from '@/lib/actions/govt.actions';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { GovtStudentTable } from '@/components/govt/students/GovtStudentTable';
import { GovtStudentViewSheet } from '@/components/govt/students/GovtStudentViewSheet';
import { GovtStudentContactDialog } from '@/components/govt/students/GovtStudentContactDialog';

export default function GovtStudentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [data, setData] = useState<{ govtOrg: any, schools: any[], students: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getGovtStudentData();
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Students...</div>;
    if (!data || !data.govtOrg) return null;

    const { govtOrg, schools: schoolOptions, students: myStudents } = data;
    const grades = Array.from(new Set(myStudents.map((s: any) => s.grade).filter(Boolean))).sort();

    const filteredStudents = myStudents.filter((student: any) => {
        const matchesSearch =
            (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.parentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.schoolName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
        const matchesSchool = schoolFilter === 'all' || student.schoolId === schoolFilter || student.schoolName === schoolFilter;
        return matchesSearch && matchesGrade && matchesSchool;
    });

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Email', 'School', 'Grade', 'Parent Name', 'Parent Phone', 'Parent Email', 'City', 'State', 'Courses'];
        const csvContent = [
            headers.join(','),
            ...myStudents.map((s: any) => [
                s.customId || s.id,
                `"${s.name || ''}"`,
                s.email || '',
                `"${s.schoolName || ''}"`,
                s.grade || '',
                `"${s.parentName || ''}"`,
                s.parentPhone || '',
                s.parentEmail || '',
                `"${s.city || ''}"`,
                `"${s.state || ''}"`,
                s.enrolledCourses?.length || 0
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'govt-students-export.csv';
        a.click();
        toast.success("Exported student data");
    };

    const openView = (student: any) => { setSelectedStudent(student); setIsViewOpen(true); };
    const openContact = (student: any) => { setSelectedStudent(student); setIsContactOpen(true); };

    return (
        <DashboardLayout role="govt" userName={govtOrg.name} userEmail={govtOrg.email}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" /> Student Enrollment
                        </h1>
                        <p className="text-muted-foreground">Monitor all students across schools</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" /> Export Data
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                    <p className="text-2xl font-bold">{myStudents.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10"><SchoolIcon className="h-5 w-5 text-blue-500" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Across Schools</p>
                                    <p className="text-2xl font-bold">{schoolOptions.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10"><GraduationCap className="h-5 w-5 text-green-500" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Unique Grades</p>
                                    <p className="text-2xl font-bold">{grades.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>All Students</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, parent, email..." className="pl-8" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                                </div>
                                <Select value={schoolFilter} onValueChange={v => { setSchoolFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by School" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Schools</SelectItem>
                                        {schoolOptions.map((school: any) => (<SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <Select value={gradeFilter} onValueChange={v => { setGradeFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Grade" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Grades</SelectItem>
                                        {grades.map((grade: any) => (<SelectItem key={grade} value={grade}>{grade}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <CardDescription>
                            Showing {paginatedStudents.length} of {filteredStudents.length} students across {schoolOptions.length} schools
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GovtStudentTable students={paginatedStudents} onView={openView} onContact={openContact} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-3 border-t mt-2">
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages} ({filteredStudents.length} total)
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <GovtStudentViewSheet student={selectedStudent} open={isViewOpen} onOpenChange={setIsViewOpen} />
            <GovtStudentContactDialog student={selectedStudent} open={isContactOpen} onOpenChange={setIsContactOpen} />
        </DashboardLayout>
    );
}
