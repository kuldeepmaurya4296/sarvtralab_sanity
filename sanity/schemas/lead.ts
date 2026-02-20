// Sanity schema: Lead document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'lead',
    title: 'Lead',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'email', title: 'Email', type: 'string', validation: r => r.required() }),
        defineField({ name: 'phone', title: 'Phone', type: 'string', validation: r => r.required() }),
        defineField({ name: 'source', title: 'Source', type: 'string', initialValue: 'Organic' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['New', 'Contacted', 'Interested', 'Qualified', 'Converted', 'Lost'] }, initialValue: 'New'
        }),
        defineField({ name: 'assignedTo', title: 'Assigned To', type: 'reference', to: [{ type: 'user' }] }),
        defineField({ name: 'notes', title: 'Notes', type: 'text' }),
        defineField({ name: 'lastContactedAt', title: 'Last Contacted', type: 'datetime' }),
        defineField({ name: 'convertedToUser', title: 'Converted To User', type: 'reference', to: [{ type: 'user' }] }),
    ],
    preview: { select: { title: 'name', subtitle: 'status' } }
});
