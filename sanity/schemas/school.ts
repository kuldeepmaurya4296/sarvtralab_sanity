// Sanity schema: School document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'school',
    title: 'School',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'email', title: 'Email', type: 'string', validation: r => r.required() }),
        defineField({ name: 'schoolCode', title: 'School Code', type: 'string', validation: r => r.required() }),
        defineField({ name: 'principalName', title: 'Principal Name', type: 'string' }),
        defineField({
            name: 'schoolType', title: 'School Type', type: 'string',
            options: { list: ['government', 'private', 'aided'] }
        }),
        defineField({
            name: 'board', title: 'Board', type: 'string',
            options: { list: ['CBSE', 'ICSE', 'State Board'] }
        }),
        defineField({ name: 'totalStudents', title: 'Total Students', type: 'number', initialValue: 0 }),
        defineField({ name: 'address', title: 'Address', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'pincode', title: 'Pincode', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'websiteUrl', title: 'Website URL', type: 'string' }),
        defineField({ name: 'subscriptionPlan', title: 'Subscription Plan', type: 'string', initialValue: 'Basic' }),
        defineField({ name: 'subscriptionExpiry', title: 'Subscription Expiry', type: 'string' }),
        defineField({ name: 'assignedCourses', title: 'Assigned Courses', type: 'array', of: [{ type: 'string' }] }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'schoolCode' }
    }
});
