'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import bcrypt from 'bcryptjs';
import { logActivity } from './activity.actions';

const scrubStudent = (doc: any) => {
    const obj = cleanSanityDoc(doc);
    if (obj) {
        delete obj.password;
    }
    return obj;
}

export async function getAllStudents() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.role !== 'school')) {
        throw new Error("Unauthorized");
    }
    try {
        let query = `*[_type == "user" && role == "student"]`;
        let params = {};

        // If it's a school admin, only return students from their school
        if (session.user.role === 'school') {
            const user = session.user as any;
            if (!user.schoolId) return [];
            query = `*[_type == "user" && role == "student" && (schoolRef._ref == $schoolId || schoolId == $schoolId)]`;
            params = { schoolId: user.schoolId };
        }

        const students = await sanityClient.fetch(query + ` | order(createdAt desc)`, params);
        return cleanSanityDoc(students);
    } catch (e) {
        console.error("Get All Students Error:", e);
        return [];
    }
}

export async function createStudent(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.role !== 'school')) {
        throw new Error("Unauthorized");
    }
    try {
        if (!data.email) throw new Error("Email is required");

        const existing = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: data.email }
        );
        if (existing) {
            throw new Error(`User with email ${data.email} already exists.`);
        }

        const hashedPassword = await bcrypt.hash(data.password || 'student123', 10);
        const customId = `usr-${Date.now()}`;

        // Find school reference if schoolId provided
        let schoolRef = undefined;
        if (data.schoolId) {
            const school = await sanityClient.fetch(
                `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]`,
                { id: data.schoolId }
            );
            if (school) {
                schoolRef = { _type: 'reference', _ref: school._id };
            }
        }

        const newStudent = await sanityWriteClient.create({
            _type: 'user',
            ...data,
            customId,
            password: hashedPassword,
            role: 'student',
            schoolRef,
            createdAt: new Date().toISOString()
        });

        await logActivity(session.user.id, 'STUDENT_CREATE', `Created student: ${data.name} (${customId})`);

        return scrubStudent(newStudent);
    } catch (e: any) {
        console.error("Create Student Error:", e);
        throw e;
    }
}

export async function updateStudent(id: string, updates: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.role !== 'school')) {
        throw new Error("Unauthorized");
    }
    try {
        const student = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        if (!student) throw new Error("Student not found");

        if (updates.email) {
            if (!updates.email) throw new Error("Email cannot be empty");
            const existing = await sanityClient.fetch(
                `*[_type == "user" && email == $email && _id != $currentId][0]`,
                { email: updates.email, currentId: student._id }
            );
            if (existing) {
                throw new Error(`Email ${updates.email} is already taken.`);
            }
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updated = await sanityWriteClient
            .patch(student._id)
            .set(updates)
            .commit();

        await logActivity(session.user.id, 'STUDENT_UPDATE', `Updated student: ${id}`);

        return scrubStudent(updated);
    } catch (e: any) {
        console.error("Update Student Error:", e);
        throw e;
    }
}

export async function deleteStudent(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.role !== 'school')) {
        throw new Error("Unauthorized");
    }
    try {
        const student = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        if (student) {
            await sanityWriteClient.delete(student._id);
            await logActivity(session.user.id, 'STUDENT_DELETE', `Deleted student: ${id}`);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Student Error:", e);
        return false;
    }
}

export async function getStudentDashboardStats(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== userId && session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const data = await sanityClient.fetch(`{
            "enrollments": *[_type == "enrollment" && student == $userId]{
                progress,
                watchTime,
                status,
                courseRef->{
                    customId,
                    title,
                    thumbnail,
                    curriculum
                }
            },
            "certificatesCount": count(*[_type == "certificate" && studentId == $userId])
        }`, { userId });

        const enrollments = data.enrollments || [];
        const totalEnrolled = enrollments.length;
        const certificatesCount = data.certificatesCount || 0;

        if (totalEnrolled === 0) {
            return {
                totalEnrolled: 0,
                certificatesCount: 0,
                watchTime: "0 hrs",
                overallProgress: "0%",
                enrolledCourses: []
            };
        }

        const totalProgress = enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0);
        const overallProgress = (totalProgress / totalEnrolled).toFixed(0) + "%";

        const totalWatchMinutes = enrollments.reduce((acc: number, curr: any) => acc + (curr.watchTime || 0), 0);
        const watchTimeStr = `${Math.floor(totalWatchMinutes / 60)} hrs`;

        return {
            totalEnrolled,
            overallProgress,
            watchTime: watchTimeStr,
            certificatesCount,
            enrolledCourses: enrollments.map((e: any) => ({
                id: e.courseRef?.customId,
                title: e.courseRef?.title,
                progress: e.progress || 0,
                thumbnail: e.courseRef?.thumbnail,
                totalLessons: e.courseRef?.curriculum?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0,
                completedLessons: e.completedLessons || 0
            }))
        };
    } catch (e) {
        console.error("Student Dashboard Stats Error:", e);
        return null;
    }
}

export async function getStudentEnrolledCourses(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== userId && session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && student == $userId]{
                _id,
                progress,
                completedLessons,
                status,
                enrolledAt,
                courseRef->{
                    _id,
                    customId,
                    title,
                    thumbnail,
                    description,
                    slug,
                    price,
                    duration,
                    level,
                    category,
                    curriculum,
                    instructorRef->{
                        name
                    }
                }
            }`,
            { userId }
        );

        return enrollments.map((e: any) => ({
            ...(e.courseRef ? cleanSanityDoc(e.courseRef) : { title: 'Course Unavailable', id: null }),
            enrollmentId: e._id,
            isUnavailable: !e.courseRef,
            progress: e.progress || 0,
            completedLessons: e.completedLessons || 0,
            status: e.status,
            enrolledAt: e.enrolledAt
        }));
    } catch (e) {
        console.error("Get Student Enrolled Courses Error:", e);
        return [];
    }
}

export async function removeEnrollment(enrollmentId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    try {
        const enrollment = await sanityClient.fetch(
            `*[_type == "enrollment" && _id == $enrollmentId][0]`,
            { enrollmentId }
        );
        if (!enrollment) throw new Error("Enrollment not found");

        // Only allow student to delete their own, or admin
        if (enrollment.student !== session.user.id && session.user.role !== 'superadmin' && session.user.role !== 'admin') {
            throw new Error("Unauthorized");
        }

        await sanityWriteClient.delete(enrollmentId);
        return { success: true };
    } catch (error: any) {
        console.error("Remove Enrollment Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getUniqueGrades(schoolId: string) {
    try {
        const grades = await sanityClient.fetch(
            `array::unique(*[_type == "user" && role == "student" && (schoolRef._ref == $schoolId || schoolId == $schoolId)].grade)`,
            { schoolId }
        );
        return grades.filter(Boolean);
    } catch (e) {
        console.error("Get Unique Grades Error:", e);
        return [];
    }
}

export async function getStudentById(id: string) {
    try {
        const student = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        return scrubStudent(student);
    } catch (e) {
        console.error("Get Student By Id Error:", e);
        return null;
    }
}

export async function checkEnrollmentStatus(userId: string, courseId: string) {
    try {
        const enrollment = await sanityClient.fetch(
            `*[_type == "enrollment" && student == $userId && (courseRef._ref == $courseId || courseRef->customId == $courseId)][0]`,
            { userId, courseId }
        );
        return !!enrollment;
    } catch (e) {
        console.error("Check Enrollment Status Error:", e);
        return false;
    }
}
