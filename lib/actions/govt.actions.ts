'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getGovtStudentData() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'govt') {
        throw new Error("Unauthorized");
    }

    try {
        const govtUser = await sanityClient.fetch(
            `*[_type == "user" && role == "govt" && (customId == $id || _id == $id)][0]`,
            { id: session.user.id }
        );
        if (!govtUser) throw new Error("Govt official not found");

        const assignedSchoolIds = govtUser.assignedSchools || [];

        // Fetch all schools
        const schools = await sanityClient.fetch(
            `*[_type == "user" && role == "school"]`
        );

        // Fetch all students
        const students = await sanityClient.fetch(
            `*[_type == "user" && role == "student"]`
        );

        return {
            govtOrg: cleanSanityDoc(govtUser),
            schools: cleanSanityDoc(schools),
            students: cleanSanityDoc(students)
        };
    } catch (e) {
        console.error("Govt Student Data Error:", e);
        return {
            govtOrg: null,
            schools: [],
            students: []
        };
    }
}

export async function getAllGovtOrgs() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const orgs = await sanityClient.fetch(`*[_type == "user" && role == "govt"]`);
        return cleanSanityDoc(orgs);
    } catch (e) {
        console.error("Get All Govt Orgs Error:", e);
        return [];
    }
}

export async function createGovtOrg(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        if (!data.email) throw new Error("Email is required");
        const existing = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: data.email }
        );
        if (existing) throw new Error("Email already registered");

        const hashedPassword = await bcrypt.hash(data.password || 'govt123', 10);
        const customId = `gov-${Date.now()}`;

        const org = await sanityWriteClient.create({
            _type: 'user',
            ...data,
            password: hashedPassword,
            customId,
            role: 'govt',
            createdAt: new Date().toISOString()
        });

        revalidatePath('/admin/govt');
        return cleanSanityDoc(org);
    } catch (e) {
        console.error("Create Govt Org Error:", e);
        throw e;
    }
}

export async function updateGovtOrg(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const org = await sanityClient.fetch(
            `*[_type == "user" && role == "govt" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (!org) throw new Error("Govt org not found");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password;
        }

        const updated = await sanityWriteClient
            .patch(org._id)
            .set(data)
            .commit();

        revalidatePath('/admin/govt');
        return cleanSanityDoc(updated);
    } catch (e) {
        console.error("Update Govt Org Error:", e);
        throw e;
    }
}

export async function deleteGovtOrg(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const org = await sanityClient.fetch(
            `*[_type == "user" && role == "govt" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (org) {
            await sanityWriteClient.delete(org._id);
            revalidatePath('/admin/govt');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Govt Org Error:", e);
        return false;
    }
}
