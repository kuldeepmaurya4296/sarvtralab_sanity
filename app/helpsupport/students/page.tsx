'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, Search, Eye, Mail, Phone, MapPin, CalendarDays, Contact2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function HelpSupportStudentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('with_tickets');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const openStudent = (student: any) => {
        setSelectedStudent(student);
        setIsViewOpen(true);
    };

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'helpsupport')) {
            router.push('/login');
        } else if (user && user.role === 'helpsupport') {
            import('@/lib/actions/support.actions').then(({ getSupportStudentsData }) => {
                getSupportStudentsData().then((data) => {
                    setStudents(data);
                    setIsLoadingData(false);
                });
            });
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoadingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'helpsupport') return null;

    const filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.school.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filterType === 'all' || (filterType === 'with_tickets' && s.tickets > 0);
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedStudents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <DashboardLayout role="helpsupport" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" /> Student Directory
                        </h1>
                        <p className="text-muted-foreground">Students you&apos;ve recently assisted</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search students..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="with_tickets">Raised Tickets</SelectItem>
                            <SelectItem value="all">All Students</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Total Tickets</TableHead>
                                    <TableHead>Last Ticket</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No students found.</TableCell>
                                    </TableRow>
                                ) : paginatedStudents.map(s => (
                                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openStudent(s)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="font-medium">{s.name}</span>
                                                    <p className="text-xs text-muted-foreground">{s.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{s.school}</TableCell>
                                        <TableCell>{s.grade}</TableCell>
                                        <TableCell className="font-medium">{s.tickets}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{new Date(s.lastTicket).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="capitalize">{s.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openStudent(s); }}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Student Detail Sheet */}
            <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Student Details</SheetTitle>
                        <SheetDescription>ID: {selectedStudent?.id}</SheetDescription>
                    </SheetHeader>
                    {selectedStudent && (
                        <div className="mt-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                        {selectedStudent.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                                    <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'} className="mt-2 capitalize">
                                        {selectedStudent.status} Profile
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm mt-4">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">School</Label>
                                    <span className="font-medium inline-block bg-muted/50 px-2 py-1 rounded-md">{selectedStudent.school}</span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Grade</Label>
                                    <span className="font-medium inline-block bg-muted/50 px-2 py-1 rounded-md border text-center min-w-[3rem]">{selectedStudent.grade}</span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Date of Birth</Label>
                                    <span className="font-medium flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                        {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Support Tickets Left/Created</Label>
                                    <span className="font-medium inline-block border px-2 py-1 rounded-md text-primary">{selectedStudent.tickets}</span>
                                </div>
                                <div className="col-span-2 space-y-1 mt-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Last Ticket Created</Label>
                                    <span className="font-medium inline-block text-xs">
                                        {new Date(selectedStudent.lastTicket).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact & Location Details */}
                            <div>
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" /> Contact & Location
                                </h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Student Phone</Label>
                                        <span className="font-medium">{selectedStudent.phone || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">City & State</Label>
                                        <span className="font-medium">{selectedStudent.city || 'N/A'}{selectedStudent.state ? `, ${selectedStudent.state}` : ''}</span>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Full Address</Label>
                                        <p className="font-medium text-xs leading-relaxed max-w-[90%]">
                                            {selectedStudent.address || 'Address not provided'}
                                            {selectedStudent.pincode && ` - ${selectedStudent.pincode}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Guardian Details */}
                            <div className="bg-muted/30 p-4 rounded-xl border">
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Contact2 className="h-4 w-4 text-muted-foreground" /> Guardian Details
                                </h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Parent/Guardian Name</Label>
                                        <span className="font-medium block">{selectedStudent.parentName || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Parent Phone</Label>
                                        <span className="font-medium block">{selectedStudent.parentPhone || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Parent Email</Label>
                                        <span className="font-medium block truncate pr-2">{selectedStudent.parentEmail || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Communication Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a href={`mailto:${selectedStudent.email}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2 text-xs h-10">
                                        <Mail className="h-3.5 w-3.5" /> Student Email
                                    </Button>
                                </a>
                                {selectedStudent.phone && (
                                    <a href={`tel:${selectedStudent.phone}`} className="flex-1">
                                        <Button variant="outline" className="w-full gap-2 text-xs h-10">
                                            <Phone className="h-3.5 w-3.5" /> Student Phone
                                        </Button>
                                    </a>
                                )}
                                {selectedStudent.parentPhone && (
                                    <a href={`tel:${selectedStudent.parentPhone}`} className="flex-1">
                                        <Button variant="secondary" className="w-full gap-2 text-xs h-10 bg-primary/10 hover:bg-primary/20 text-primary">
                                            <Phone className="h-3.5 w-3.5" /> Guardian Phone
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </DashboardLayout>
    );
}
