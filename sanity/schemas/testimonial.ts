// Sanity schema: Testimonial
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'role', title: 'Role', type: 'string' }),
        defineField({ name: 'school', title: 'School/Organization', type: 'string' }),
        defineField({ name: 'content', title: 'Content', type: 'text' }),
        defineField({ name: 'rating', title: 'Rating', type: 'number' }),
        defineField({ name: 'avatar', title: 'Avatar URL', type: 'url' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'role' }
    }
});
