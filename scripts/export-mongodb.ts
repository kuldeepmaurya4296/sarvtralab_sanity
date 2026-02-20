/**
 * MongoDB Export Script
 * 
 * Exports all collections from MongoDB Atlas to local JSON files in data/exports/
 * Run from project root: cmd /c "npx ts-node -P scripts/tsconfig.json scripts/export-mongodb.ts"
 * 
 * Must be run BEFORE removing MongoDB dependencies.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const OUTPUT_DIR = path.resolve(__dirname, '../data/exports');

// Import all Mongoose models using relative paths
import User from '../lib/models/User';
import Course from '../lib/models/Course';
import School from '../lib/models/School';
import Plan from '../lib/models/Plan';
import Payment from '../lib/models/Payment';
import Enrollment from '../lib/models/Enrollment';
import Certificate from '../lib/models/Certificate';
import Assignment from '../lib/models/Assignment';
import Submission from '../lib/models/Submission';
import Material from '../lib/models/Material';
import ActivityLog from '../lib/models/ActivityLog';
import Attendance from '../lib/models/Attendance';
import Report from '../lib/models/Report';
import SupportTicket from '../lib/models/SupportTicket';
import Lead from '../lib/models/Lead';
import Notification from '../lib/models/Notification';
import { LibraryFolder, LibraryContent } from '../lib/models/Library';

interface CollectionExport {
    name: string;
    filename: string;
    model: mongoose.Model<any>;
}

const collections: CollectionExport[] = [
    { name: 'Users', filename: 'users.json', model: User },
    { name: 'Courses', filename: 'courses.json', model: Course },
    { name: 'Schools', filename: 'schools.json', model: School },
    { name: 'Plans', filename: 'plans.json', model: Plan },
    { name: 'Payments', filename: 'payments.json', model: Payment },
    { name: 'Enrollments', filename: 'enrollments.json', model: Enrollment },
    { name: 'Certificates', filename: 'certificates.json', model: Certificate },
    { name: 'Assignments', filename: 'assignments.json', model: Assignment },
    { name: 'Submissions', filename: 'submissions.json', model: Submission },
    { name: 'Materials', filename: 'materials.json', model: Material },
    { name: 'ActivityLogs', filename: 'activityLogs.json', model: ActivityLog },
    { name: 'Attendance', filename: 'attendance.json', model: Attendance },
    { name: 'Reports', filename: 'reports.json', model: Report },
    { name: 'SupportTickets', filename: 'supportTickets.json', model: SupportTicket },
    { name: 'Leads', filename: 'leads.json', model: Lead },
    { name: 'Notifications', filename: 'notifications.json', model: Notification },
    { name: 'LibraryFolders', filename: 'libraryFolders.json', model: LibraryFolder },
    { name: 'LibraryContent', filename: 'libraryContent.json', model: LibraryContent },
];

async function exportAll() {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB\n');

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let totalDocs = 0;

    for (const col of collections) {
        try {
            const docs = await col.model.find({}).lean();
            const filePath = path.join(OUTPUT_DIR, col.filename);

            // Serialize ObjectIds and Dates to strings for portability
            const serialized = JSON.parse(JSON.stringify(docs));

            fs.writeFileSync(filePath, JSON.stringify(serialized, null, 2), 'utf-8');
            console.log(`  ${col.name}: ${docs.length} documents -> ${col.filename}`);
            totalDocs += docs.length;
        } catch (err: any) {
            // Collection might not exist yet
            console.log(`  ${col.name}: ${err.message || 'No data'} -> skipped`);
            const filePath = path.join(OUTPUT_DIR, col.filename);
            fs.writeFileSync(filePath, '[]', 'utf-8');
        }
    }

    console.log(`\nExport complete: ${totalDocs} total documents exported to data/exports/`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
}

exportAll().catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
});
