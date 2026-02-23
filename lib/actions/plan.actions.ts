'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export async function getAllPlans() {
    try {
        const plans = await sanityClient.fetch(`*[_type == "plan" && status == "active"] | order(createdAt asc)`);
        return cleanSanityDoc(plans);
    } catch (e) {
        console.error("Get All Plans Error:", e);
        return [];
    }
}

export async function getPlanById(id: string) {
    try {
        const plan = await sanityClient.fetch(
            `*[_type == "plan" && (customId == $id || _id == $id)][0]`,
            { id }
        );
        return plan ? cleanSanityDoc(plan) : null;
    } catch (e) {
        console.error("Get Plan By ID Error:", e);
        return null;
    }
}

export async function getUserActivePlan(userId: string) {
    try {
        const user = await sanityClient.fetch(
            `*[_type == "user" && (customId == $userId || _id == $userId)][0]{subscriptionPlan}`,
            { userId }
        );
        return user?.subscriptionPlan || null;
    } catch (e) {
        console.error("Get User Active Plan Error:", e);
        return null;
    }
}

export async function getAdminPlans() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const plans = await sanityClient.fetch(`*[_type == "plan"] | order(createdAt asc)`);
        return cleanSanityDoc(plans);
    } catch (e) {
        console.error("Get Admin Plans Error:", e);
        return [];
    }
}

export async function createPlan(data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const customId = `pln-${Date.now()}`;
        const plan = await sanityWriteClient.create({
            _type: 'plan',
            ...data,
            customId,
            createdAt: new Date().toISOString()
        });
        revalidatePath('/admin/plans');
        revalidatePath('/subscription');
        return cleanSanityDoc(plan);
    } catch (e) {
        console.error("Create Plan Error:", e);
        throw e;
    }
}

export async function updatePlan(id: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const plan = await sanityClient.fetch(
            `*[_type == "plan" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (!plan) throw new Error("Plan not found");

        const updated = await sanityWriteClient
            .patch(plan._id)
            .set(data)
            .commit();

        revalidatePath('/admin/plans');
        revalidatePath('/subscription');
        return cleanSanityDoc(updated);
    } catch (e) {
        console.error("Update Plan Error:", e);
        throw e;
    }
}

export async function deletePlan(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
        throw new Error("Unauthorized");
    }
    try {
        const plan = await sanityClient.fetch(
            `*[_type == "plan" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (plan) {
            await sanityWriteClient.delete(plan._id);
            revalidatePath('/admin/plans');
            revalidatePath('/subscription');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Plan Error:", e);
        return false;
    }
}
