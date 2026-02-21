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

export async function getNextStudentId() {
    try {
        // Find the student with the highest numerical ID starting with SRV-
        const lastStudent = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && customId match "SRV-*"] | order(customId desc)[0]`
        );

        let nextNum = 1;
        if (lastStudent?.customId) {
            const currentNum = parseInt(lastStudent.customId.split('-')[1]);
            if (!isNaN(currentNum)) {
                nextNum = currentNum + 1;
            }
        }

        return `SRV-${nextNum.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error("Error generating student ID:", error);
        return `SRV-${Date.now().toString().slice(-4)}`; // Fallback
    }
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
            const sId = user.schoolId || user.dbId || user.id; // Schools themselves use their ID as schoolId
            if (!sId) return [];

            query = `*[_type == "user" && role == "student" && (schoolRef._ref == $sId || schoolId == $sId)]`;
            params = { sId };
        }

        const students = await sanityClient.fetch(query + ` | order(createdAt desc)`, params);
        return cleanSanityDoc(students);
    } catch (e) {
        console.error("Get All Students Error:", e);
        return [];
    }
}

export async function bulkCreateStudents(studentsData: any[], schoolContext?: { id: string, name: string, city: string, state: string }) {
    const session = await getServerSession(authOptions);
    if (!session || !['superadmin', 'admin', 'school', 'govt', 'teacher'].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    try {
        const results = {
            success: [] as any[],
            errors: [] as any[]
        };

        // Get base start ID
        const lastStudent = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && customId match "SRV-*"] | order(customId desc)[0]`
        );
        let currentNum = 1;
        if (lastStudent?.customId) {
            const num = parseInt(lastStudent.customId.split('-')[1]);
            if (!isNaN(num)) currentNum = num + 1;
        }

        const transaction = sanityWriteClient.transaction();

        for (const data of studentsData) {
            try {
                if (!data.email || !data.name) {
                    results.errors.push({ email: data.email || 'Unknown', error: "Name and Email are required" });
                    continue;
                }

                // Check if already in this batch to avoid internal duplicates
                const isInternalDup = results.success.some(s => s.email === data.email);
                if (isInternalDup) {
                    results.errors.push({ email: data.email, error: "Duplicate email in sheet" });
                    continue;
                }

                const existing = await sanityClient.fetch(
                    `*[_type == "user" && email == $email][0]`,
                    { email: data.email }
                );
                if (existing) {
                    results.errors.push({ email: data.email, error: "Email already registered" });
                    continue;
                }

                const hashedPassword = await bcrypt.hash(data.password || 'student123', 10);
                const customId = `SRV-${(currentNum++).toString().padStart(4, '0')}`;

                let schoolRef = undefined;
                const sId = data.schoolId || schoolContext?.id;
                const sName = data.schoolName || schoolContext?.name || 'Individual Learner';

                if (sId) {
                    const school = await sanityClient.fetch(
                        `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]`,
                        { id: sId }
                    );
                    if (school) {
                        schoolRef = { _type: 'reference', _ref: school._id };
                    }
                }

                const studentDoc = {
                    _type: 'user',
                    ...data,
                    role: 'student',
                    customId,
                    password: hashedPassword,
                    schoolRef,
                    schoolName: sName,
                    city: data.city || schoolContext?.city,
                    state: data.state || schoolContext?.state,
                    status: 'active',
                    profileCompleted: true,
                    createdAt: new Date().toISOString()
                };

                // Remove fields that shouldn't be spread
                delete (studentDoc as any).schoolId;

                transaction.create(studentDoc);
                results.success.push({ email: data.email, name: data.name, customId });

            } catch (err: any) {
                results.errors.push({ email: data.email, error: err.message });
            }
        }

        if (results.success.length > 0) {
            await transaction.commit();
            await logActivity(session.user.id, 'STUDENT_BULK_CREATE', `Bulk created ${results.success.length} students`);
        }

        return results;

    } catch (e: any) {
        console.error("Bulk Create Student Error:", e);
        throw e;
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
        const customId = await getNextStudentId();

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
        // Fetch student doc to get both internal _id and customId
        const student = await sanityClient.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
        const cId = student?.customId || "";

        const data = await sanityClient.fetch(`{
            "enrollments": *[_type == "enrollment" && (student == $userId || student == $cId)]{
                progress,
                watchTime,
                status,
                completedLessons,
                courseRef->{
                    customId,
                    title,
                    thumbnail,
                    curriculum
                }
            },
            "certificatesCount": count(*[_type == "certificate" && (studentId == $userId || studentId == $cId)])
        }`, { userId, cId });

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
                completedLessons: Array.isArray(e.completedLessons) ? e.completedLessons.length : 0
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
        // Fetch student doc to get both internal _id and customId
        const student = await sanityClient.fetch(`*[_type == "user" && (_id == $userId || customId == $userId)][0]`, { userId });
        const sId = student?._id || userId;
        const cId = student?.customId || "";

        const enrollments = await sanityClient.fetch(
            `*[_type == "enrollment" && (student == $sId || student == $cId)]{
                _id,
                progress,
                completedLessons,
                status,
                certificateStatus,
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
            { sId, cId }
        );

        return enrollments.map((e: any) => ({
            ...(e.courseRef ? cleanSanityDoc(e.courseRef) : { title: 'Course Unavailable', id: null }),
            enrollmentId: e._id,
            isUnavailable: !e.courseRef,
            progress: e.progress || 0,
            completedLessons: Array.isArray(e.completedLessons) ? e.completedLessons.length : 0,
            status: e.status,
            certificateStatus: e.certificateStatus || 'none',
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
            `*[_type == "enrollment" && _id == $enrollmentId][0]{
                ...,
                "courseExists": defined(courseRef->)
            }`,
            { enrollmentId }
        );
        if (!enrollment) throw new Error("Enrollment not found");

        // Only allow student to delete their own, or admin
        if (enrollment.student !== session.user.id && session.user.role !== 'superadmin' && session.user.role !== 'admin') {
            throw new Error("Unauthorized");
        }

        // Restriction: Student cannot delete courses if course is available in DB
        if (session.user.role === 'student' && enrollment.courseExists) {
            throw new Error("This course is active and cannot be removed from your dashboard.");
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

export async function completeStudentProfile(userId: string, data: any) {
    try {
        const student = await sanityClient.fetch(
            `*[_type == "user" && role == "student" && (customId == $userId || _id == $userId)][0]`,
            { userId }
        );
        if (!student) throw new Error("Student not found");

        // Initialize updates with standard fields
        const updates: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            schoolName: data.schoolName,
            grade: data.grade,
            parentName: data.parentName,
            parentPhone: data.parentPhone,
            parentEmail: data.parentEmail,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            profileCompleted: true,
            status: 'active'
        };

        // Handle School Reference if applicable
        if (data.schoolId && data.schoolId !== 'no_school') {
            // Check if schoolId is already a Sanity ID (starting with usr- or being a UUID)
            // Even if it's a customId, we want the _id for the reference
            const schoolDoc = await sanityClient.fetch(
                `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]`,
                { id: data.schoolId }
            );
            if (schoolDoc) {
                updates.schoolRef = { _type: 'reference', _ref: schoolDoc._id };
                updates.schoolId = schoolDoc.customId || schoolDoc._id;
            }
        } else {
            // Independent learner case
            updates.schoolId = 'no_school';
            updates.schoolRef = null; // Clear any existing reference
        }

        const updated = await sanityWriteClient
            .patch(student._id)
            .set(updates)
            .commit();

        await logActivity(userId, 'PROFILE_COMPLETE', `Completed profile for student: ${data.name}`);

        return { success: true, user: scrubStudent(updated) };
    } catch (error: any) {
        console.error("Complete Profile Error:", error);
        return { success: false, error: error.message };
    }
}

export async function markLessonComplete(enrollmentId: string, lessonId: string) {
    try {
        const enrollment = await sanityClient.fetch(
            `*[_type == "enrollment" && _id == $enrollmentId][0]{
                ...,
                "totalLessons": courseRef->curriculum[].lessons[].id
            }`,
            { enrollmentId }
        );
        if (!enrollment) throw new Error("Enrollment not found");

        const completedLessons = enrollment.completedLessons || [];
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        } else {
            return { success: true, alreadyCompleted: true };
        }

        // Calculate progress
        const totalLessonsCount = Array.isArray(enrollment.totalLessons) ? enrollment.totalLessons.length : 0;
        const progress = totalLessonsCount > 0 ? Math.round((completedLessons.length / totalLessonsCount) * 100) : 0;

        const updated = await sanityWriteClient
            .patch(enrollmentId)
            .set({
                completedLessons,
                progress,
                status: progress === 100 ? 'Completed' : enrollment.status,
                completionDate: progress === 100 ? new Date().toISOString() : enrollment.completionDate
            })
            .commit();

        return { success: true, progress: updated.progress };
    } catch (error: any) {
        console.error("Mark Lesson Complete Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getEnrollmentData(userId: string, courseId: string) {
    try {
        const enrollment = await sanityClient.fetch(
            `*[_type == "enrollment" && student == $userId && (courseRef->customId == $courseId || courseRef._ref == $courseId)][0]{
                _id,
                completedLessons,
                progress,
                status
            }`,
            { userId, courseId }
        );
        return enrollment;
    } catch (error) {
        console.error("Get Enrollment Data Error:", error);
        return null;
    }
}

export async function applyForCertificate(enrollmentId: string) {
    try {
        const enrollment = await sanityClient.fetch(`*[_type == "enrollment" && _id == $enrollmentId][0]`, { enrollmentId });
        if (!enrollment) throw new Error("Enrollment not found");

        if ((enrollment.progress || 0) < 75) {
            throw new Error("You need at least 75% progress to apply for a certificate.");
        }

        await sanityWriteClient
            .patch(enrollmentId)
            .set({ certificateStatus: 'applied' })
            .commit();

        return { success: true };
    } catch (error: any) {
        console.error("Apply Certificate Error:", error);
        return { success: false, error: error.message };
    }
}

export async function migrateExistingStudentIds() {
    try {
        const students = await sanityClient.fetch(`*[_type == "user" && role == "student" && !(customId match "SRV-*")] | order(createdAt asc)`);

        let count = 0;
        for (const student of students) {
            const nextId = await getNextStudentId();
            await sanityWriteClient
                .patch(student._id)
                .set({ customId: nextId })
                .commit();
            count++;
        }

        return { success: true, migratedCount: count };
    } catch (error: any) {
        console.error("Migration Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getStudentFullDetails(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }

    try {
        const student = await sanityClient.fetch(`*[_type == "user" && (_id == $userId || customId == $userId)][0]`, { userId });
        if (!student) return null;

        const sId = student._id;
        const cId = student.customId || "";

        const data = await sanityClient.fetch(`{
            "enrollments": *[_type == "enrollment" && (student == $sId || student == $cId)]{
                _id,
                progress,
                watchTime,
                status,
                completedLessons,
                enrolledAt,
                courseRef->{
                    _id,
                    customId,
                    title,
                    curriculum
                }
            },
            "attendance": *[_type == "attendance" && (studentRef._ref == $sId || studentRef._ref == $cId)]{
                date,
                status,
                sessionInfo
            },
            "submissions": *[_type == "submission" && (studentRef._ref == $sId || studentRef._ref == $cId)]{
                score,
                status,
                submittedAt,
                assignmentRef->{
                    title,
                    maxScore
                }
            },
            "certificates": *[_type == "certificate" && (studentId == $sId || studentId == $cId)]{
                _id,
                customId,
                courseId,
                issueDate,
                marks,
                "courseName": *[_type == "course" && (id == ^.courseId || customId == ^.courseId || _id == ^.courseId)][0].title
            }
        }`, { sId, cId });

        if (!student) return null;

        return {
            ...cleanSanityDoc(student),
            enrollments: (data.enrollments || []).map((e: any) => ({
                ...cleanSanityDoc(e),
                courseTitle: e.courseRef?.title,
                totalLessons: e.courseRef?.curriculum?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0
            })),
            attendance: data.attendance || [],
            submissions: data.submissions || [],
            certificates: data.certificates || []
        };
    } catch (e) {
        console.error("Get Student Full Details Error:", e);
        return null;
    }
}
