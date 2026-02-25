'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    Headphones, Search, CheckCircle, Clock, AlertCircle, Eye, MessageSquare, Filter, Mail, Phone, MapPin, CalendarDays, Contact2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function HelpSupportTicketsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isStudentViewOpen, setIsStudentViewOpen] = useState(false);
    const [ticketStatus, setTicketStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'helpsupport')) {
            router.push('/login');
        } else if (user && user.role === 'helpsupport') {
            import('@/lib/actions/support.actions').then(({ getAllTickets }) => {
                getAllTickets().then((data) => {
                    const mapped = data.map((t: any) => ({
                        id: t.ticketId || t.customId || t._id,
                        subject: t.subject,
                        description: t.description,
                        student: t.userRef?.name || 'Unknown',
                        studentProfile: t.userRef,
                        email: t.userRef?.email || '',
                        priority: t.priority?.toLowerCase() || 'medium',
                        status: t.status?.toLowerCase().replace(' ', '-') || 'open',
                        category: t.category || 'general',
                        created: t.createdAt || new Date().toISOString()
                    }));
                    setTickets(mapped);
                    setIsLoadingData(false);
                });
            });
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoadingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'helpsupport') return null;

    const filtered = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.student.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedTickets = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        setTicketStatus(ticket.status);
        setIsViewOpen(true);
    };

    const fetchTickets = async () => {
        const { getAllTickets } = await import('@/lib/actions/support.actions');
        const data = await getAllTickets();
        const mapped = data.map((t: any) => ({
            id: t.ticketId || t.customId || t._id,
            subject: t.subject,
            description: t.description,
            student: t.userRef?.name || 'Unknown',
            studentProfile: t.userRef,
            email: t.userRef?.email || '',
            priority: t.priority?.toLowerCase() || 'medium',
            status: t.status?.toLowerCase().replace(' ', '-') || 'open',
            category: t.category || 'general',
            created: t.createdAt || new Date().toISOString()
        }));
        setTickets(mapped);
    };

    const handleUpdate = async () => {
        if (!selectedTicket) return;
        try {
            const { updateTicketStatus } = await import('@/lib/actions/support.actions');
            await updateTicketStatus(selectedTicket.id, ticketStatus);
            toast.success(`Ticket ${selectedTicket.id} updated to "${ticketStatus}"`);
            setIsViewOpen(false);
            fetchTickets();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update ticket status");
        }
    };

    const getPriorityVariant = (p: string) => p === 'high' ? 'destructive' : p === 'medium' ? 'secondary' : 'outline';
    const getStatusIcon = (s: string) => s === 'open' ? <AlertCircle className="h-3 w-3 text-red-500" /> : s === 'in-progress' ? <Clock className="h-3 w-3 text-amber-500" /> : <CheckCircle className="h-3 w-3 text-green-500" />;

    return (
        <DashboardLayout role="helpsupport" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Headphones className="h-6 w-6 text-primary" /> Support Tickets
                        </h1>
                        <p className="text-muted-foreground">Manage and resolve student support tickets</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search tickets..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
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
                                        <TableHead>ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No tickets found.</TableCell>
                                        </TableRow>
                                    ) : paginatedTickets.map(t => (
                                        <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTicket(t)}>
                                            <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm truncate max-w-[200px] block">{t.subject}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-medium text-sm text-primary hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTicket(t);
                                                        setIsStudentViewOpen(true);
                                                    }}
                                                >
                                                    {t.student}
                                                </span>
                                            </TableCell>
                                            <TableCell><Badge variant="outline" className="capitalize text-xs">{t.category}</Badge></TableCell>
                                            <TableCell><Badge variant={getPriorityVariant(t.priority) as any} className="capitalize text-xs">{t.priority}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(t.status)}
                                                    <span className="capitalize text-sm">{t.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{new Date(t.created).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openTicket(t); }}><Eye className="h-4 w-4" /></Button>
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
            </div>

            {/* Ticket Detail Sheet */}
            <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Ticket Details</SheetTitle>
                        <SheetDescription>ID: {selectedTicket?.id}</SheetDescription>
                    </SheetHeader>
                    {selectedTicket && (
                        <div className="mt-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold">{selectedTicket.subject}</h3>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <Badge variant={getPriorityVariant(selectedTicket.priority) as any}>{selectedTicket.priority} priority</Badge>
                                    <Badge variant="outline" className="capitalize">{selectedTicket.category}</Badge>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                                <div className="p-4 bg-muted/30 rounded-md border text-sm mt-1">{selectedTicket.description}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Student</span>
                                    <span className="font-medium">{selectedTicket.student}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Email</span>
                                    <span className="font-medium">{selectedTicket.email}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Created</span>
                                    <span className="font-medium">{new Date(selectedTicket.created).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3 bg-accent/20 p-4 rounded-lg border border-accent/50">
                                <Label className="flex items-center gap-2 font-semibold"><CheckCircle className="h-4 w-4" /> Update Status</Label>
                                <div className="flex gap-2">
                                    <Select value={ticketStatus} onValueChange={setTicketStatus}>
                                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleUpdate}>Update</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
            {/* Student Detail Sheet */}
            <Sheet open={isStudentViewOpen} onOpenChange={setIsStudentViewOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Student Details</SheetTitle>
                        <SheetDescription>ID: {selectedTicket?.studentProfile?.customId || selectedTicket?.studentProfile?._id || 'N/A'}</SheetDescription>
                    </SheetHeader>
                    {selectedTicket?.studentProfile && (
                        <div className="mt-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                        {selectedTicket.studentProfile.name?.substring(0, 2).toUpperCase() || 'NA'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedTicket.studentProfile.name}</h3>
                                    <p className="text-muted-foreground">{selectedTicket.studentProfile.email}</p>
                                    <Badge variant={selectedTicket.studentProfile.status === 'active' ? 'default' : 'secondary'} className="mt-2 capitalize">
                                        {selectedTicket.studentProfile.status || 'Active'} Profile
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm mt-4">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">School</Label>
                                    <span className="font-medium inline-block bg-muted/50 px-2 py-1 rounded-md">{selectedTicket.studentProfile.schoolName || 'Unknown'}</span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Grade</Label>
                                    <span className="font-medium inline-block bg-muted/50 px-2 py-1 rounded-md border text-center min-w-[3rem]">{selectedTicket.studentProfile.grade || 'N/A'}</span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Date of Birth</Label>
                                    <span className="font-medium flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                        {selectedTicket.studentProfile.dateOfBirth ? new Date(selectedTicket.studentProfile.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="space-y-1"></div>
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
                                        <span className="font-medium">{selectedTicket.studentProfile.phone || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">City & State</Label>
                                        <span className="font-medium">{selectedTicket.studentProfile.city || 'N/A'}{selectedTicket.studentProfile.state ? `, ${selectedTicket.studentProfile.state}` : ''}</span>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Full Address</Label>
                                        <p className="font-medium text-xs leading-relaxed max-w-[90%]">
                                            {selectedTicket.studentProfile.address || 'Address not provided'}
                                            {selectedTicket.studentProfile.pincode && ` - ${selectedTicket.studentProfile.pincode}`}
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
                                        <span className="font-medium block">{selectedTicket.studentProfile.parentName || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Parent Phone</Label>
                                        <span className="font-medium block">{selectedTicket.studentProfile.parentPhone || 'N/A'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground block">Parent Email</Label>
                                        <span className="font-medium block truncate pr-2">{selectedTicket.studentProfile.parentEmail || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Communication Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a href={`mailto:${selectedTicket.studentProfile.email}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2 text-xs h-10">
                                        <Mail className="h-3.5 w-3.5" /> Student Email
                                    </Button>
                                </a>
                                {selectedTicket.studentProfile.phone && (
                                    <a href={`tel:${selectedTicket.studentProfile.phone}`} className="flex-1">
                                        <Button variant="outline" className="w-full gap-2 text-xs h-10">
                                            <Phone className="h-3.5 w-3.5" /> Student Phone
                                        </Button>
                                    </a>
                                )}
                                {selectedTicket.studentProfile.parentPhone && (
                                    <a href={`tel:${selectedTicket.studentProfile.parentPhone}`} className="flex-1">
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
