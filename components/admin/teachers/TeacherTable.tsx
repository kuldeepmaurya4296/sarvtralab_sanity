'use client';

import {
    MoreVertical,
    School,
    Edit,
    Eye,
    Trash2,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Teacher, School as SchoolType } from '@/data/users';

interface TeacherTableProps {
    teachers: Teacher[];
    schools: SchoolType[];
    onView: (teacher: Teacher) => void;
    onEdit: (teacher: Teacher) => void;
    onDelete: (teacher: Teacher) => void;
    onAssign: (teacher: Teacher) => void;
}

export function TeacherTable({ teachers, schools, onView, onEdit, onDelete, onAssign }: TeacherTableProps) {
    const getSchoolNames = (schoolIds: string[]) => {
        if (!schoolIds || schoolIds.length === 0) return 'None';
        return schoolIds.map(id => {
            const school = schools.find(s => s.id === id || (s as any)._id === id || (s as any).customId === id);
            return school?.name || id;
        }).join(', ');
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Assigned Schools</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teachers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No teachers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        teachers.map((teacher) => (
                            <TableRow
                                key={teacher.id || teacher.customId || teacher._id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={(e) => {
                                    if ((e.target as any).closest('.action-btn')) return;
                                    onView(teacher);
                                }}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} alt={teacher.name} />
                                            <AvatarFallback>{teacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{teacher.name}</span>
                                            <span className="text-xs text-muted-foreground">{teacher.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{teacher.specialization}</span>
                                        <span className="text-xs text-muted-foreground">{teacher.qualifications}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{teacher.experience} Years</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-muted-foreground text-sm max-w-[200px] truncate" title={getSchoolNames(teacher.assignedSchools)}>
                                        <School className="h-3 w-3 inline mr-1" />
                                        {getSchoolNames(teacher.assignedSchools)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {teacher.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 action-btn">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher.id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onView(teacher)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(teacher)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onAssign(teacher)}>
                                                <School className="mr-2 h-4 w-4" /> Assign Schools
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(teacher)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Deactivate Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
