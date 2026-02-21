import { MetadataRoute } from 'next';
import { getAllCourses } from '@/lib/actions/course.actions';

const SITE_URL = 'https://sarvtralabs.com'; // Replace with actual URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = [
        '',
        '/about',
        '/courses',
        '/blog',
        '/careers',
        '/contact',
        '/press',
        '/privacy',
        '/terms',
        '/refund',
        '/help',
    ].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    let courseRoutes: any[] = [];
    try {
        const courses = await getAllCourses();
        courseRoutes = courses.map((course: any) => ({
            url: `${SITE_URL}/courses/${course.id || course.customId || course._id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error("Sitemap courses fetch error:", e);
    }

    return [...routes, ...courseRoutes];
}
