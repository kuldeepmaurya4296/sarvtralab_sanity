import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
    console.error('Missing required Sanity environment variables (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN).');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    token,
    useCdn: false
});

const defaultFooterSections = [
    {
        _type: 'footerSection',
        category: 'courses',
        title: 'Courses',
        order: 1,
        links: [
            { _type: 'object', _key: 'link01', label: 'Foundation Track (4-6)', href: '/courses?category=foundation' },
            { _type: 'object', _key: 'link02', label: 'Intermediate Track (7-10)', href: '/courses?category=intermediate' },
            { _type: 'object', _key: 'link03', label: 'Advanced Track (11-12)', href: '/courses?category=advanced' },
            { _type: 'object', _key: 'link04', label: 'School Programs', href: '/schools' }
        ]
    },
    {
        _type: 'footerSection',
        category: 'company',
        title: 'Company',
        order: 2,
        links: [
            { _type: 'object', _key: 'link05', label: 'About Us', href: '/about' },
            { _type: 'object', _key: 'link06', label: 'Careers', href: '/careers' },
            { _type: 'object', _key: 'link07', label: 'Blog', href: '/blog' },
            { _type: 'object', _key: 'link08', label: 'Press Kit', href: '/press' }
        ]
    },
    {
        _type: 'footerSection',
        category: 'support',
        title: 'Support',
        order: 3,
        links: [
            { _type: 'object', _key: 'link09', label: 'Help Center', href: '/help' },
            { _type: 'object', _key: 'link10', label: 'Contact Us', href: '/contact' },
            { _type: 'object', _key: 'link11', label: 'FAQs', href: '/#faqs' },
            { _type: 'object', _key: 'link12', label: 'Privacy Policy', href: '/privacy' }
        ]
    },
    {
        _type: 'footerSection',
        category: 'dashboards',
        title: 'Dashboards',
        order: 4,
        links: [
            { _type: 'object', _key: 'link13', label: 'Student Dashboard', href: '/student/dashboard' },
            { _type: 'object', _key: 'link14', label: 'School Dashboard', href: '/school/dashboard' },
            { _type: 'object', _key: 'link15', label: 'Govt Portal', href: '/govt/dashboard' },
            { _type: 'object', _key: 'link16', label: 'Super Admin', href: '/admin/dashboard' }
        ]
    }
];

const defaultNavLinks = [
    { _type: 'navLink', label: 'Home', href: '/', order: 1 },
    { _type: 'navLink', label: 'Courses', href: '/courses', order: 2 },
    { _type: 'navLink', label: 'For Schools', href: '/schools', order: 3 },
    { _type: 'navLink', label: 'About Us', href: '/about', order: 4 },
    { _type: 'navLink', label: 'Contact', href: '/contact', order: 5 }
];

const defaultFeatures = [
    { _type: 'feature', title: 'CBSE Aligned Curriculum', description: 'Our courses are designed in accordance with NCF 2023, NEP 2020, and CBSE Skill Education Framework.', iconName: 'GraduationCap', order: 1 },
    { _type: 'feature', title: 'Hands-on Learning', description: 'Project-based learning with real robotics kits delivered to your doorstep.', iconName: 'Wrench', order: 2 },
    { _type: 'feature', title: 'Expert Instructors', description: 'Learn from IIT/NIT alumni and industry professionals with years of experience.', iconName: 'Users', order: 3 },
    { _type: 'feature', title: 'Competition Ready', description: 'Prepare for national and international robotics competitions like ATL, WRO, and more.', iconName: 'Trophy', order: 4 },
    { _type: 'feature', title: 'Progress Tracking', description: 'Real-time progress reports for students, parents, and schools.', iconName: 'BarChart3', order: 5 },
    { _type: 'feature', title: 'Certification', description: 'Industry-recognized certificates on course completion.', iconName: 'Award', order: 6 }
];

