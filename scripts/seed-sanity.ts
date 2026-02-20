
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03',
});

const EXPORT_DIR = path.join(process.cwd(), 'data', 'exports');

const collections = [
    { file: 'schools.json', type: 'school' },
    { file: 'plans.json', type: 'plan' },
    { file: 'users.json', type: 'user' },
    { file: 'courses.json', type: 'course' },
    { file: 'enrollments.json', type: 'enrollment' },
    { file: 'payments.json', type: 'payment' },
    { file: 'certificates.json', type: 'certificate' },
    { file: 'assignments.json', type: 'assignment' },
    { file: 'submissions.json', type: 'submission' },
    { file: 'materials.json', type: 'material' },
    { file: 'activityLogs.json', type: 'activityLog' },
    { file: 'attendance.json', type: 'attendance' },
    { file: 'reports.json', type: 'report' },
    { file: 'supportTickets.json', type: 'supportTicket' },
    { file: 'leads.json', type: 'lead' },
    { file: 'notifications.json', type: 'notification' },
    { file: 'libraryFolders.json', type: 'libraryFolder' },
    { file: 'libraryContent.json', type: 'libraryContent' },
];

async function seed() {
    console.log('--- Starting Sanity Seeding ---');

    // Step 1: Build ID Map (customId -> _id)
    const idMap: Record<string, string> = {};
    for (const col of collections) {
        const filePath = path.join(EXPORT_DIR, col.file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            for (const doc of data) {
                if (doc.id && doc._id) {
                    idMap[doc.id] = doc._id;
                }
            }
        }
    }
    console.log(`Built ID map with ${Object.keys(idMap).length} entries.`);

    // Helper to resolve reference ID
    const resolveId = (val: any) => {
        if (typeof val !== 'string') return val;
        // If it's a known customId, return the mapped _id
        if (idMap[val]) return idMap[val];
        // Otherwise return as is (might be ObjectID or already _id)
        return val;
    };

    for (const col of collections) {
        const filePath = path.join(EXPORT_DIR, col.file);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`Seeding ${col.type} (${data.length} documents)...`);

        for (const doc of data) {
            const { _id, __v, ...rest } = doc;

            // Map common MongoDB fields to Sanity structure
            const sanityDoc: any = {
                _type: col.type,
                _id: _id, // Keep the same ID for references to work
                ...rest,
            };

            // Custom ID preservation
            if (doc.id) {
                sanityDoc.customId = doc.id;
                delete sanityDoc.id;
            }

            // Reference Mapping with Resolution
            if (doc.schoolId) {
                sanityDoc.schoolRef = { _type: 'reference', _ref: resolveId(doc.schoolId) };
            }

            if (doc.instructor) {
                sanityDoc.instructorRef = { _type: 'reference', _ref: resolveId(doc.instructor) };
            }

            if (doc.student) {
                sanityDoc.studentRef = { _type: 'reference', _ref: resolveId(doc.student) };
            }

            if (doc.course) {
                sanityDoc.courseRef = { _type: 'reference', _ref: resolveId(doc.course) };
            }

            if (doc.user) {
                sanityDoc.userRef = { _type: 'reference', _ref: resolveId(doc.user) };
            }

            // Special Case: Support Ticket Messages
            if (col.type === 'supportTicket' && Array.isArray(sanityDoc.messages)) {
                sanityDoc.messages = sanityDoc.messages.map((m: any, idx: number) => ({
                    _key: `msg-${idx}`,
                    ...m
                }));
            }

            // Special Case: Course Curriculum
            if (col.type === 'course' && Array.isArray(sanityDoc.curriculum)) {
                sanityDoc.curriculum = sanityDoc.curriculum.map((module: any, mIdx: number) => ({
                    _key: module.id || `mod-${mIdx}`,
                    ...module,
                    lessons: Array.isArray(module.lessons)
                        ? module.lessons.map((lesson: any, lIdx: number) => ({
                            _key: lesson.id || `les-${lIdx}`,
                            ...lesson
                        }))
                        : []
                }));
            }

            try {
                await client.createOrReplace(sanityDoc);
            } catch (err: any) {
                console.error(`Failed to seed ${col.type} document ${_id}:`, err?.message || err);
            }
        }
    }

    console.log('--- Seeding Complete ---');
}

seed().catch(err => {
    console.error('Seeding script failed:', err);
    process.exit(1);
});
