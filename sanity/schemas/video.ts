// Sanity schema: Video
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'video',
    title: 'Video',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'thumbnail', title: 'Thumbnail URL', type: 'url' }),
        defineField({ name: 'duration', title: 'Duration', type: 'string' }),
        defineField({ name: 'views', title: 'Views', type: 'number' }),
        defineField({ name: 'category', title: 'Category', type: 'string' }),
        defineField({ name: 'videoUrl', title: 'Video URL', type: 'url' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'category' }
    }
});
