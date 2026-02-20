// Sanity schema: Submission document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'submission',
    title: 'Submission',
    type: 'document',
    fields: [
        defineField({ name: 'assignmentRef', title: 'Assignment', type: 'reference', to: [{ type: 'assignment' }], validation: r => r.required() }),
        defineField({ name: 'studentRef', title: 'Student', type: 'reference', to: [{ type: 'user' }], validation: r => r.required() }),
        defineField({ name: 'content', title: 'Content', type: 'text' }),
        defineField({ name: 'submittedAt', title: 'Submitted At', type: 'datetime' }),
        defineField({ name: 'score', title: 'Score', type: 'number' }),
        defineField({ name: 'feedback', title: 'Feedback', type: 'text' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Submitted', 'Graded', 'Late'] }, initialValue: 'Submitted'
        }),
    ],
    preview: { select: { title: 'status', subtitle: 'score' } }
});
