'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { School } from '@/types/user';
import { logActivity } from './activity.actions';
import bcrypt from 'bcryptjs';

export async function getAllSchools(): Promise<School[]> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const schools = await sanityClient.fetch(`*[_type == "user" && role == "school"] | order(createdAt desc)`);
        return cleanSanityDoc(schools) as School[];
    } catch (e) {
        console.error("Get All Schools Error:", e);
        return [];
    }
}

export async function getPublicSchools() {
    try {
        const schools = await sanityClient.fetch(`*[_type == "user" && role == "school"]{customId, name, email}`);
        return cleanSanityDoc(schools);
    } catch (e) {
        console.error("Get Public Schools Error:", e);
        return [];
    }
}

export async function getSchoolById(id: string): Promise<School | null> {
    try {
        const school = await sanityClient.fetch(
            `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        return cleanSanityDoc(school) as School | null;
    } catch (e) {
        console.error("Get School Error:", e);
        return null;
    }
}

export async function createSchool(data: Partial<School>): Promise<School | null> {
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
            throw new Error(`School with email ${data.email} already exists.`);
        }

        const customId = `sch-${Date.now()}`;

        // Hash password if provided
        const finalData = { ...data };
        if ((finalData as any).password) {
            (finalData as any).password = await bcrypt.hash((finalData as any).password as string, 10);
        } else {
            (finalData as any).password = await bcrypt.hash('school123', 10);
        }

        const newSchool = await sanityWriteClient.create({
            _type: 'user',
            ...finalData,
            customId,
            role: 'school',
            schoolCode: data.schoolCode || `CODE-${Date.now().toString().slice(-6)}`,
            principalName: data.principalName || 'Principal Name',
            schoolType: data.schoolType || 'private',
            board: data.board || 'CBSE',
            address: data.address || 'Address not provided',
            city: data.city || 'City',
            state: data.state || 'State',
            pincode: data.pincode || '000000',
            phone: data.phone || '0000000000',
            assignedCourses: data.assignedCourses || [],
            status: 'active',
            subscriptionPlan: data.subscriptionPlan || 'basic',
            createdAt: new Date().toISOString()
        });

        await logActivity(session.user.id, 'SCHOOL_CREATE', `Created school: ${data.name} (${customId})`);

        revalidatePath('/admin/schools');
        return cleanSanityDoc(newSchool) as School;
    } catch (e: any) {
        console.error("Create School Error:", e);
        throw e;
    }
}

export async function updateSchool(id: string, updates: Partial<School>): Promise<School | null> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const school = await sanityClient.fetch(
            `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        if (!school) throw new Error("School not found");

        if (updates.email) {
            if (!updates.email) throw new Error("Email cannot be empty");
            const existing = await sanityClient.fetch(
                `*[_type == "user" && email == $email && _id != $currentId][0]`,
                { email: updates.email, currentId: school._id }
            );
            if (existing) {
                throw new Error(`Email ${updates.email} is already taken.`);
            }
        }

        if ((updates as any).password) {
            (updates as any).password = await bcrypt.hash((updates as any).password as string, 10);
        } else {
            delete (updates as any).password;
        }

        const updated = await sanityWriteClient
            .patch(school._id)
            .set(updates)
            .commit();

        await logActivity(session.user.id, 'SCHOOL_UPDATE', `Updated school: ${id}`);

        revalidatePath('/admin/schools');
        return cleanSanityDoc(updated) as School | null;
    } catch (e: any) {
        console.error("Update School Error:", e);
        throw e;
    }
}

export async function deleteSchool(id: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const school = await sanityClient.fetch(
            `*[_type == "user" && role == "school" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (school) {
            await sanityWriteClient.delete(school._id);
            revalidatePath('/admin/schools');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete School Error:", e);
        return false;
    }
}
