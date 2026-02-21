// Sanity schema: Blog Post
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'blogPost',
    title: 'Blog Post',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'excerpt', title: 'Excerpt', type: 'text' }),
        defineField({ name: 'date', title: 'Date', type: 'string' }),
        defineField({ name: 'author', title: 'Author', type: 'string' }),
        defineField({ name: 'image', title: 'Image URL', type: 'url' }),
        defineField({ name: 'category', title: 'Category', type: 'string' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'author' }
    }
});
