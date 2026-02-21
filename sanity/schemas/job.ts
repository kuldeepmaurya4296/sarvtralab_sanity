// Sanity schema: Job
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'job',
    title: 'Job',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'department', title: 'Department', type: 'string' }),
        defineField({ name: 'location', title: 'Location', type: 'string' }),
        defineField({ name: 'type', title: 'Type', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'department' }
    }
});
