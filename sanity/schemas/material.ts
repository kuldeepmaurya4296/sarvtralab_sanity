// Sanity schema: Material document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'material',
    title: 'Material',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'course', title: 'Course', type: 'string' }),
        defineField({ name: 'instructor', title: 'Instructor', type: 'string' }),
        defineField({
            name: 'materialType', title: 'Type', type: 'string',
            options: { list: ['pdf', 'video', 'link', 'zip'] }
        }),
        defineField({ name: 'size', title: 'Size', type: 'string' }),
        defineField({ name: 'courseId', title: 'Course ID', type: 'string' }),
        defineField({ name: 'moduleId', title: 'Module ID', type: 'string' }),
        defineField({ name: 'downloadUrl', title: 'Download URL', type: 'string' }),
        defineField({ name: 'uploadedAt', title: 'Uploaded At', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
    ],
    preview: { select: { title: 'title', subtitle: 'materialType' } }
});
