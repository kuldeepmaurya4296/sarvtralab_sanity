// Sanity schema: Support Category
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'supportCategory',
    title: 'Support Category',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'iconName', title: 'Icon Name', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title' }
    }
});
