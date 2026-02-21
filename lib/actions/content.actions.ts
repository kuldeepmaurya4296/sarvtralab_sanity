'use server';

import { sanityClient, cleanSanityDoc } from '@/lib/sanity';

/* -------------------------------------------------------------------------- */
/*                             Organization Data                               */
/* -------------------------------------------------------------------------- */

export async function getOrganizationDetails() {
    try {
        const org = await sanityClient.fetch(`*[_type == "organization"][0]`);
        return cleanSanityDoc(org);
    } catch (e) {
        console.error("Get Organization Details Error:", e);
        return null;
    }
}

/* -------------------------------------------------------------------------- */
/*                                   FAQs                                     */
/* -------------------------------------------------------------------------- */

export async function getFAQs() {
    try {
        const faqs = await sanityClient.fetch(`*[_type == "faq"] | order(order asc)`);
        return cleanSanityDoc(faqs);
    } catch (e) {
        console.error("Get FAQs Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

export async function getTestimonials() {
    try {
        const testimonials = await sanityClient.fetch(`*[_type == "testimonial"] | order(order asc)`);
        return cleanSanityDoc(testimonials);
    } catch (e) {
        console.error("Get Testimonials Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                                Features                                    */
/* -------------------------------------------------------------------------- */

export async function getFeatures() {
    try {
        const features = await sanityClient.fetch(`*[_type == "feature"] | order(order asc)`);
        return cleanSanityDoc(features);
    } catch (e) {
        console.error("Get Features Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                               Team Members                                 */
/* -------------------------------------------------------------------------- */

export async function getTeamMembers() {
    try {
        const members = await sanityClient.fetch(`*[_type == "teamMember"] | order(order asc)`);
        return cleanSanityDoc(members);
    } catch (e) {
        console.error("Get Team Members Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                                   Jobs                                     */
/* -------------------------------------------------------------------------- */

export async function getJobs() {
    try {
        const jobs = await sanityClient.fetch(`*[_type == "job"] | order(order asc)`);
        return cleanSanityDoc(jobs);
    } catch (e) {
        console.error("Get Jobs Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                                Blog Posts                                  */
/* -------------------------------------------------------------------------- */

export async function getBlogPosts() {
    try {
        const posts = await sanityClient.fetch(`*[_type == "blogPost"] | order(date desc)`);
        return cleanSanityDoc(posts);
    } catch (e) {
        console.error("Get Blog Posts Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                              Press Releases                                */
/* -------------------------------------------------------------------------- */

export async function getPressReleases() {
    try {
        const releases = await sanityClient.fetch(`*[_type == "pressRelease"] | order(date desc)`);
        return cleanSanityDoc(releases);
    } catch (e) {
        console.error("Get Press Releases Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                                   Videos                                   */
/* -------------------------------------------------------------------------- */

export async function getShowcaseVideos() {
    try {
        const videos = await sanityClient.fetch(`*[_type == "video"] | order(order asc)`);
        return cleanSanityDoc(videos);
    } catch (e) {
        console.error("Get Showcase Videos Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                           Support Categories                               */
/* -------------------------------------------------------------------------- */

export async function getSupportCategories() {
    try {
        const categories = await sanityClient.fetch(`*[_type == "supportCategory"] | order(order asc)`);
        return cleanSanityDoc(categories);
    } catch (e) {
        console.error("Get Support Categories Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                            Support Articles                                */
/* -------------------------------------------------------------------------- */

export async function getSupportArticles() {
    try {
        const articles = await sanityClient.fetch(`*[_type == "supportArticle"] | order(order asc)`);
        return cleanSanityDoc(articles);
    } catch (e) {
        console.error("Get Support Articles Error:", e);
        return [];
    }
}

export async function getSupportArticlesByCategory(categoryId: string) {
    try {
        const articles = await sanityClient.fetch(
            `*[_type == "supportArticle" && categoryId == $categoryId] | order(order asc)`,
            { categoryId }
        );
        return cleanSanityDoc(articles);
    } catch (e) {
        console.error("Get Support Articles By Category Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                              Navigation Links                              */
/* -------------------------------------------------------------------------- */

export async function getNavLinks() {
    try {
        const links = await sanityClient.fetch(`*[_type == "navLink"] | order(order asc)`);
        return cleanSanityDoc(links);
    } catch (e) {
        console.error("Get Nav Links Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                              Footer Sections                               */
/* -------------------------------------------------------------------------- */

export async function getFooterSections() {
    try {
        const sections = await sanityClient.fetch(`*[_type == "footerSection"] | order(order asc)`);
        return cleanSanityDoc(sections);
    } catch (e) {
        console.error("Get Footer Sections Error:", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                            All Home Page Data                              */
/* -------------------------------------------------------------------------- */

export async function getHomePageData() {
    try {
        const [org, features, stats, testimonials, videos, faqs] = await Promise.all([
            getOrganizationDetails(),
            getFeatures(),
            sanityClient.fetch(`*[_type == "organization"][0].stats`),
            getTestimonials(),
            getShowcaseVideos(),
            getFAQs()
        ]);

        return {
            organization: org,
            features: cleanSanityDoc(features) || [],
            stats: cleanSanityDoc(stats) || [],
            testimonials: cleanSanityDoc(testimonials) || [],
            videos: cleanSanityDoc(videos) || [],
            faqs: cleanSanityDoc(faqs) || []
        };
    } catch (e) {
        console.error("Get Home Page Data Error:", e);
        return null;
    }
}
