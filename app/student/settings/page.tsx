'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, Mail, Save, Edit2, Eye } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileCompletionDialog from '@/components/student/ProfileCompletionDialog';
import StudentProfileViewDialog from '@/components/student/StudentProfileViewDialog';

export default function StudentSettingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    useEffect(() => {
        if (!isAuthLoading && (!user || user.role !== 'student')) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);

    if (isAuthLoading || !user) {
        return <div className="p-8">Loading...</div>;
    }

    const student = user as any;

    return (
        <DashboardLayout role="student" userName={student.name} userEmail={student.email}>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                        <p className="text-muted-foreground">Manage your profile and security preferences.</p>
                    </div>
                </div>

                <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-8">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-xl border-4 border-background">
                                {student.name.charAt(0)}
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-2xl font-bold text-foreground">{student.name}</h3>
                            <p className="text-muted-foreground mb-4">{student.email}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <Button
                                    onClick={() => setIsViewOpen(true)}
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                >
                                    <Eye className="w-4 h-4" /> View Full Profile
                                </Button>
                                <Button
                                    onClick={() => setIsUpdateOpen(true)}
                                    className="gap-2 rounded-xl"
                                >
                                    <Edit2 className="w-4 h-4" /> Update Profile
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary/80 uppercase text-xs tracking-widest">General Information</h4>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" value={student.name} readOnly className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={student.email} readOnly className="bg-muted/30" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-primary/80 uppercase text-xs tracking-widest">Academic Context</h4>
                            <div className="space-y-2">
                                <Label htmlFor="school">School / Institution</Label>
                                <Input id="school" value={student.schoolName || 'Not Set'} readOnly className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade / Class</Label>
                                <Input id="grade" value={student.grade || 'Not Set'} readOnly className="bg-muted/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Security & Password</h3>
                        <p className="text-sm text-muted-foreground">Change your password to keep your account secure.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="currentPassword" type="password" className="pl-9 rounded-xl" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="newPassword" type="password" className="pl-9 rounded-xl" placeholder="New password" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="confirmPassword" type="password" className="pl-9 rounded-xl" placeholder="Confirm new password" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                            Update Password
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <StudentProfileViewDialog
                user={student}
                isOpen={isViewOpen}
                onOpenChange={setIsViewOpen}
                onEdit={() => setIsUpdateOpen(true)}
            />

            <ProfileCompletionDialog
                user={student}
                isOpen={isUpdateOpen}
                onOpenChange={setIsUpdateOpen}
                title="Update Your Profile"
                description="Make changes to your personal, academic, or guardian information here."
                buttonText="Save Profile Changes"
            />
        </DashboardLayout>
    );
}
