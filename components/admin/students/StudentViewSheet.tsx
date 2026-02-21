
'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { Student } from '@/types/user';
import { StudentProfileTab } from './tabs/StudentProfileTab';
import { StudentPerformanceTab } from './tabs/StudentPerformanceTab';
import { StudentCertificatesTab } from './tabs/StudentCertificatesTab';
import { getStudentFullDetails } from '@/lib/actions/student.actions';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface StudentViewSheetProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
}

export function StudentViewSheet({ student, open, onOpenChange, onEdit, onDelete }: StudentViewSheetProps) {
    const [fullDetails, setFullDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            if (!student || !open) return;
            setLoading(true);
            try {
                const details = await getStudentFullDetails(student.id || student._id || '');
                setFullDetails(details);
            } catch (error) {
                console.error("Error loading student details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (open && student) loadDetails();
        else if (!open) setFullDetails(null);
    }, [open, student]);

    if (!student) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Student Details</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full">
                    <div className="pb-8">
                        <div className="bg-muted/30 p-6 border-b">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-xl font-bold">{student.name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            {student.email}
                                        </div>
                                        <span className="hidden sm:inline">•</span>
                                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="capitalize w-fit">
                                            {student.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="profile" className="w-full">
                            <div className="px-6 pt-4">
                                <TabsList className="w-full grid grid-cols-3">
                                    <TabsTrigger value="profile">Profile Overview</TabsTrigger>
                                    <TabsTrigger value="performance">Performance</TabsTrigger>
                                    <TabsTrigger value="certificates">Certificates</TabsTrigger>
                                </TabsList>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground italic">Fetching real-time data from database...</p>
                                </div>
                            ) : (
                                <>
                                    <TabsContent value="profile" className="p-6 space-y-8 mt-0">
                                        <StudentProfileTab
                                            student={fullDetails || student}
                                            onEdit={() => {
                                                onOpenChange(false);
                                                onEdit(student);
                                            }}
                                            onDelete={() => {
                                                onOpenChange(false);
                                                onDelete(student);
                                            }}
                                        />
                                    </TabsContent>

                                    <TabsContent value="performance" className="p-6 space-y-8 mt-0">
                                        <StudentPerformanceTab student={fullDetails || student} />
                                    </TabsContent>

                                    <TabsContent value="certificates" className="p-6 space-y-6 mt-0">
                                        <StudentCertificatesTab student={fullDetails || student} />
                                    </TabsContent>
                                </>
                            )}
                        </Tabs>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
