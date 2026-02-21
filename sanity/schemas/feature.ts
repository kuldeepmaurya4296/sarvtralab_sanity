// Sanity schema: Feature
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'feature',
    title: 'Feature',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'icon', title: 'Icon Name', type: 'string' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title' }
    }
});
