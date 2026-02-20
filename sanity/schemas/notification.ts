// Sanity schema: Notification document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'notification',
    title: 'Notification',
    type: 'document',
    fields: [
        defineField({ name: 'userId', title: 'User ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
        defineField({ name: 'message', title: 'Message', type: 'text', validation: r => r.required() }),
        defineField({
            name: 'notificationType', title: 'Type', type: 'string',
            options: { list: ['info', 'success', 'warning', 'error'] }, initialValue: 'info'
        }),
        defineField({ name: 'link', title: 'Link', type: 'string' }),
        defineField({ name: 'isRead', title: 'Read', type: 'boolean', initialValue: false }),
    ],
    preview: { select: { title: 'title', subtitle: 'userId' } }
});
