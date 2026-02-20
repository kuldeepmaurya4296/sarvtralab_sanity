// Sanity schema: SupportTicket document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'supportTicket',
    title: 'Support Ticket',
    type: 'document',
    fields: [
        defineField({ name: 'ticketId', title: 'Ticket ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'userRef', title: 'User', type: 'reference', to: [{ type: 'user' }], validation: r => r.required() }),
        defineField({ name: 'subject', title: 'Subject', type: 'string', validation: r => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text', validation: r => r.required() }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Open', 'In Progress', 'Resolved', 'Closed'] }, initialValue: 'Open'
        }),
        defineField({
            name: 'priority', title: 'Priority', type: 'string',
            options: { list: ['Low', 'Medium', 'High', 'Critical'] }, initialValue: 'Medium'
        }),
        defineField({ name: 'assignedTo', title: 'Assigned To', type: 'reference', to: [{ type: 'user' }] }),
        defineField({
            name: 'messages', title: 'Messages', type: 'array',
            of: [{
                type: 'object', name: 'ticketMessage', title: 'Message',
                fields: [
                    defineField({ name: 'senderRef', title: 'Sender', type: 'reference', to: [{ type: 'user' }] }),
                    defineField({ name: 'message', title: 'Message', type: 'text' }),
                    defineField({ name: 'sentAt', title: 'Sent At', type: 'datetime' }),
                ]
            }]
        }),
    ],
    preview: { select: { title: 'subject', subtitle: 'status' } }
});
