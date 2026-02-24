'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { Teacher } from '@/types/user';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { logActivity } from './activity.actions';
import { revalidatePath } from 'next/cache';

const scrubTeacher = (doc: any) => {
    const obj = cleanSanityDoc(doc);
    if (obj) {
        delete obj.password;
    }
    return obj;
}

export async function getAllTeachers(): Promise<Teacher[]> {
    try {
        const teachers = await sanityClient.fetch(`*[_type == "user" && role == "teacher"] | order(createdAt desc)`);
        return cleanSanityDoc(teachers) as Teacher[];
    } catch (e) {
        console.error("Get All Teachers Error:", e);
        return [];
    }
}

export async function createTeacher(data: Partial<Teacher>): Promise<Teacher | null> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        if (!data.email) throw new Error("Email is required");

        const existing = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: data.email }
        );
        if (existing) {
            throw new Error(`Teacher with email ${data.email} already exists.`);
        }

        const customId = `tch-${Date.now()}`;
        const hashedPassword = await bcrypt.hash(data.password || 'teacher123', 10);

        const newTeacher = await sanityWriteClient.create({
            _type: 'user',
            ...data,
            customId,
            password: hashedPassword,
            role: 'teacher',
            status: 'active',
            createdAt: new Date().toISOString()
        });

        await logActivity(session.user.id, 'TEACHER_CREATE', `Created teacher: ${data.name} (${customId})`);

        revalidatePath('/admin/teachers');
        return scrubTeacher(newTeacher) as Teacher;
    } catch (e: any) {
        console.error("Create Teacher Error:", e);
        throw e;
    }
}

export async function updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | null> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.id !== id)) {
        throw new Error("Unauthorized");
    }
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        if (!teacher) throw new Error("Teacher not found");

        if (data.email) {
            if (!data.email) throw new Error("Email cannot be empty");
            const existing = await sanityClient.fetch(
                `*[_type == "user" && email == $email && _id != $currentId][0]`,
                { email: data.email, currentId: teacher._id }
            );
            if (existing) {
                throw new Error(`Email ${data.email} is already taken.`);
            }
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updated = await sanityWriteClient
            .patch(teacher._id)
            .set(data)
            .commit();

        await logActivity(session.user.id, 'TEACHER_UPDATE', `Updated teacher: ${id}`);

        revalidatePath('/admin/teachers');
        return scrubTeacher(updated) as Teacher;
    } catch (e: any) {
        console.error("Update Teacher Error:", e);
        throw e;
    }
}

export async function deleteTeacher(id: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (teacher) {
            await sanityWriteClient.delete(teacher._id);
            await logActivity(session.user.id, 'TEACHER_DELETE', `Deleted teacher: ${id}`);
            revalidatePath('/admin/teachers');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Teacher Error:", e);
        return false;
    }
}

export async function assignSchools(teacherId: string, schoolIds: string[]): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]{_id}`,
            { id: teacherId }
        );
        if (!teacher) return false;

        await sanityWriteClient
            .patch(teacher._id)
            .set({ assignedSchools: schoolIds })
            .commit();

        return true;
    } catch (e) {
        console.error("Assign Schools Error:", e);
        return false;
    }
}

export async function getTeacherCoursesData(teacherId: string) {
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]`,
            { id: teacherId }
        );
        if (!teacher) throw new Error("Teacher not found");

        const teacherRef = teacher._id;
        const courses = await sanityClient.fetch(
            `*[_type == "course" && instructor._ref == $teacherRef]`,
            { teacherRef }
        );

        const courseIds = courses.map((c: any) => c._id);
        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && courseRef._ref in $courseIds]`,
            { courseIds }
        );

        return courses.map((c: any) => {
            const courseEnrolls = enrollments.filter((e: any) => e.courseRef?._ref === c._id);
            const completed = courseEnrolls.filter((e: any) => e.status === 'Completed').length;
            const progressSum = courseEnrolls.reduce((acc: number, e: any) => acc + (e.progress || 0), 0);
            return {
                id: c.customId || c._id,
                title: c.title,
                grade: c.grade || 'N/A',
                students: courseEnrolls.length,
                lessons: c.lessons || 0,
                completed: completed,
                progress: courseEnrolls.length > 0 ? Math.round(progressSum / courseEnrolls.length) : 0,
                status: c.status || 'active'
            };
        });
    } catch (e) {
        console.error("Error fetching teacher courses: ", e);
        return [];
    }
}

export async function getTeacherMaterialsData(teacherId: string) {
    try {
        const materials = await sanityClient.fetch(`
            *[_type == "material" && instructor == $teacherId] | order(_createdAt desc){
               _id, title, course, type, size, _createdAt
            }
        `, { teacherId });

        return materials.map((m: any) => ({
            id: m._id,
            name: m.title,
            course: m.course || 'Unknown',
            type: m.type || 'PDF',
            size: m.size || '0 MB',
            uploaded: m._createdAt
        }));
    } catch (e) {
        console.error("Error fetching teacher materials:", e);
        return [];
    }
}

export async function getTeacherStudentsData(teacherId: string) {
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]`,
            { id: teacherId }
        );
        if (!teacher) throw new Error("Teacher not found");

        const courses = await sanityClient.fetch(
            `*[_type == "course" && instructor._ref == $teacherRef]{_id, title}`,
            { teacherRef: teacher._id }
        );
        const courseIds = courses.map((c: any) => c._id);
        const courseMap = Object.fromEntries(courses.map((c: any) => [c._id, c.title]));

        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && courseRef._ref in $courseIds]{
                progress, status, courseRef, student
            }`,
            { courseIds }
        );

        const studentIds = Array.from(new Set(enrollments.map((e: any) => e.student)));
        const students = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && (customId in $ids || _id in $ids)]{
                _id, customId, name, email, grade, status
            }`,
            { ids: studentIds }
        );

        const result: any[] = [];
        enrollments.forEach((e: any) => {
            const student = students.find((s: any) => s.customId === e.student || s._id === e.student);
            if (student) {
                result.push({
                    id: student.customId || student._id,
                    name: student.name,
                    email: student.email,
                    grade: student.grade || 'N/A',
                    course: courseMap[e.courseRef?._ref] || 'Unknown',
                    progress: e.progress || 0,
                    status: student.status || 'active'
                });
            }
        });

        return result;
    } catch (e) {
        console.error("Error fetching teacher students:", e);
        return [];
    }
}

