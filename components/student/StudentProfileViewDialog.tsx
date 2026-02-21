'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    User, Phone, Mail, GraduationCap, Building2, MapPin,
    Edit, Calendar, MapIcon, Home, School as SchoolIcon
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StudentProfileViewDialogProps {
    user: any;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
}

export default function StudentProfileViewDialog({
    user,
    isOpen,
    onOpenChange,
    onEdit
}: StudentProfileViewDialogProps) {
    if (!user) return null;

    const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-foreground break-words">{value || 'Not provided'}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background shadow-2xl rounded-2xl">
                {/* Header Section */}
                <div className="bg-primary px-8 py-10 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold shadow-xl">
                            {user.name?.charAt(0)}
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <DialogTitle className="text-3xl font-bold tracking-tight">{user.name}</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 text-lg flex items-center justify-center md:justify-start gap-2">
                                <Mail className="w-4 h-4" /> {user.email}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Personal & Academic Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                                <User className="w-4 h-4" /> Student Info
                            </h3>
                            <div className="space-y-1 rounded-2xl border bg-card/50 p-2">
                                <DetailItem icon={Phone} label="Phone Number" value={user.phone} />
                                <DetailItem icon={SchoolIcon} label="School Name" value={user.schoolName} />
                                <DetailItem icon={GraduationCap} label="Grade / Class" value={user.grade} />
                            </div>
                        </div>

                        {/* Guardian Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                                <Building2 className="w-4 h-4" /> Guardian Details
                            </h3>
                            <div className="space-y-1 rounded-2xl border bg-card/50 p-2">
                                <DetailItem icon={User} label="Guardian Name" value={user.parentName} />
                                <DetailItem icon={Phone} label="Guardian Phone" value={user.parentPhone} />
                                <DetailItem icon={Mail} label="Guardian Email" value={user.parentEmail} />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                            <MapPin className="w-4 h-4" /> Location Details
                        </h3>
                        <div className="rounded-2xl border bg-card/50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <DetailItem icon={Home} label="Full Address" value={user.address} />
                                </div>
                                <DetailItem icon={MapIcon} label="City" value={user.city} />
                                <DetailItem icon={MapIcon} label="State" value={user.state} />
                                <DetailItem icon={Calendar} label="Pincode" value={user.pincode} />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 border-t bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-12 px-6"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onEdit();
                        }}
                        className="gap-2 rounded-xl h-12 px-6 font-bold"
                    >
                        <Edit className="w-4 h-4" /> Update Profile
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
