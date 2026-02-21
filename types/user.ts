
export type UserRole = 'student' | 'teacher' | 'school' | 'admin' | 'superadmin' | 'govt' | 'helpsupport';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
    createdAt?: string;
    phone?: string;
    password?: string;
    profileCompleted?: boolean;
}

export interface Student extends User {
    role: 'student';
    gender?: string;
    grade?: string;
    schoolId?: string;
    schoolName?: string;
    parentName?: string;
    parentPhone?: string;
    enrolledCourses?: string[];
    address?: string;
    dob?: string;
    customId?: string;
    status?: 'active' | 'inactive';
    completedCourses?: string[];
    parentEmail?: string;
    dateOfBirth?: string;
    city?: string;
    state?: string;
    pincode?: string;
    profileCompleted?: boolean;
    enrollments?: any[];
    attendance?: any[];
    submissions?: any[];
    certificates?: any[];
}

export interface Teacher extends User {
    role: 'teacher';
    customId?: string;
    specialization: string;
    qualifications?: string;
    experience?: number;
    bio?: string;
    assignedSchools?: string[];
    assignedCourses?: string[];
    status?: 'active' | 'inactive';
}

export interface School extends User {
    role: 'school';
    principalName?: string;
    totalStudents?: number;
    address?: string;
    isPartner?: boolean;
    planId?: string;
    city?: string;
    state?: string;
    schoolCode?: string;
    schoolType?: string;
    board?: string;
    pincode?: string;
    websiteUrl?: string;
    assignedCourses?: string[];
    subscriptionPlan?: string;
    subscriptionExpiry?: string;
    status?: 'active' | 'inactive';
    customId?: string;
}

export interface GovtOrg extends User {
    role: 'govt';
    organizationType?: string;
    organizationName: string;
    designation?: string;
    department: string;
    jurisdiction?: string;
    state?: string;
    district?: string;
    assignedSchools?: string[];
    status?: 'active' | 'inactive';
}

export interface SuperAdmin extends User {
    role: 'superadmin';
}
