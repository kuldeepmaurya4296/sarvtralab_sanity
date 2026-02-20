'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
    name: 'sarvtra-labs-lms',
    title: 'Sarvtra Labs LMS',
    projectId,
    dataset,
    basePath: '/admin/studio',
    plugins: [structureTool()],
    schema: {
        types: schemaTypes,
    },
});
