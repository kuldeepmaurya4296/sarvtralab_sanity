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
