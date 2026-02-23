// Sanity schema: Legal Content (Privacy Policy, Terms, etc.)
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'legalContent',
    title: 'Legal Content',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
        defineField({
            name: 'sections',
            title: 'Content Sections',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
                        defineField({ name: 'subheading', title: 'Sub-heading (Optional)', type: 'string' }),
                        defineField({ name: 'paragraph', title: 'Content Paragraph', type: 'text' }),
                    ]
                }
            ]
        }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title' }
    }
});
