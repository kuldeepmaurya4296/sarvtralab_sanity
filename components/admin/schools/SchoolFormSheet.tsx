'use client';

import { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { School } from '@/types/user';

interface SchoolFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Partial<School> | null;
    mode: 'add' | 'edit';
    onSubmit: (data: any) => void;
}

export function SchoolFormSheet({ open, onOpenChange, initialData, mode, onSubmit }: SchoolFormSheetProps) {
    const defaultForm = {
        name: '',
        email: '',
        password: '',
        schoolCode: '',
        principalName: '',
        schoolType: '',
        board: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        websiteUrl: '',
        subscriptionPlan: ''
    };

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    name: initialData.name || '',
                    email: initialData.email || '',
                    password: '', // Don't show password on edit
                    schoolCode: initialData.schoolCode || '',
                    principalName: initialData.principalName || '',
                    schoolType: initialData.schoolType || '',
                    board: initialData.board || '',
                    address: initialData.address || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    pincode: initialData.pincode || '',
                    phone: initialData.phone || '',
                    websiteUrl: initialData.websiteUrl || '',
                    subscriptionPlan: initialData.subscriptionPlan || ''
                });
            } else {
                setFormData(defaultForm);
            }
        }
    }, [open, mode, initialData]);

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.name || !formData.email || (mode === 'add' && !formData.password)) {
            alert("Name, Email and Password (for new schools) are required");
            return;
        }
        onSubmit(formData);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{mode === 'add' ? 'Add New School' : 'Edit School Details'}</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="name">School Name</Label>
                        <Input id="name" placeholder="Enter school name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="admin@school.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>

                    {mode === 'add' && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Login Password</Label>
                            <Input id="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="code">School Code (Optional)</Label>
                        <Input id="code" placeholder="e.g. SCH-001" value={formData.schoolCode} onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="principal">Principal Name</Label>
                        <Input id="principal" placeholder="Enter principal name" value={formData.principalName} onChange={(e) => setFormData({ ...formData, principalName: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone</Label>
                        <Input id="phone" placeholder="10-digit number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input id="website" placeholder="https://school.edu" value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label>School Type</Label>
                        <Select value={formData.schoolType} onValueChange={(val) => setFormData({ ...formData, schoolType: val })}>
                            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="government">Government</SelectItem>
                                <SelectItem value="aided">Aided</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Board</Label>
                        <Select value={formData.board} onValueChange={(val) => setFormData({ ...formData, board: val })}>
                            <SelectTrigger><SelectValue placeholder="Select Board" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="CBSE">CBSE</SelectItem>
                                <SelectItem value="ICSE">ICSE</SelectItem>
                                <SelectItem value="State Board">State Board</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 col-span-full">
                        <Label htmlFor="address">Full Address</Label>
                        <Input id="address" placeholder="Building, Street, Area" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" placeholder="6-digit ZIP" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label>Subscription Plan</Label>
                        <Select value={formData.subscriptionPlan} onValueChange={(val) => setFormData({ ...formData, subscriptionPlan: val })}>
                            <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter className="mt-6">
                    <Button onClick={handleSubmit} className="w-full sm:w-auto">
                        {mode === 'add' ? 'Create School' : 'Save Changes'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
