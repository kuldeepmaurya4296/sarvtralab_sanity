// Sanity schema: Organization details
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'organization',
    title: 'Organization',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Organization Name', type: 'string' }),
        defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'address', title: 'Address', type: 'string' }),
        defineField({ name: 'hours', title: 'Business Hours', type: 'string' }),
        defineField({ name: 'mapEmbedUrl', title: 'Map Embed URL', type: 'url' }),
        defineField({
            name: 'socials',
            title: 'Social Media Links',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'platform', title: 'Platform', type: 'string' }),
                    defineField({ name: 'url', title: 'URL', type: 'url' }),
                    defineField({ name: 'iconName', title: 'Icon Name', type: 'string' })
                ]
            }]
        }),
        defineField({
            name: 'stats',
            title: 'Statistics',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'value', title: 'Value', type: 'string' }),
                    defineField({ name: 'iconName', title: 'Icon Name', type: 'string' })
                ]
            }]
        }),
        defineField({ name: 'mission', title: 'Mission Statement', type: 'text' }),
        defineField({ name: 'vision', title: 'Vision Statement', type: 'text' }),
        defineField({
            name: 'values',
            title: 'Core Values',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'icon', title: 'Icon Name', type: 'string' }),
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'description', title: 'Description', type: 'text' })
                ]
            }]
        }),
        defineField({
            name: 'milestones',
            title: 'Journey Milestones',
            type: 'array',
            of: [{
                type: 'object',
                fields: [
                    defineField({ name: 'year', title: 'Year', type: 'string' }),
                    defineField({ name: 'event', title: 'Event Name', type: 'string' })
                ]
            }]
        }),
    ],
    preview: {
        select: { title: 'name' }
    }
});
