
'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, Clock, Construction, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createSupportTicket } from '@/lib/actions/support.actions';

export default function StudentSupportPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { notifyAdmin, addNotification } = useNotifications();

    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    const supportEmail = 'connect@pushpako2.com';
    const supportPhone = '+91-8085613350';
    const supportHours = 'Mon-Sat, 10am-6pm';

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !description) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setIsSubmitting(true);
        try {
            const newTicket = await createSupportTicket({ subject, description, priority });
            toast.success("Support ticket created!");
            addNotification(
                'Support Ticket Submitted',
                `Your ticket #${newTicket.ticketId} has been received and is being reviewed.`,
                'success'
            );
            notifyAdmin(
                'New Support Ticket',
                `${user?.name} has submitted a new support ticket.`,
                'warning',
                '/admin/help-support'
            );
            setSubject('');
            setDescription('');
            setPriority('Medium');
            setOpen(false);
        } catch (error) {
            console.error("Failed to create ticket", error);
            toast.error("Failed to create support ticket.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout role="student" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
                        <p className="text-muted-foreground">Need assistance? Here's how you can reach us.</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <LifeBuoy className="w-4 h-4" />
                                Create Support Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Support Ticket</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="E.g., Cannot access course material" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your issue in detail..." rows={4} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <select className="w-full mt-1 border rounded p-2" value={priority} onChange={e => setPriority(e.target.value)}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Contact Cards */}
                    <div className="bg-card p-6 rounded-2xl border shadow-sm">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Get help with account issues, course content, or technical problems.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <a href={`mailto:${supportEmail}`}>Send Email</a>
                        </Button>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border shadow-sm">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 text-secondary">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Speak directly with our support team during business hours.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <a href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</a>
                        </Button>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border shadow-sm">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Support Hours</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Our team is available to assist you during the following times:
                        </p>
                        <p className="font-medium text-foreground">{supportHours}</p>
                    </div>
                </div>

                {/* FAQ Section Placeholder */}
                <div className="mt-12 text-center py-12 border-t">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Construction className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Knowledge Base Coming Soon</h3>
                    <p className="text-muted-foreground mt-2">
                        We are building a searchable FAQ and help center to answer your questions instantly.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
