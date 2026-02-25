'use client';

import { School as SchoolIcon, MapPin, Mail, Phone, Globe, GraduationCap, Users, Calendar, Briefcase } from 'lucide-react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GovtSchoolViewSheetProps {
    school: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GovtSchoolViewSheet({ school, open, onOpenChange }: GovtSchoolViewSheetProps) {
    if (!school) return null;

    const getStatusInfo = () => {
        if (!school.subscriptionExpiry) return { label: 'No Plan', variant: 'secondary' as const };
        const today = new Date();
        const expiry = new Date(school.subscriptionExpiry);
        if (expiry < today) return { label: 'Expired', variant: 'destructive' as const };
        return { label: 'Active', variant: 'default' as const };
    };

    const statusInfo = getStatusInfo();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>School Details</SheetTitle>
                    <SheetDescription>Complete school profile and information</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarFallback className="text-lg font-bold">{(school.name || 'SC').substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{school.name}</h3>
                            <p className="text-sm text-muted-foreground">ID: {school.customId || school.schoolCode || school.id}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={statusInfo.variant} className={statusInfo.label === 'Active' ? 'bg-green-100 text-green-800' : ''}>{statusInfo.label}</Badge>
                                {school.schoolType && <Badge variant="outline" className="capitalize">{school.schoolType}</Badge>}
                                {school.board && <Badge variant="secondary">{school.board}</Badge>}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Contact Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Email</span>
                                <span className="text-sm font-medium break-all">{school.email || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Phone</span>
                                <span className="text-sm font-medium">{school.phone || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Principal</span>
                                <span className="text-sm font-medium">{school.principalName || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Website</span>
                                <span className="text-sm font-medium break-all">{school.websiteUrl || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Location</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Address</span>
                                <span className="text-sm font-medium">{school.address || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">City</span>
                                <span className="text-sm font-medium">{school.city || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">State</span>
                                <span className="text-sm font-medium">{school.state || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Pincode</span>
                                <span className="text-sm font-medium">{school.pincode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Academics */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /> Academics & Stats</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Total Students</span>
                                <span className="text-2xl font-bold block mt-1">{school.totalStudents || 0}</span>
                            </div>
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">School Type</span>
                                <span className="text-sm font-bold capitalize block mt-1">{school.schoolType || 'N/A'}</span>
                            </div>
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Board</span>
                                <span className="text-sm font-bold block mt-1">{school.board || 'N/A'}</span>
                            </div>
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">School Code</span>
                                <span className="text-sm font-bold block mt-1">{school.schoolCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Subscription */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> Subscription</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Plan</span>
                                <span className="text-sm font-bold capitalize block mt-1">{school.subscriptionPlan || 'None'}</span>
                            </div>
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Expiry</span>
                                <span className="text-sm font-bold block mt-1">
                                    {school.subscriptionExpiry ? new Date(school.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Created At */}
                    {school.createdAt && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Registered on {new Date(school.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
