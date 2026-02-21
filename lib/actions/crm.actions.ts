'use server';

import { sanityClient, sanityWriteClient, cleanSanityDoc } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { revalidatePath } from 'next/cache';

export async function getAllLeads(filters: any = {}) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        let groq = `*[_type == "lead"]`;
        const params: any = {};

        if (filters.status && filters.status !== 'All') {
            groq += ` && status == $status`;
            params.status = filters.status;
        }
        if (filters.search) {
            groq += ` && (name match $search || email match $search || phone match $search)`;
            params.search = `*${filters.search}*`;
        }

        const leads = await sanityClient.fetch(groq + ` | order(createdAt desc)`, params);
        return cleanSanityDoc(leads) || [];
    } catch (e) {
        console.error("Get All Leads Error:", e);
        return [];
    }
}

export async function createLead(data: any) {
    try {
        const customId = `ld-${Date.now()}`;
        const newLead = await sanityWriteClient.create({
            _type: 'lead',
            ...data,
            customId,
            status: 'New',
            createdAt: new Date().toISOString()
        });
        revalidatePath('/admin/crm');
        return cleanSanityDoc(newLead);
    } catch (e) {
        console.error("Create Lead Error:", e);
        throw e;
    }
}

export async function updateLeadStatus(id: string, status: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const lead = await sanityClient.fetch(
            `*[_type == "lead" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (!lead) throw new Error("Lead not found");

        const updated = await sanityWriteClient
            .patch(lead._id)
            .set({ status })
            .commit();

        revalidatePath('/admin/crm');
        return cleanSanityDoc(updated);
    } catch (e) {
        console.error("Update Lead Status Error:", e);
        throw e;
    }
}

export async function getCrmAnalytics() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const stats = await sanityClient.fetch(`{
            "totalLeads": count(*[_type == "lead"]),
            "recentLeadsCount": count(*[_type == "lead" && createdAt >= $thirtyDaysAgo]),
            "convertedDocs": count(*[_type == "lead" && status == "Converted"]),
            "sourceDistribution": *[_type == "lead"]{source}
        }`, { thirtyDaysAgo });

        // Calculate conversion rate
        const total = stats.totalLeads || 0;
        const converted = stats.convertedDocs || 0;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        // Calculate source distribution
        const sources = stats.sourceDistribution.reduce((acc: any, curr: any) => {
            const src = curr.source || 'Unknown';
            acc[src] = (acc[src] || 0) + 1;
            return acc;
        }, {});

        const distribution = Object.entries(sources)
            .map(([name, count]) => ({ _id: name, count }))
            .sort((a: any, b: any) => b.count - a.count);

        return {
            totalLeads: stats.totalLeads,
            recentLeads: stats.recentLeadsCount, // Match the expected field name in the component
            conversionRate,
            sourceDistribution: distribution
        };
    } catch (e) {
        console.error("Get CRM Analytics Error:", e);
        return null;
    }
}

export async function deleteLead(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'superadmin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }
    try {
        const lead = await sanityClient.fetch(
            `*[_type == "lead" && (customId == $id || _id == $id)][0]{_id}`,
            { id }
        );
        if (lead) {
            await sanityWriteClient.delete(lead._id);
            revalidatePath('/admin/crm');
            return true;
        }
        return false;
    } catch (e) {
        console.error("Delete Lead Error:", e);
        return false;
    }
}
