'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    Settings, User, Mail, Lock, Save, Eye, EyeOff,
    Briefcase, GraduationCap, Github, Linkedin, Twitter,
    Globe, Phone, Clock, AlertCircle, Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getTeacherProfile, updateTeacherProfile } from '@/lib/actions/teacher.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TeacherSettingsPage() {
    const { user: authUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (!authLoading && (!authUser || authUser.role !== 'teacher')) {
            router.push('/login');
        } else if (authUser) {
            fetchProfile();
        }
    }, [authUser, authLoading, router]);

    const fetchProfile = async () => {
        try {
            const profile = await getTeacherProfile();
            setUser(profile);
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { id, _id, _type, createdAt, role, email, ...updates } = user;
            await updateTeacherProfile(updates);
            toast.success('Profile updated successfully!');
            fetchProfile();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match");
            return;
        }
        setIsSaving(true);
        try {
            await updateTeacherProfile({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password updated successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'teacher') return null;

    return (
        <DashboardLayout role="teacher" userName={user.name || ''} userEmail={user.email || ''}>
            <div className="space-y-6 pb-12">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Settings className="h-6 w-6 text-primary" /> Profile Settings
                    </h1>
                    <p className="text-muted-foreground">Manage your educational, professional and personal details</p>
                </div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> Personal</TabsTrigger>
                        <TabsTrigger value="professional" className="gap-2"><Briefcase className="h-4 w-4" /> Professional</TabsTrigger>
                        <TabsTrigger value="availability" className="gap-2"><Clock className="h-4 w-4" /> Availability</TabsTrigger>
                        <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Personal Information</CardTitle>
                                    <CardDescription>Update your basic profile information seen by your students.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b">
                                        <div className="relative group">
                                            <Avatar className="h-24 w-24 border-4 border-muted">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback className="text-2xl">{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-center sm:text-left">
                                            <h3 className="font-bold text-lg">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.role.toUpperCase()} • {user.email}</p>
                                            <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">ID: {user.customId}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={user.name || ''}
                                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={user.email || ''}
                                                disabled
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    className="pl-9"
                                                    value={user.phone || ''}
                                                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select
                                                value={user.gender || ''}
                                                onValueChange={(val) => setUser({ ...user, gender: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">About Me (Bio)</Label>
                                        <Textarea
                                            id="bio"
                                            placeholder="Write a short biography about your teaching journey..."
                                            className="min-h-[120px] resize-none"
                                            value={user.bio || ''}
                                            onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Tip: This is visible on your teacher profile for students and schools.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-[#0077B5]" />
                                                <Input
                                                    id="linkedin"
                                                    className="pl-9"
                                                    placeholder="https://linkedin.com/in/..."
                                                    value={user.linkedInUrl || ''}
                                                    onChange={(e) => setUser({ ...user, linkedInUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="twitter">Twitter Profile URL</Label>
                                            <div className="relative">
                                                <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-[#1DA1F2]" />
                                                <Input
                                                    id="twitter"
                                                    className="pl-9"
                                                    placeholder="https://twitter.com/..."
                                                    value={user.twitterUrl || ''}
                                                    onChange={(e) => setUser({ ...user, twitterUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Personal Website/Portfolio</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="website"
                                                    className="pl-9"
                                                    placeholder="https://yourportfolio.com"
                                                    value={user.websiteUrl || ''}
                                                    onChange={(e) => setUser({ ...user, websiteUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="px-6 py-4 bg-muted/20 border-t flex justify-end">
                                    <Button type="submit" disabled={isSaving} className="gap-2">
                                        {isSaving ? <span className="animate-spin mr-1">⌛</span> : <Save className="h-4 w-4" />}
                                        Save Profile Changes
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </TabsContent>

                    <TabsContent value="professional">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Educational Background</CardTitle>
                                    <CardDescription>Details about your academic qualifications.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="degree">Highest Degree</Label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="degree"
                                                    className="pl-9"
                                                    placeholder="e.g. M.Sc in Computer Science"
                                                    value={user.degree || ''}
                                                    onChange={(e) => setUser({ ...user, degree: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="institution">Institution / University</Label>
                                            <Input
                                                id="institution"
                                                placeholder="e.g. Stanford University"
                                                value={user.institution || ''}
                                                onChange={(e) => setUser({ ...user, institution: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="qualifications">Additional Certifications & Qualifications</Label>
                                        <Textarea
                                            id="qualifications"
                                            placeholder="List any other relevant certifications..."
                                            value={user.qualifications || ''}
                                            onChange={(e) => setUser({ ...user, qualifications: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">Work Experience & Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Primary Specialization</Label>
                                            <Input
                                                id="specialization"
                                                placeholder="e.g. Robotics & Machine Learning"
                                                value={user.specialization || ''}
                                                onChange={(e) => setUser({ ...user, specialization: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="experience">Years of Teaching Experience</Label>
                                            <Input
                                                id="experience"
                                                type="number"
                                                placeholder="Total years of experience"
                                                value={user.experience || ''}
                                                onChange={(e) => setUser({ ...user, experience: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="px-6 py-4 bg-muted/20 border-t flex justify-end">
                                    <Button type="submit" disabled={isSaving} className="gap-2">
                                        {isSaving ? <span className="animate-spin mr-1">⌛</span> : <Save className="h-4 w-4" />}
                                        Update Professional Details
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </TabsContent>

                    <TabsContent value="availability">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Work Status & Availability</CardTitle>
                                    <CardDescription>Manage how students perceive your availability for live sessions or support.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <div className="space-y-2">
                                                <Label htmlFor="availability">Employment Availability</Label>
                                                <Select
                                                    value={user.availability || 'Full-time'}
                                                    onValueChange={(val) => setUser({ ...user, availability: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Full-time">Full-time Employee</SelectItem>
                                                        <SelectItem value="Part-time">Part-time (Selected Hours)</SelectItem>
                                                        <SelectItem value="Freelance">Freelance Contractor</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-700 rounded-md text-sm border border-blue-200">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>This helps schools assign you suitable batches.</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                            <div className="space-y-2">
                                                <Label htmlFor="availabilityStatus">Live Presence Status</Label>
                                                <Select
                                                    value={user.availabilityStatus || 'available'}
                                                    onValueChange={(val) => setUser({ ...user, availabilityStatus: val })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="available">🟢 Available Now</SelectItem>
                                                        <SelectItem value="busy">🟡 Currently Busy</SelectItem>
                                                        <SelectItem value="offline">⚪ Offline / On Vacation</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <p className="text-xs text-muted-foreground italic">Students will see this on the live support portal.</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="px-6 py-4 bg-muted/20 border-t flex justify-end">
                                    <Button type="submit" disabled={isSaving} className="gap-2">
                                        {isSaving ? <span className="animate-spin mr-1">⌛</span> : <Save className="h-4 w-4" />}
                                        Update Availability
                                    </Button>
                                </div>
                            </Card>
                        </form>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Security & Password</CardTitle>
                                    <CardDescription>Enhance your account security with a strong password.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current">Current Password</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                placeholder="Enter your current password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="new">New Password</Label>
                                                <Input
                                                    id="new"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Create a new secure password"
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm">Confirm New Password</Label>
                                                <Input
                                                    id="confirm"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Repeat the new password"
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                {showPassword ? 'Hide visualization' : 'Show password text'}
                                            </button>
                                            <Button type="submit" disabled={isSaving || !passwords.current || !passwords.new}>Update Account Password</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
