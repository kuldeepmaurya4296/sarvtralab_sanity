'use client';

import { User, MapPin, Mail, Phone, GraduationCap, BookOpen, Calendar, School as SchoolIcon } from 'lucide-react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Student } from '@/types/user';

interface GovtStudentViewSheetProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GovtStudentViewSheet({ student, open, onOpenChange }: GovtStudentViewSheetProps) {
    if (!student) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Student Profile</SheetTitle>
                    <SheetDescription>Complete student details and academic record</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                            <AvatarFallback className="text-lg font-bold">{(student.name || 'ST').substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{student.name}</h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">ID: {student.customId || student.id}</p>
                            <div className="flex gap-2 mt-2">
                                {student.grade && <Badge variant="secondary">{student.grade}</Badge>}
                                <Badge variant={student.status === 'active' ? 'default' : 'outline'} className={student.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                                    {student.status || 'Active'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* School Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><SchoolIcon className="h-4 w-4 text-muted-foreground" /> School Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">School Name</span>
                                <span className="text-sm font-medium">{student.schoolName || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Grade / Class</span>
                                <span className="text-sm font-medium">{student.grade || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Personal Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Personal Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Email</span>
                                <span className="text-sm font-medium break-all">{student.email || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Phone</span>
                                <span className="text-sm font-medium">{student.phone || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Date of Birth</span>
                                <span className="text-sm font-medium">
                                    {student.dateOfBirth || student.dob
                                        ? new Date(student.dateOfBirth || student.dob || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Gender</span>
                                <span className="text-sm font-medium capitalize">{student.gender || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parent/Guardian */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Parent / Guardian</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Parent Name</span>
                                <span className="text-sm font-medium">{student.parentName || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Parent Phone</span>
                                <span className="text-sm font-medium">{student.parentPhone || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3 col-span-1 sm:col-span-2">
                                <span className="text-xs text-muted-foreground block">Parent Email</span>
                                <span className="text-sm font-medium break-all">{student.parentEmail || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Address</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 border rounded-md p-3 col-span-1 sm:col-span-2">
                                <span className="text-xs text-muted-foreground block">Full Address</span>
                                <span className="text-sm font-medium">{student.address || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">City</span>
                                <span className="text-sm font-medium">{student.city || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">State</span>
                                <span className="text-sm font-medium">{student.state || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Pincode</span>
                                <span className="text-sm font-medium">{student.pincode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Academic */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /> Academic Progress</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Enrolled Courses</span>
                                <span className="text-2xl font-bold block mt-1">{student.enrolledCourses?.length || 0}</span>
                            </div>
                            <div className="border rounded-md p-3">
                                <span className="text-xs text-muted-foreground block">Completed Courses</span>
                                <span className="text-2xl font-bold block mt-1">{student.completedCourses?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Created At */}
                    {student.createdAt && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Joined on {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
