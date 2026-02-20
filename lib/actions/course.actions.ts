'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { Course as CourseType } from '@/data/courses';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { logActivity } from './activity.actions';
import { revalidatePath } from 'next/cache';

export async function getAllCourses(): Promise<CourseType[]> {
    const courses = await sanityClient.fetch(`*[_type == "course"] | order(createdAt desc)`);
    return cleanSanityDoc(courses) as CourseType[];
}

export async function getCourseById(id: string): Promise<CourseType | null> {
    const course = await sanityClient.fetch(
        `*[_type == "course" && (customId == $id || _id == $id)][0]`,
        { id }
    );
    return cleanSanityDoc(course) as CourseType | null;
}

export async function getCoursesByIds(ids: string[]): Promise<CourseType[]> {
    if (!ids || ids.length === 0) return [];

    const courses = await sanityClient.fetch(
        `*[_type == "course" && (customId in $ids || _id in $ids)]`,
        { ids }
    );
    return cleanSanityDoc(courses) as CourseType[];
}

export async function createCourse(data: Partial<CourseType>): Promise<CourseType | null> {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['school', 'teacher', 'superadmin', 'admin'];
    if (!session || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized");
    }
    try {
        const customId = `crs-${Date.now()}`;
        const newCourse = await sanityWriteClient.create({
            _type: 'course',
            ...data,
            customId,
            createdAt: new Date().toISOString()
        });

        await logActivity(session.user.id, 'COURSE_CREATE', `Created course: ${data.title} (${customId})`);

        revalidatePath('/courses');
        return cleanSanityDoc(newCourse) as CourseType;
    } catch (e) {
        console.error("Create Course Error:", e);
        return null;
    }
}

export async function updateCourse(id: string, data: Partial<CourseType>): Promise<CourseType | null> {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['school', 'teacher', 'superadmin', 'admin'];
    if (!session || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized");
    }
    try {
        // Find Sanity _id first if customId was provided
        const course = await sanityClient.fetch(
            `*[_type == "course" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );

        if (!course) throw new Error("Course not found");

        const updated = await sanityWriteClient
            .patch(course._id)
            .set(data)
            .commit();

        await logActivity(session.user.id, 'COURSE_UPDATE', `Updated course: ${id}`);

        revalidatePath('/courses');
        revalidatePath(`/courses/${id}`);
        return cleanSanityDoc(updated) as CourseType | null;
    } catch (e) {
        console.error("Update Course Error:", e);
        return null;
    }
}

export async function deleteCourse(id: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['school', 'teacher', 'superadmin', 'admin'];
    if (!session || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized");
    }
    try {
        const course = await sanityClient.fetch(
            `*[_type == "course" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );

        if (!course) return false;

        await sanityWriteClient.delete(course._id);
        revalidatePath('/courses');
        return true;
    } catch (e) {
        console.error("Delete Course Error:", e);
        return false;
    }
}
