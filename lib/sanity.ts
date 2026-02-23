import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-01-01';

// Read-only client (uses CDN for faster reads)
export const sanityClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
});

// Write client (no CDN, requires API token, server-only)
export const sanityWriteClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

/**
 * Helper to strip Sanity internal fields and make docs serializable
 * for passing from server actions to client components.
 */
export function cleanSanityDoc(doc: any): any {
    if (!doc) return doc;
    if (Array.isArray(doc)) return doc.map(cleanSanityDoc);

    const cleaned: any = {};

    // First pass: extract standard fields
    for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') {
            cleaned._id = value;
            cleaned.id = value; // Default id to _id
        } else if (key === '_createdAt') {
            cleaned.createdAt = value;
        } else if (key === '_updatedAt') {
            cleaned.updatedAt = value;
        } else if (!key.startsWith('_')) {
            cleaned[key] = value;
        }
    }

    // Second pass: Ensure _id takes precedence over any field named 'id' in the doc
    if (doc._id) {
        cleaned.id = doc._id;
    }

    return cleaned;
}