const defaultVideos = [
    { _type: 'video', title: 'Introduction to Robotics for Kids', description: 'Learn the basics of robotics', thumbnail: '/placeholder.svg', duration: '5:32', views: 125000, category: 'Foundation', videoUrl: 'https://www.youtube.com/embed/81rczD64n9I', order: 1 },
    { _type: 'video', title: 'Building Your First Robot', description: 'Step-by-step guide', thumbnail: '/placeholder.svg', duration: '8:15', views: 98000, category: 'Foundation', videoUrl: 'https://www.youtube.com/embed/0H5g9Vs0ENM', order: 2 },
    { _type: 'video', title: 'Python Programming for Robotics', description: 'Master Python', thumbnail: '/placeholder.svg', duration: '12:45', views: 75000, category: 'Intermediate', videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw', order: 3 }
];

const defaultOrg = {
    _id: `organization-main-001`,
    _type: 'organization',
    name: 'Sarvtra Labs',
    tagline: 'Empowering Next-Gen Innovators',
    description: "Sarvtra Labs is India's premier robotics education platform, dedicated to making STEM education accessible, engaging, and aligned with global standards.",
    email: 'connect@pushpako2.com',
    phone: '+91-8085613350',
    address: 'Bhopal, Madhya Pradesh',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    mission: "To democratize robotics and coding education in India by providing affordable, high-quality, and curriculum-aligned learning experiences that prepare students for the future of technology.",
    vision: "To become India's most trusted robotics education partner, reaching 1 million students by 2030 and creating a new generation of innovators, problem-solvers, and technology leaders.",
    values: [
        { _type: 'object', _key: 'val1', icon: 'Heart', title: 'Passion for Education', description: 'We believe every student deserves access to quality STEM education' },
        { _type: 'object', _key: 'val2', icon: 'Lightbulb', title: 'Innovation First', description: 'Constantly evolving our curriculum to match industry trends' },
        { _type: 'object', _key: 'val3', icon: 'Users', title: 'Community Driven', description: 'Building a network of learners, educators, and innovators' },
        { _type: 'object', _key: 'val4', icon: 'Trophy', title: 'Excellence Always', description: 'Committed to delivering the best learning outcomes' }
    ],
    milestones: [
        { _type: 'object', _key: 'ms1', year: '2019', event: 'Sarvtra Labs founded in Bhopal' },
        { _type: 'object', _key: 'ms2', year: '2020', event: 'First 10 school partnerships' },
        { _type: 'object', _key: 'ms3', year: '2021', event: 'Launched online learning platform' },
        { _type: 'object', _key: 'ms4', year: '2022', event: 'Expanded to 10 states' },
        { _type: 'object', _key: 'ms5', year: '2023', event: 'CBSE official curriculum partner' },
        { _type: 'object', _key: 'ms6', year: '2024', event: '15,000+ students trained' }
    ]
};

async function clearAndSeed(type, items) {
    console.log(`Clearing ${type}s...`);
    const existing = await client.fetch(`*[_type == "${type}"]`);
    for (let el of existing) {
        await client.delete(el._id);
        console.log(`Deleted ${el._id}`);
    }

    console.log(`Seeding new ${type}s...`);
    for (let item of items) {
        const res = await client.create(item);
        console.log(`Created ${type}: ${res._id}`);
    }
}

const defaultLegalDocs = [
    {
        _type: 'legalContent',
        title: 'Privacy Policy',
        slug: { _type: 'slug', current: 'privacy' },
        order: 1,
        sections: [
            { _type: 'object', _key: 's1', heading: '1. Information We Collect', subheading: '', paragraph: 'We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.' },
            { _type: 'object', _key: 's2', heading: '2. Usage of Information', subheading: '', paragraph: 'We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we\'ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.' },
            { _type: 'object', _key: 's3', heading: '3. Sharing of Information', subheading: '', paragraph: 'We don\'t share any personally identifying information publicly or with third-parties, except when required to by law.' },
            { _type: 'object', _key: 's4', heading: '4. Cookies', subheading: '', paragraph: 'We use cookies to maintain your session and preferences. You provide consent to use cookies when you effectively use our website.' }
        ]
    },
    {
        _type: 'legalContent',
        title: 'Terms of Service',
        slug: { _type: 'slug', current: 'terms' },
        order: 2,
        sections: [
            { _type: 'object', _key: 't1', heading: '1. Acceptance of Terms', subheading: '', paragraph: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.' },
            { _type: 'object', _key: 't2', heading: '2. Use of License', subheading: '', paragraph: 'Permission is granted to temporarily download one copy of the materials (information or software) on Sarvtra Labs\'s website for personal, non-commercial transitory viewing only.' },
            { _type: 'object', _key: 't3', heading: '3. Disclaimer', subheading: '', paragraph: 'The materials on Sarvtra Labs\'s website are provided on an \'as is\' basis. Sarvtra Labs makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.' },
            { _type: 'object', _key: 't4', heading: '4. Limitations', subheading: '', paragraph: 'In no event shall Sarvtra Labs or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sarvtra Labs\'s website.' }
        ]
    },
    {
        _type: 'legalContent',
        title: 'Refund Policy',
        slug: { _type: 'slug', current: 'refund' },
        order: 3,
        sections: [
            { _type: 'object', _key: 'r1', heading: '1. Course Refunds', subheading: '', paragraph: 'We offer a full money-back guarantee for all purchases made on our website. If you are not satisfied with the course that you have purchased from us, you can get your money back no questions asked.' },
            { _type: 'object', _key: 'r2', heading: '2. Eligibility', subheading: '', paragraph: 'You are eligible for a full reimbursement within 14 calendar days of your purchase. After the 14-day period you will no longer be eligible and won\'t be able to receive a refund.' },
            { _type: 'object', _key: 'r3', heading: '3. Processing Time', subheading: '', paragraph: 'If you have any additional questions or would like to request a refund, feel free to contact us. Refunds are typically processed within 5-7 business days.' }
        ]
    }
];

async function seed() {
    try {
        console.log('Starting CMS Website Seeding Script...');

        await clearAndSeed('footerSection', defaultFooterSections);
        await clearAndSeed('navLink', defaultNavLinks);
        await clearAndSeed('feature', defaultFeatures);
        await clearAndSeed('video', defaultVideos);
        await clearAndSeed('legalContent', defaultLegalDocs);

        console.log(`Clearing old organization data...`);
        const orgs = await client.fetch(`*[_type == "organization"]`);
        for (let org of orgs) {
            await client.delete(org._id);
            console.log(`Deleted organization: ${org._id}`);
        }
        console.log(`Seeding organization default data...`);
        await client.createIfNotExists(defaultOrg);
        console.log(`Created Organization info successfully.`);

        console.log(`✅ Seeding Complete! Enjoy your CMS.`);
    } catch (err) {
        console.error('Seeding error:', err);
    }
}

seed();
