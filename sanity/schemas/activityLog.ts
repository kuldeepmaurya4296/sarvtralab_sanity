// Sanity schema: ActivityLog document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'activityLog',
    title: 'Activity Log',
    type: 'document',
    fields: [
        defineField({ name: 'user', title: 'User ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'userRole', title: 'User Role', type: 'string' }),
        defineField({ name: 'action', title: 'Action', type: 'string', validation: r => r.required() }),
        defineField({ name: 'details', title: 'Details', type: 'text', validation: r => r.required() }),
        defineField({ name: 'entityType', title: 'Entity Type', type: 'string' }),
        defineField({ name: 'entityId', title: 'Entity ID', type: 'string' }),
        defineField({ name: 'ipAddress', title: 'IP Address', type: 'string' }),
        defineField({ name: 'timestamp', title: 'Timestamp', type: 'datetime' }),
    ],
    preview: { select: { title: 'action', subtitle: 'user' } }
});
