'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Settings, User, Lock, Save, Eye, EyeOff, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSupportProfile, updateSupportProfile } from '@/lib/actions/support.actions';

export default function HelpSupportSettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        status: '',
        city: '',
        state: '',
        address: '',
        pincode: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'helpsupport')) {
            router.push('/login');
        } else if (user && user.role === 'helpsupport') {
            fetchProfile();
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        try {
            const data = await getSupportProfile();
            if (data) {
                setForm({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    department: data.department || 'general',
                    status: data.status || 'available',
                    city: data.city || '',
                    state: data.state || '',
                    address: data.address || '',
                    pincode: data.pincode || ''
                });
            }
        } catch (error) {
            toast.error("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateSupportProfile(form);
            toast.success("Profile updated perfectly!");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setIsSaving(true);
        try {
            await updateSupportProfile({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password updated perfectly!");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'helpsupport') return null;

    return (
        <DashboardLayout role="helpsupport" userName={user.name || form.name || ''} userEmail={user.email || form.email || ''}>
            <div className="space-y-6 max-w-3xl">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Settings className="h-6 w-6 text-primary" /> Settings
                    </h1>
                    <p className="text-muted-foreground">Manage your support account and details</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
                        <CardDescription>Update your personal and work details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled />
                                <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dept">Department</Label>
                                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical Support</SelectItem>
                                        <SelectItem value="academic">Academic Support</SelectItem>
                                        <SelectItem value="billing">Billing & Accounts</SelectItem>
                                        <SelectItem value="general">General Inquiry</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Availability Status</Label>
                            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">🟢 Available</SelectItem>
                                    <SelectItem value="busy">🟡 Busy</SelectItem>
                                    <SelectItem value="offline">🔴 Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 pb-2">
                            <h4 className="flex items-center gap-2 text-sm font-semibold mb-3"><MapPin className="h-4 w-4" /> Location Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-1 sm:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your full address" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input id="pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2 mt-4"><Save className="h-4 w-4" /> Save Profile Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">Current Password</Label>
                            <Input id="current" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input id="new" type={showPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input id="confirm" type={showPassword ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={handleSavePassword} disabled={isSaving} className="gap-2"><Save className="h-4 w-4" /> Update Password</Button>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
