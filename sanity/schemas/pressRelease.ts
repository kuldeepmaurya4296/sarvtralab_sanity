// Sanity schema: Press Release
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'pressRelease',
    title: 'Press Release',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'date', title: 'Date', type: 'string' }),
        defineField({ name: 'source', title: 'Source', type: 'string' }),
        defineField({ name: 'link', title: 'Link', type: 'url' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'source' }
    }
});
