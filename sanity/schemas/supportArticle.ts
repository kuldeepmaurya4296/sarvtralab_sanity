// Sanity schema: Support Article
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'supportArticle',
    title: 'Support Article',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'summary', title: 'Summary', type: 'text' }),
        defineField({ name: 'content', title: 'Content', type: 'text' }),
        defineField({ name: 'categoryId', title: 'Category ID', type: 'string' }),
        defineField({ name: 'lastUpdated', title: 'Last Updated', type: 'string' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title' }
    }
});
