// Sanity schema: Certificate document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'certificate',
    title: 'Certificate',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'studentId', title: 'Student ID', type: 'string' }),
        defineField({ name: 'courseId', title: 'Course ID', type: 'string' }),
        defineField({ name: 'issueDate', title: 'Issue Date', type: 'string' }),
        defineField({ name: 'hash', title: 'Hash', type: 'string' }),
        defineField({ name: 'downloadUrl', title: 'Download URL', type: 'string' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['issued', 'revoked'] }, initialValue: 'issued'
        }),
    ],
    preview: { select: { title: 'studentId', subtitle: 'courseId' } }
});
