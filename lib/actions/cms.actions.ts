'use server';

import { sanityWriteClient } from '@/lib/sanity';
import { revalidatePath } from 'next/cache';

/**
 * Revalidate all public pages that consume CMS/Sanity content.
 * Called after any CMS create/update/delete to bust Vercel's static cache.
 */
function revalidateAllPublicPages() {
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/schools');
    revalidatePath('/terms');
    revalidatePath('/privacy');
    revalidatePath('/refund');
    revalidatePath('/careers');
    revalidatePath('/blog');
    revalidatePath('/admin/website-cms');
}
// Update Organization details (Contact, Global branding)
export async function updateOrganization(id: string, data: any) {
    try {
        await sanityWriteClient.patch(id).set(data).commit();
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Footer Sections CRUD
export async function getFooterSectionsCMS() {
    return await sanityWriteClient.fetch(`*[_type == "footerSection"] | order(order asc)`);
}

export async function createFooterSection(data: any) {
    try {
        await sanityWriteClient.create({ _type: 'footerSection', ...data });
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateFooterSection(id: string, data: any) {
    try {
        await sanityWriteClient.patch(id).set(data).commit();
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFooterSection(id: string) {
    try {
        await sanityWriteClient.delete(id);
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Features / Why Us CRUD
export async function getFeaturesCMS() {
    return await sanityWriteClient.fetch(`*[_type == "feature"] | order(order asc)`);
}

export async function createFeature(data: any) {
    try {
        await sanityWriteClient.create({ _type: 'feature', ...data });
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateFeature(id: string, data: any) {
    try {
        await sanityWriteClient.patch(id).set(data).commit();
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFeature(id: string) {
    try {
        await sanityWriteClient.delete(id);
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Generic CRUD helper for any schema
export async function fetchDocsByType(type: string, orderBy = "createdAt desc") {
    try {
        return await sanityWriteClient.fetch(`*[_type == $type] | order(${orderBy})`, { type });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function createDoc(type: string, data: any) {
    try {
        await sanityWriteClient.create({ _type: type, ...data });
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateDoc(id: string, data: any) {
    try {
        await sanityWriteClient.patch(id).set(data).commit();
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteDoc(id: string) {
    try {
        await sanityWriteClient.delete(id);
        revalidateAllPublicPages();
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Upload Media Asset to Sanity
export async function uploadAssetToSanity(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file found' };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const asset = await sanityWriteClient.assets.upload('file', buffer, {
            filename: file.name,
            contentType: file.type
        });

        return { success: true, url: asset.url };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
