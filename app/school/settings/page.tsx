'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    User,
    Lock,
    Bell,
    Shield,
    Save,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getSchoolById, updateSchoolSettings, changeSchoolPassword } from '@/lib/actions/school.actions';

export default function SchoolSettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [schoolData, setSchoolData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // General Settings State
    const [generalForm, setGeneralForm] = useState({
        name: '',
        principalName: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        state: '',
        pincode: ''
    });

    // Password Settings State
    const [passForm, setPassForm] = useState({
        currentPass: '',
        newPass: '',
        confirmPass: ''
    });

    useEffect(() => {
        const fetchSchool = async () => {
            if (user?.id) {
                try {
                    const data = await getSchoolById(user.id);
                    if (data) {
                        setSchoolData(data);
                        setGeneralForm({
                            name: data.name || '',
                            principalName: data.principalName || '',
                            email: data.email || '',
                            phone: data.phone || '',
                            city: data.city || '',
                            address: data.address || '',
                            state: data.state || '',
                            pincode: data.pincode || ''
                        });
                    }
                } catch (error) {
                    console.error("Error fetching school settings:", error);
                    toast.error("Failed to load school settings.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (user && !authLoading) {
            fetchSchool();
        }
    }, [user, authLoading]);

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGeneralForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleGeneralSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const updated = await updateSchoolSettings(user.id, generalForm);
            if (updated) {
                setSchoolData(updated);
                toast.success("General settings updated successfully.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePassSave = async () => {
        if (!user?.id) return;
        if (passForm.newPass !== passForm.confirmPass) {
            toast.error("New passwords do not match.");
            return;
        }
        if (passForm.newPass.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await changeSchoolPassword(user.id, passForm.currentPass, passForm.newPass);
            if (res.success) {
                toast.success(res.message);
                setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to change password.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading School Settings...</p>
            </div>
        );
    }

    if (!user || user.role !== 'school') return null;

    return (
        <DashboardLayout role="school" userName={schoolData?.principalName || user.name} userEmail={user.email}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Settings className="h-6 w-6 text-primary" />
                            Settings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your school profile, branding, and security preferences.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="general" className="gap-2">
                            <User className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 transition-all duration-300">
                        <Card className="border-primary/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">School Information</CardTitle>
                                <CardDescription>
                                    Update your school&apos;s basic contact and identity details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold">School Name</Label>
                                        <Input
                                            id="name"
                                            value={generalForm.name}
                                            onChange={handleGeneralChange}
                                            placeholder="Enter school name"
                                            className="focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="schoolCode" className="text-sm font-semibold">School Code</Label>
                                        <Input
                                            id="schoolCode"
                                            value={schoolData?.schoolCode || 'N/A'}
                                            disabled
                                            className="bg-muted cursor-not-allowed opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="principalName" className="text-sm font-semibold">Principal Name</Label>
                                        <Input
                                            id="principalName"
                                            value={generalForm.principalName}
                                            onChange={handleGeneralChange}
                                            placeholder="Enter principal's name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold">Email (View Only)</Label>
                                        <Input
                                            id="email"
                                            value={generalForm.email}
                                            disabled
                                            className="bg-muted cursor-not-allowed opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={generalForm.phone}
                                            onChange={handleGeneralChange}
                                            placeholder="Enter contact number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                                        <Input
                                            id="city"
                                            value={generalForm.city}
                                            onChange={handleGeneralChange}
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="address" className="text-sm font-semibold">Detailed Address</Label>
                                        <Input
                                            id="address"
                                            value={generalForm.address}
                                            onChange={handleGeneralChange}
                                            placeholder="Enter full school address"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleGeneralSave}
                                        disabled={isSaving}
                                        className="gap-2 min-w-[140px]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-4">
                        <Card className="border-primary/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">School Branding</CardTitle>
                                <CardDescription>
                                    Customize how your school appears to students and staff.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="flex flex-col sm:flex-row items-center gap-8 p-4 bg-muted/30 rounded-xl">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-primary/20 transition-all group-hover:bg-slate-200">
                                            {schoolData?.image ? (
                                                <img src={schoolData.image} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <ImageIcon className="h-10 w-10 text-primary/40" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                            <ImageIcon className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-center sm:text-left">
                                        <Label className="text-base font-semibold">School Logo</Label>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Recommended: Square image, PNG or JPG (Max 2MB). This will be shown on dashboards and reports.
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                            <Button variant="outline" size="sm" className="bg-white">Change Logo</Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5 hover:text-destructive">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-semibold">Platform Theme</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Adjust the primary accent color of your dashboard environment.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 p-2 bg-white rounded-full border shadow-sm">
                                            {['blue', 'green', 'red', 'violet'].map((color) => {
                                                const colors: any = {
                                                    blue: 'bg-blue-600',
                                                    green: 'bg-emerald-600',
                                                    red: 'bg-rose-600',
                                                    violet: 'bg-violet-600'
                                                };
                                                return (
                                                    <div
                                                        key={color}
                                                        className={`w-10 h-10 rounded-full ${colors[color]} cursor-pointer transition-all hover:scale-110 hover:shadow-md ${color === 'blue' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <Card className="border-primary/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Security & Authentication</CardTitle>
                                <CardDescription>
                                    Manage your account password and security preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 max-w-2xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPass" className="text-sm font-semibold">Current Password</Label>
                                        <Input
                                            id="currentPass"
                                            type="password"
                                            value={passForm.currentPass}
                                            onChange={(e) => setPassForm(p => ({ ...p, currentPass: e.target.value }))}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPass" className="text-sm font-semibold">New Password</Label>
                                            <Input
                                                id="newPass"
                                                type="password"
                                                value={passForm.newPass}
                                                onChange={(e) => setPassForm(p => ({ ...p, newPass: e.target.value }))}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPass" className="text-sm font-semibold">Confirm New Password</Label>
                                            <Input
                                                id="confirmPass"
                                                type="password"
                                                value={passForm.confirmPass}
                                                onChange={(e) => setPassForm(p => ({ ...p, confirmPass: e.target.value }))}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-4">
                                    <Shield className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        Changing your password will log you out of all other active sessions. Password must be at least 6 characters long.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handlePassSave}
                                        disabled={isSaving || !passForm.currentPass || !passForm.newPass}
                                        variant="default"
                                        className="gap-2 bg-destructive hover:bg-destructive/90 text-white min-w-[160px]"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lock className="h-4 w-4" />
                                        )}
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/10 bg-destructive/5 shadow-none">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Actions that cannot be undone. Please be careful.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-xl bg-white">
                                    <div>
                                        <p className="font-semibold text-foreground">Sign Out of All Devices</p>
                                        <p className="text-sm text-muted-foreground">Terminate every active session including this one.</p>
                                    </div>
                                    <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/5 shrink-0">
                                        Sign Out Everywhere
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

// Helper icon component for tabs
function AlertTriangle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
