'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function createAssignment(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'teacher' && session.user.role !== 'school' && session.user.role !== 'superadmin')) {
        throw new Error("Unauthorized");
    }
    try {
        const customId = `asn-${Date.now()}`;
        const assignment = await sanityWriteClient.create({
            _type: 'assignment',
            ...data,
            customId,
            instructor: session.user.id,
            createdAt: new Date().toISOString()
        });
        revalidatePath(`/courses/${data.courseId}/assignments`);
        return cleanSanityDoc(assignment);
    } catch (e) {
        console.error("Create Assignment Error:", e);
        throw e;
    }
}

export async function getAssignmentsByCourse(courseId: string) {
    try {
        const assignments = await sanityClient.fetch(
            `*[_type == "assignment" && (courseId == $courseId || courseRef._ref == $courseId)] | order(createdAt desc)`,
            { courseId }
        );
        return cleanSanityDoc(assignments);
    } catch (e) {
        console.error("Get Assignments By Course Error:", e);
        return [];
    }
}

export async function deleteAssignment(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");
    try {
        const assignment = await sanityClient.fetch(
            `*[_type == "assignment" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (assignment) {
            await sanityWriteClient.delete(assignment._id);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Assignment Error:", e);
        return false;
    }
}
