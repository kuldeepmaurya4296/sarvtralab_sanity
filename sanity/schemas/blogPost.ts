// Sanity schema: Blog Post
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'blogPost',
    title: 'Blog Post',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 }
        }),
        defineField({ name: 'excerpt', title: 'Excerpt', type: 'text' }),
        defineField({
            name: 'content',
            title: 'Content (HTML)',
            type: 'text'
        }),
        defineField({ name: 'date', title: 'Date', type: 'datetime' }),
        defineField({ name: 'author', title: 'Author', type: 'string' }),
        defineField({ name: 'image', title: 'Featured Image URL', type: 'url' }),
        defineField({ name: 'category', title: 'Category', type: 'string' }),
        defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'readTime', title: 'Read Time (mins)', type: 'number' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'author' }
    }
});
