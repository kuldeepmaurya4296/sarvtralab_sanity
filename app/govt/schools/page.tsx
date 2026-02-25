'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Download,
    School as SchoolIcon,
    MapPin,
    GraduationCap,
    MoreVertical,
    Eye,
    FileText,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getGovtStudentData } from '@/lib/actions/govt.actions';
import { useAuth } from '@/context/AuthContext';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { GovtSchoolViewSheet } from '@/components/govt/schools/GovtSchoolViewSheet';

export default function GovtSchoolsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [data, setData] = useState<{ govtOrg: any, schools: any[], students: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [boardFilter, setBoardFilter] = useState('all');

    // Detail sheet
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

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

    if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Managed Schools...</div>;
    if (!data || !data.govtOrg) return null;

    const { govtOrg, schools: mySchools, students: allStudents } = data;

    // Count students per school
    const studentCountBySchool: Record<string, number> = {};
    allStudents.forEach((s: any) => {
        const schoolKey = s.schoolId || s.schoolName || '';
        if (schoolKey) {
            studentCountBySchool[schoolKey] = (studentCountBySchool[schoolKey] || 0) + 1;
        }
    });

    // Filter logic
    const filteredSchools = mySchools.filter(school => {
        const matchesSearch =
            (school.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (school.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (school.schoolCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (school.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (school.principalName || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || (school.schoolType || '') === typeFilter;
        const matchesBoard = boardFilter === 'all' || (school.board || '') === boardFilter;

        return matchesSearch && matchesType && matchesBoard;
    });

    // Pagination
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    const paginatedSchools = filteredSchools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusColor = (expiryDate: string) => {
        if (!expiryDate) return "secondary";
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return "destructive";
        if (daysLeft < 30) return "warning";
        return "success";
    };

    const getStatusLabel = (expiryDate: string) => {
        if (!expiryDate) return "No Plan";
        const today = new Date();
        const expiry = new Date(expiryDate);
        if (expiry < today) return "Expired";
        return "Active";
    };

    const getStudentCount = (school: any) => {
        // Match by customId, _id, or name
        return studentCountBySchool[school.customId] ||
            studentCountBySchool[school.id] ||
            studentCountBySchool[school.name] ||
            school.totalStudents || 0;
    };

    const openViewSheet = (school: any) => {
        setSelectedSchool({ ...school, totalStudents: getStudentCount(school) });
        setIsViewOpen(true);
    };

    const handleExport = () => {
        const headers = ['Name', 'School Code', 'Principal', 'City', 'State', 'Type', 'Board', 'Students', 'Email', 'Phone', 'Plan', 'Status'];
        const csvContent = [
            headers.join(','),
            ...mySchools.map(s => [
                `"${s.name || ''}"`,
                s.schoolCode || '',
                `"${s.principalName || ''}"`,
                `"${s.city || ''}"`,
                `"${s.state || ''}"`,
                s.schoolType || '',
                s.board || '',
                getStudentCount(s),
                s.email || '',
                s.phone || '',
                s.subscriptionPlan || 'None',
                getStatusLabel(s.subscriptionExpiry)
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'govt-schools-export.csv';
        a.click();
        toast.success("School data exported successfully");
    };

    return (
        <DashboardLayout role="govt" userName={govtOrg.name || ''} userEmail={govtOrg.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <SchoolIcon className="h-6 w-6 text-primary" />
                            Managed Schools
                        </h1>
                        <p className="text-muted-foreground">
                            All schools registered on the platform
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10"><SchoolIcon className="h-5 w-5 text-primary" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Schools</p>
                                    <p className="text-2xl font-bold">{mySchools.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                    <p className="text-2xl font-bold">{allStudents.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10"><GraduationCap className="h-5 w-5 text-green-500" /></div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Plans</p>
                                    <p className="text-2xl font-bold">{mySchools.filter(s => getStatusLabel(s.subscriptionExpiry) === 'Active').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>School Directory</CardTitle>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search schools, cities..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="School Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="government">Government</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="aided">Aided</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={boardFilter} onValueChange={v => { setBoardFilter(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Boards</SelectItem>
                                        <SelectItem value="CBSE">CBSE</SelectItem>
                                        <SelectItem value="ICSE">ICSE</SelectItem>
                                        <SelectItem value="State Board">State Board</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <CardDescription>
                            Showing {paginatedSchools.length} of {filteredSchools.length} schools
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>School Info</TableHead>
                                        <TableHead>Principal / Contact</TableHead>
                                        <TableHead>Type / Board</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedSchools.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No schools found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedSchools.map((school: any) => (
                                            <TableRow key={school.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openViewSheet(school)}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{school.name}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {school.city || 'N/A'}{school.state ? `, ${school.state}` : ''}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">ID: {school.schoolCode || school.customId || school.id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{school.principalName || 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground">{school.phone || 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{school.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="w-fit capitalize">
                                                            {school.schoolType || 'N/A'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <GraduationCap className="h-3 w-3" />
                                                            {school.board || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {getStudentCount(school).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {school.subscriptionPlan || 'None'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusColor(school.subscriptionExpiry) === 'destructive' ? 'destructive' : 'default'}
                                                        className={getStatusColor(school.subscriptionExpiry) === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                                                    >
                                                        {getStatusLabel(school.subscriptionExpiry)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(school.customId || school.id); toast.success("School ID copied"); }}>
                                                                Copy School ID
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openViewSheet(school); }}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-3 border-t mt-2">
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages} ({filteredSchools.length} total)
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

            {/* School Detail Sheet */}
            <GovtSchoolViewSheet school={selectedSchool} open={isViewOpen} onOpenChange={setIsViewOpen} />
        </DashboardLayout>
    );
}
