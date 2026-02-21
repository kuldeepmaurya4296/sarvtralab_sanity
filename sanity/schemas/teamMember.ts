// Sanity schema: Team Member
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'teamMember',
    title: 'Team Member',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'role', title: 'Role', type: 'string' }),
        defineField({ name: 'bio', title: 'Bio', type: 'text' }),
        defineField({ name: 'image', title: 'Image URL', type: 'url' }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'role' }
    }
});
