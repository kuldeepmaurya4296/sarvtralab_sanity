// Sanity schema: Assignment document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'assignment',
    title: 'Assignment',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'courseRef', title: 'Course', type: 'reference', to: [{ type: 'course' }], validation: r => r.required() }),
        defineField({ name: 'module', title: 'Module ID', type: 'string' }),
        defineField({ name: 'dueDate', title: 'Due Date', type: 'datetime', validation: r => r.required() }),
        defineField({ name: 'maxScore', title: 'Max Score', type: 'number', initialValue: 100 }),
        defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: false }),
    ],
    preview: { select: { title: 'title', subtitle: 'published' } }
});
