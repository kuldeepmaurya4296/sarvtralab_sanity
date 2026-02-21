// Sanity schema: Footer Link Section
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'footerSection',
    title: 'Footer Section',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Section Title', type: 'string' }),
        defineField({ name: 'category', title: 'Category', type: 'string', options: { list: ['courses', 'company', 'support', 'dashboards'] } }),
        defineField({
            name: 'links',
            title: 'Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'label', title: 'Label', type: 'string' }),
                        defineField({ name: 'href', title: 'URL', type: 'string' })
                    ]
                }
            ]
        }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'category' }
    }
});
