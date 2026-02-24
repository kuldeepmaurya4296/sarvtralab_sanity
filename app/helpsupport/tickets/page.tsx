'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    Headphones, Search, CheckCircle, Clock, AlertCircle, Eye, MessageSquare, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    const [ticketStatus, setTicketStatus] = useState('');

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
                                    ) : filtered.map(t => (
                                        <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTicket(t)}>
                                            <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm truncate max-w-[200px] block">{t.subject}</span>
                                            </TableCell>
                                            <TableCell className="text-sm">{t.student}</TableCell>
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
        </DashboardLayout>
    );
}