export async function getTeacherReportsData(teacherId: string) {
    try {
        const teacher = await sanityClient.fetch(
            `*[_type == "user" && role == "teacher" && (customId == $id || _id == $id)][0]`,
            { id: teacherId }
        );
        if (!teacher) throw new Error("Teacher not found");

        const teacherRef = teacher._id;
        const courses = await sanityClient.fetch(
            `*[_type == "course" && instructor._ref == $teacherRef]`,
            { teacherRef }
        );

        const courseIds = courses.map((c: any) => c._id);
        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && courseRef._ref in $courseIds]`,
            { courseIds }
        );

        let totalCompletions = 0;
        let progressSum = 0;

        enrollments.forEach((e: any) => {
            if (e.status === 'Completed') totalCompletions++;
            progressSum += (e.progress || 0);
        });

        const avgScore = enrollments.length > 0 ? Math.round(progressSum / enrollments.length) : 0;

        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        const monthlyStats = months.map(m => ({
            name: m,
            students: Math.floor(Math.random() * 50) + 50,
            completions: Math.floor(Math.random() * 20) + 5
        }));

        const coursePerformance = courses.map((c: any) => {
            const courseEnrolls = enrollments.filter((e: any) => e.courseRef?._ref === c._id);
            const courseCompleted = courseEnrolls.filter((e: any) => e.status === 'Completed').length;
            const courseProgSum = courseEnrolls.reduce((acc: number, e: any) => acc + (e.progress || 0), 0);
            return {
                name: c.title,
                avgScore: courseEnrolls.length > 0 ? Math.round(courseProgSum / courseEnrolls.length) : 0,
                completion: courseEnrolls.length > 0 ? Math.round((courseCompleted / courseEnrolls.length) * 100) : 0
            };
        });

        return {
            totalStudents: Array.from(new Set(enrollments.map((e: any) => e.student))).length,
            totalCourses: courses.length,
            totalCompletions,
            avgScore,
            monthlyStats,
            coursePerformance
        };
    } catch (e) {
        console.error("Error fetching teacher reports:", e);
        return {
            totalStudents: 0,
            totalCourses: 0,
            totalCompletions: 0,
            avgScore: 0,
            monthlyStats: [],
            coursePerformance: []
        };
    }
}

export async function createMaterial(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
        throw new Error("Unauthorized");
    }
    try {
        const material = await sanityWriteClient.create({
            _type: 'material',
            ...data,
            instructor: session.user.id,
            _createdAt: new Date().toISOString()
        });
        revalidatePath('/teacher/materials');
        return material;
    } catch (e) {
        console.error("Create Material Error:", e);
        throw e;
    }
}

export async function deleteMaterial(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'teacher') {
        throw new Error("Unauthorized");
    }
    try {
        await sanityWriteClient.delete(id);
        revalidatePath('/teacher/materials');
        return true;
    } catch (e) {
        console.error("Delete Material Error:", e);
        throw e;
    }
}
