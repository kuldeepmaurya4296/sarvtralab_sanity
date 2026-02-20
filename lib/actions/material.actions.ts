'use server';

import { sanityClient, cleanSanityDoc } from '@/lib/sanity';
import { Material as MaterialType } from '@/data/materials';

export async function getCourseMaterials(courseId: string): Promise<MaterialType[]> {
    try {
        const materials = await sanityClient.fetch(
            `*[_type == "material" && (courseId == $courseId || courseRef._ref == $courseId)] | order(createdAt desc)`,
            { courseId }
        );
        return cleanSanityDoc(materials) as MaterialType[];
    } catch (e) {
        console.error("Get Course Materials Error:", e);
        return [];
    }
}

export async function getMaterialsByCourseIds(courseIds: string[]): Promise<MaterialType[]> {
    if (!courseIds || courseIds.length === 0) return [];
    try {
        const materials = await sanityClient.fetch(
            `*[_type == "material" && (courseId in $courseIds || courseRef._ref in $courseIds)] | order(createdAt desc)`,
            { courseIds }
        );
        return cleanSanityDoc(materials) as MaterialType[];
    } catch (e) {
        console.error("Get Materials By Course Ids Error:", e);
        return [];
    }
}
