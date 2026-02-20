// Sanity schema: Attendance document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'attendance',
    title: 'Attendance',
    type: 'document',
    fields: [
        defineField({ name: 'studentRef', title: 'Student', type: 'reference', to: [{ type: 'user' }], validation: r => r.required() }),
        defineField({ name: 'courseRef', title: 'Course', type: 'reference', to: [{ type: 'course' }], validation: r => r.required() }),
        defineField({ name: 'date', title: 'Date', type: 'datetime', validation: r => r.required() }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Present', 'Absent', 'Late', 'Excused'] }, initialValue: 'Absent'
        }),
        defineField({ name: 'sessionInfo', title: 'Session Info', type: 'string' }),
    ],
    preview: { select: { title: 'status', subtitle: 'date' } }
});
