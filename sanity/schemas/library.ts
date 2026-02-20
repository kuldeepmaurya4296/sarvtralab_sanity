// Sanity schemas: Library Folder + Library Content document types
import { defineField, defineType } from 'sanity';

export const libraryFolder = defineType({
    name: 'libraryFolder',
    title: 'Library Folder',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'parentId', title: 'Parent ID', type: 'string' }),
        defineField({ name: 'path', title: 'Path', type: 'string' }),
    ],
    preview: { select: { title: 'name' } }
});

export const libraryContent = defineType({
    name: 'libraryContent',
    title: 'Library Content',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
            name: 'contentType', title: 'Type', type: 'string',
            options: { list: ['Video', 'PDF', 'Image', 'Doc', 'Other'] }
        }),
        defineField({ name: 'url', title: 'URL', type: 'string' }),
        defineField({ name: 'fileUrl', title: 'File URL', type: 'string' }),
        defineField({ name: 'folderId', title: 'Folder ID', type: 'string' }),
        defineField({ name: 'size', title: 'Size', type: 'string' }),
        defineField({
            name: 'status', title: 'Status', type: 'string',
            options: { list: ['Published', 'Draft', 'Archived'] }, initialValue: 'Published'
        }),
        defineField({ name: 'courseIds', title: 'Course IDs', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'lastModified', title: 'Last Modified', type: 'string' }),
    ],
    preview: { select: { title: 'title', subtitle: 'contentType' } }
});
