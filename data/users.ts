export type UserRole = 'student' | 'school' | 'govt' | 'superadmin' | 'admin' | 'teacher' | 'helpsupport';

export interface User {
  id: string;
  customId?: string;
  _id?: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  schoolId: string;
  schoolName: string;
  grade: string;
  enrolledCourses: string[];
  completedCourses: string[];
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'active' | 'inactive';
}

export interface School extends User {
  role: 'school';
  schoolCode: string;
  principalName: string;
  schoolType: 'government' | 'private' | 'aided';
  board: 'CBSE' | 'ICSE' | 'State Board';
  totalStudents: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  websiteUrl?: string;
  subscriptionPlan: 'basic' | 'standard' | 'premium';
  subscriptionExpiry: string;
  assignedCourses: string[];
}

export interface GovtOrg extends User {
  role: 'govt';
  organizationType: 'education_dept' | 'skill_ministry' | 'niti_aayog' | 'other';
  organizationName: string;
  designation: string;
  department: string;
  jurisdiction: 'national' | 'state' | 'district';
  state?: string;
  district?: string;
  assignedSchools: string[];
  status: 'active' | 'inactive';
}

export interface SuperAdmin extends User {
  role: 'superadmin';
  permissions: string[];
  lastLogin: string;
}

export interface Teacher extends User {
  role: 'teacher';
  specialization: string;
  qualifications: string;
  assignedCourses: string[];
  assignedSchools: string[];
  experience: number;
  phone: string;
  status: 'active' | 'inactive';
}

export interface HelpSupport extends User {
  role: 'helpsupport';
  department: 'technical' | 'academic' | 'general';
  assignedStudents: string[];
  ticketsResolved: number;
  ticketsPending: number;
  phone: string;
  status: 'available' | 'busy' | 'offline';
}

// Mock data cleared - Now using Sanity CMS
export const mockStudents: Student[] = [];
export const mockSchools: School[] = [];
export const mockGovtOrgs: GovtOrg[] = [];
export const mockSuperAdmin: SuperAdmin = {} as any;
export const mockTeachers: Teacher[] = [];
export const mockHelpSupport: HelpSupport[] = [];
export const mockSupportTickets: any[] = [];

export const loginCredentials = [
  { role: 'student', email: 'arjun.patel@student.sarvtralab.in', password: 'student123' },
  { role: 'school', email: 'admin@dpsnoida.edu.in', password: 'school123' },
  { role: 'govt', email: 'director@education.gov.in', password: 'govt123' },
  { role: 'superadmin', email: 'superadmin@sarvtralab.in', password: 'admin123' },
  { role: 'teacher', email: 'vikram.sharma@sarvtralab.in', password: 'teacher123' },
  { role: 'helpsupport', email: 'support.rahul@sarvtralab.in', password: 'support123' }
];
