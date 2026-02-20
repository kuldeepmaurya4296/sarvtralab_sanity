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
        const certs = await sanityClient.fetch(`*[_type == "certificate"] | order(issuedAt desc)`);
        return cleanSanityDoc(certs);
    } catch (e) {
        console.error("Get All Certificates Error:", e);
        return [];
    }
}

export async function getStudentCertificates(studentId: string) {
    try {
        const certs = await sanityClient.fetch(
            `*[_type == "certificate" && studentId == $studentId] | order(issuedAt desc)`,
            { studentId }
        );
        return cleanSanityDoc(certs);
    } catch (e) {
        console.error("Get Student Certificates Error:", e);
        return [];
    }
}

export async function getStudentCertificateCount(studentId: string) {
    try {
        return await sanityClient.fetch(
            `count(*[_type == "certificate" && studentId == $studentId])`,
            { studentId }
        );
    } catch (e) {
        console.error("Get Student Certificate Count Error:", e);
        return 0;
    }
}

export async function issueCertificate(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    try {
        const customId = `cert-${Date.now()}`;
        const certificate = await sanityWriteClient.create({
            _type: 'certificate',
            ...data,
            customId,
            issuedAt: new Date().toISOString()
        });
        revalidatePath(`/student/certificates`);
        return cleanSanityDoc(certificate);
    } catch (e) {
        console.error("Issue Certificate Error:", e);
        throw e;
    }
}
