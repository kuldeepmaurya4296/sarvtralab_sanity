'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Phone, Mail, GraduationCap, Building2, MapPin, ShieldCheck } from 'lucide-react';
import { getPublicSchools } from '@/lib/actions/school.actions';
import { completeStudentProfile } from '@/lib/actions/student.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProfileCompletionDialogProps {
    user: any;
    isOpen: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    description?: string;
    buttonText?: string;
}

export default function ProfileCompletionDialog({
    user,
    isOpen,
    onOpenChange,
    title = "One last step...",
    description = "Please provide your details to access the full features of the Sarvtra Labs platform.",
    buttonText = "Complete My Profile"
}: ProfileCompletionDialogProps) {
    const router = useRouter();
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);
    const [isLoadingSchools, setIsLoadingSchools] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        schoolId: user?.schoolId || '',
        schoolName: user?.schoolName || '',
        grade: user?.grade || '',
        parentName: user?.parentName || '',
        parentPhone: user?.parentPhone || '',
        parentEmail: user?.parentEmail || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || '',
    });

    // Update formData if user prop changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                schoolId: user.schoolId || prev.schoolId,
                schoolName: user.schoolName || prev.schoolName,
                grade: user.grade || prev.grade,
                parentName: user.parentName || prev.parentName,
                parentPhone: user.parentPhone || prev.parentPhone,
                parentEmail: user.parentEmail || prev.parentEmail,
                address: user.address || prev.address,
                city: user.city || prev.city,
                state: user.state || prev.state,
                pincode: user.pincode || prev.pincode,
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const data = await getPublicSchools();
                setSchools(data as any);
            } catch (error) {
                console.error("Failed to fetch schools:", error);
            } finally {
                setIsLoadingSchools(false);
            }
        };
        if (isOpen) {
            fetchSchools();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'schoolId') {
            if (value === 'independent') {
                setFormData({ ...formData, schoolId: 'no_school', schoolName: 'Independent Learner' });
            } else {
                const school = schools.find(s => s.id === value || s._id === value);
                setFormData({ ...formData, schoolId: value, schoolName: school?.name || '' });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const requiredFields = [
            'name', 'email', 'phone', 'schoolName', 'grade',
            'parentName', 'parentPhone', 'parentEmail',
            'address', 'city', 'state', 'pincode'
        ];

        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                toast.error(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }
        }

        setIsLoading(true);
        try {
            const result = await completeStudentProfile(user.id, formData);
            if (result.success) {
                toast.success('Profile updated successfully!');

                // Update local session immediately
                const updatePayload = {
                    ...formData,
                    profileCompleted: true
                };
                await update(updatePayload);

                if (onOpenChange) {
                    onOpenChange(false);
                } else {
                    router.refresh();
                    setTimeout(() => window.location.reload(), 500);
                }
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background shadow-2xl rounded-2xl">
                <div className="bg-primary px-8 py-10 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10">
                        <DialogHeader className="text-left space-y-2">
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Complete Your Profile
                            </div>
                            <DialogTitle className="text-3xl font-bold tracking-tight">{title}</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 text-lg">
                                {description}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Student Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit phone number"
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    readOnly
                                    className="bg-muted text-muted-foreground"
                                />
                                <p className="text-[10px] text-muted-foreground ml-1 italic">Email cannot be changed after registration</p>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Academic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="school">School / Institution</Label>
                                <Select
                                    onValueChange={(val) => handleSelectChange('schoolId', val)}
                                    value={formData.schoolId === 'no_school' || formData.schoolName === 'Independent Learner' ? 'independent' : formData.schoolId}
                                >
                                    <SelectTrigger id="school" className="w-full">
                                        <SelectValue placeholder={isLoadingSchools ? "Loading schools..." : "Select your school"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="independent">I am an Independent Learner</SelectItem>
                                        {schools.map((school) => (
                                            <SelectItem key={school.id || school._id} value={school.id || school._id}>
                                                {school.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grade">Current Grade / Class</Label>
                                <Select
                                    onValueChange={(val) => handleSelectChange('grade', val)}
                                    value={formData.grade}
                                >
                                    <SelectTrigger id="grade">
                                        <SelectValue placeholder="Select Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'College/University', 'Professional'].map((g) => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Guardian Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Guardian Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="parentName">Guardian's Full Name</Label>
                                <Input
                                    id="parentName"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleChange}
                                    placeholder="Enter parent/guardian's name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentPhone">Guardian's Phone</Label>
                                <Input
                                    id="parentPhone"
                                    name="parentPhone"
                                    value={formData.parentPhone}
                                    onChange={handleChange}
                                    placeholder="Guardian's contact number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentEmail">Guardian's Email</Label>
                                <Input
                                    id="parentEmail"
                                    name="parentEmail"
                                    type="email"
                                    value={formData.parentEmail}
                                    onChange={handleChange}
                                    placeholder="Guardian's email address"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Location Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="address">Full Address</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="House No, Street, Landmark..."
                                    className="min-h-[80px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="Enter 6-digit pincode"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 mt-8 border-t">
                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold gap-2 rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving your details...
                                </>
                            ) : (
                                buttonText
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
