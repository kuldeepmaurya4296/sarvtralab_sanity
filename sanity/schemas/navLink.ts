// Sanity schema: Navigation Link
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'navLink',
    title: 'Navigation Link',
    type: 'document',
    fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'label', subtitle: 'href' }
    }
});
