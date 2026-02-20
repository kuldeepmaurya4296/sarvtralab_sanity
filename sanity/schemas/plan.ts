// Sanity schema: Plan document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'plan',
    title: 'Plan',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text', validation: r => r.required() }),
        defineField({ name: 'price', title: 'Price', type: 'string', validation: r => r.required() }),
        defineField({ name: 'period', title: 'Period', type: 'string' }),
        defineField({ name: 'features', title: 'Features', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'popular', title: 'Popular', type: 'boolean', initialValue: false }),
        defineField({
            name: 'planType', title: 'Plan Type', type: 'string',
            options: { list: ['school', 'individual'] }, initialValue: 'school'
        }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['active', 'inactive'] }, initialValue: 'active'
        }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'price' }
    }
});
