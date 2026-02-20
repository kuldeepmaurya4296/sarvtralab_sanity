// Sanity schema: Enrollment document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'enrollment',
    title: 'Enrollment',
    type: 'document',
    fields: [
        defineField({ name: 'student', title: 'Student ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'courseRef', title: 'Course', type: 'reference', to: [{ type: 'course' }], validation: r => r.required() }),
        defineField({ name: 'courseCustomId', title: 'Course Custom ID', type: 'string' }),
        defineField({ name: 'enrolledAt', title: 'Enrolled At', type: 'datetime' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Active', 'Completed', 'Dropped'] }, initialValue: 'Active'
        }),
        defineField({ name: 'progress', title: 'Progress (%)', type: 'number', initialValue: 0 }),
        defineField({ name: 'watchTime', title: 'Watch Time (minutes)', type: 'number', initialValue: 0 }),
        defineField({ name: 'currentLesson', title: 'Current Lesson', type: 'string' }),
        defineField({ name: 'grade', title: 'Grade', type: 'string' }),
        defineField({ name: 'completionDate', title: 'Completion Date', type: 'datetime' }),
    ],
    preview: {
        select: { title: 'student', subtitle: 'status' }
    }
});
