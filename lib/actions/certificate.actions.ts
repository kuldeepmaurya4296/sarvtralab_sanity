'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function getAllCertificates() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const certs = await sanityClient.fetch(`*[_type == "certificate"]{
            ...,
            "courseName": *[_type == "course" && (id == ^.courseId || customId == ^.courseId || _id == ^.courseId)][0].title,
            "studentName": *[_type == "user" && (id == ^.studentId || customId == ^.studentId || _id == ^.studentId)][0].name
        } | order(issuedAt desc)`);
        return cleanSanityDoc(certs);
    } catch (e) {
        console.error("Get All Certificates Error:", e);
        return [];
    }
}

export async function getStudentCertificates(studentId: string) {
    try {
        const student = await sanityClient.fetch(`*[_type == "user" && (_id == $studentId || customId == $studentId)][0]`, { studentId });
        const sId = student?._id || studentId;
        const cId = student?.customId || "";

        const certs = await sanityClient.fetch(
            `*[_type == "certificate" && (studentId == $sId || studentId == $cId)] | order(issuedAt desc){
                ...,
                "courseName": *[_type == "course" && (id == ^.courseId || customId == ^.courseId || _id == ^.courseId)][0].title
            }`,
            { sId, cId }
        );

        // Client-side deduplication to ensure one certificate per course
        const uniqueCertsMap = new Map();
        certs.forEach((cert: any) => {
            if (!uniqueCertsMap.has(cert.courseId)) {
                uniqueCertsMap.set(cert.courseId, cert);
            }
        });

        return cleanSanityDoc(Array.from(uniqueCertsMap.values()));
    } catch (e) {
        console.error("Get Student Certificates Error:", e);
        return [];
    }
}

export async function getStudentCertificateCount(studentId: string) {
    try {
        const student = await sanityClient.fetch(`*[_type == "user" && (_id == $studentId || customId == $studentId)][0]`, { studentId });
        const sId = student?._id || studentId;
        const cId = student?.customId || "";

        return await sanityClient.fetch(
            `count(*[_type == "certificate" && (studentId == $sId || studentId == $cId)])`,
            { sId, cId }
        );
    } catch (e) {
        console.error("Get Student Certificate Count Error:", e);
        return 0;
    }
}

export async function issueCertificate(data: any, enrollmentId?: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    try {
        // Fetch student doc to get both internal _id and customId
        const student = await sanityClient.fetch(`*[_type == "user" && (_id == $userId || customId == $userId)][0]`, { userId: data.studentId });
        const sId = student?._id || data.studentId;
        const cId = student?.customId || "";

        // Check if certificate already exists for this student and course
        const existingCert = await sanityClient.fetch(
            `*[_type == "certificate" && (studentId == $sId || studentId == $cId) && courseId == $courseId][0]`,
            { sId, cId, courseId: data.courseId }
        );
        if (existingCert) {
            throw new Error("A certificate for this course has already been issued to this student.");
        }

        // Generate ID in format: studentId/01, studentId/02...
        const existingCount = await sanityClient.fetch(
            `count(*[_type == "certificate" && studentId == $studentId])`,
            { studentId: data.studentId }
        );
        const nextNum = (existingCount + 1).toString().padStart(2, '0');
        const customId = `${data.studentId}/${nextNum}`;

        // Fetch marks (progress) from enrollment if not provided
        let marks = data.marks;
        if (enrollmentId && marks === undefined) {
            const enrollment = await sanityClient.fetch(`*[_type == "enrollment" && _id == $enrollmentId][0]`, { enrollmentId });
            marks = enrollment?.progress || 0;
        }

        const certificate = await sanityWriteClient.create({
            _type: 'certificate',
            studentId: data.studentId,
            courseId: data.courseId,
            issueDate: data.issueDate || new Date().toISOString().split('T')[0],
            marks: marks || 0,
            status: 'issued',
            customId,
            issuedAt: new Date().toISOString()
        });

        // If an enrollment ID is provided, update its status
        if (enrollmentId) {
            await sanityWriteClient
                .patch(enrollmentId)
                .set({ certificateStatus: 'issued' })
                .commit();
        }

        revalidatePath(`/student/certificates`);
        return cleanSanityDoc(certificate);
    } catch (e) {
        console.error("Issue Certificate Error:", e);
        throw e;
    }
}

export async function deleteCertificate(certificateId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }

    try {
        await sanityWriteClient.delete(certificateId);
        revalidatePath(`/student/certificates`);
        return { success: true };
    } catch (e) {
        console.error("Delete Certificate Error:", e);
        throw e;
    }
}

export async function rejectCertificateRequest(enrollmentId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }

    try {
        await sanityWriteClient
            .patch(enrollmentId)
            .set({ certificateStatus: 'none' })
            .commit();
        return { success: true };
    } catch (e) {
        console.error("Reject Certificate Error:", e);
        throw e;
    }
}

export async function getPendingCertificateRequests() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const requests = await sanityClient.fetch(`
            *[_type == "enrollment" && certificateStatus == "applied"]{
                _id,
                student,
                progress,
                certificateStatus,
                enrolledAt,
                "requestDate": _updatedAt,
                courseRef->{
                    _id,
                    customId,
                    title
                },
                "studentDetails": *[_type == "user" && (customId == ^.student || _id == ^.student)][0]{
                    name,
                    email,
                    customId,
                    _id
                }
            } | order(requestDate desc)
        `);
        return cleanSanityDoc(requests);
    } catch (e) {
        console.error("Get Pending Requests Error:", e);
        return [];
    }
}
