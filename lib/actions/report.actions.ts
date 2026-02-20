'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export async function getReportsBySchool(schoolId: string) {
    try {
        const reports = await sanityClient.fetch(
            `*[_type == "report" && (schoolId == $schoolId || schoolRef._ref == $schoolId)] | order(createdAt desc)`,
            { schoolId }
        );
        return cleanSanityDoc(reports);
    } catch (e) {
        console.error("Get Reports By School Error:", e);
        return [];
    }
}

export async function getAllReports() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin' && session.user.role !== 'govt')) {
        throw new Error("Unauthorized");
    }
    try {
        const reports = await sanityClient.fetch(`*[_type == "report"] | order(createdAt desc)`);
        return cleanSanityDoc(reports);
    } catch (e) {
        console.error("Get All Reports Error:", e);
        return [];
    }
}

export async function createReport(data: any) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    try {
        const customId = `rpt-${Date.now()}`;
        const report = await sanityWriteClient.create({
            _type: 'report',
            ...data,
            customId,
            generatedAt: new Date().toISOString(),
            status: 'Ready',
            size: '1.2 MB',
            createdAt: new Date().toISOString()
        });
        revalidatePath('/school/reports');
        revalidatePath('/govt/reports');
        return cleanSanityDoc(report);
    } catch (e) {
        console.error("Create Report Error:", e);
        throw e;
    }
}

export async function deleteReport(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    try {
        const report = await sanityClient.fetch(
            `*[_type == "report" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (report) {
            await sanityWriteClient.delete(report._id);
            revalidatePath('/school/reports');
            revalidatePath('/govt/reports');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Report Error:", e);
        return false;
    }
}
