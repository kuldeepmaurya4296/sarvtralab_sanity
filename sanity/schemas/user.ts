// Sanity schema: User document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'email', title: 'Email', type: 'string', validation: r => r.required() }),
        defineField({ name: 'password', title: 'Password (hashed)', type: 'string', hidden: true }),
        defineField({
            name: 'role', title: 'Role', type: 'string',
            options: { list: ['student', 'school', 'govt', 'superadmin', 'teacher', 'helpsupport'] },
            validation: r => r.required()
        }),
        defineField({ name: 'name', title: 'Name', type: 'string', validation: r => r.required() }),
        defineField({ name: 'avatar', title: 'Avatar URL', type: 'string' }),

        // Student fields
        defineField({ name: 'schoolRef', title: 'School (Ref)', type: 'reference', to: [{ type: 'school' }] }),
        defineField({ name: 'schoolName', title: 'School Name', type: 'string' }),
        defineField({ name: 'grade', title: 'Grade', type: 'string' }),
        defineField({ name: 'parentName', title: 'Parent Name', type: 'string' }),
        defineField({ name: 'parentPhone', title: 'Parent Phone', type: 'string' }),
        defineField({ name: 'parentEmail', title: 'Parent Email', type: 'string' }),
        defineField({ name: 'dateOfBirth', title: 'Date of Birth', type: 'string' }),
        defineField({ name: 'address', title: 'Address', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'pincode', title: 'Pincode', type: 'string' }),
        defineField({ name: 'enrolledCourses', title: 'Enrolled Courses', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'completedCourses', title: 'Completed Courses', type: 'array', of: [{ type: 'string' }] }),

        // School fields
        defineField({ name: 'schoolCode', title: 'School Code', type: 'string' }),
        defineField({ name: 'principalName', title: 'Principal Name', type: 'string' }),
        defineField({ name: 'schoolType', title: 'School Type', type: 'string', options: { list: ['government', 'private', 'aided'] } }),
        defineField({ name: 'board', title: 'Board', type: 'string', options: { list: ['CBSE', 'ICSE', 'State Board'] } }),
        defineField({ name: 'totalStudents', title: 'Total Students', type: 'number' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'websiteUrl', title: 'Website URL', type: 'string' }),

        // Govt fields
        defineField({ name: 'organizationType', title: 'Organization Type', type: 'string' }),
        defineField({ name: 'organizationName', title: 'Organization Name', type: 'string' }),
        defineField({ name: 'designation', title: 'Designation', type: 'string' }),
        defineField({ name: 'department', title: 'Department', type: 'string' }),
        defineField({ name: 'jurisdiction', title: 'Jurisdiction', type: 'string' }),
        defineField({ name: 'district', title: 'District', type: 'string' }),

        // Common fields
        defineField({ name: 'assignedSchools', title: 'Assigned Schools', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'assignedCourses', title: 'Assigned Courses', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'status', title: 'Status', type: 'string', initialValue: 'active' }),

        // Teacher fields
        defineField({ name: 'specialization', title: 'Specialization', type: 'string' }),
        defineField({ name: 'qualifications', title: 'Qualifications', type: 'string' }),
        defineField({ name: 'degree', title: 'Degree', type: 'string' }),
        defineField({ name: 'institution', title: 'Institution', type: 'string' }),
        defineField({ name: 'experience', title: 'Experience (years)', type: 'number' }),
        defineField({ name: 'bio', title: 'Bio', type: 'text' }),
        defineField({ name: 'gender', title: 'Gender', type: 'string', options: { list: ['Male', 'Female', 'Other'] } }),
        defineField({ name: 'linkedInUrl', title: 'LinkedIn URL', type: 'string' }),
        defineField({ name: 'twitterUrl', title: 'Twitter URL', type: 'string' }),
        defineField({ name: 'availability', title: 'Availability', type: 'string', options: { list: ['Full-time', 'Part-time', 'Freelance'] } }),
        defineField({ name: 'availabilityStatus', title: 'Availability Status', type: 'string', initialValue: 'available', options: { list: ['available', 'busy', 'offline'] } }),

        // Helper fields
        defineField({ name: 'assignedStudents', title: 'Assigned Students', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'ticketsResolved', title: 'Tickets Resolved', type: 'number' }),
        defineField({ name: 'ticketsPending', title: 'Tickets Pending', type: 'number' }),

        // SuperAdmin fields
        defineField({ name: 'permissions', title: 'Permissions', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'lastLogin', title: 'Last Login', type: 'string' }),

        // Subscription
        defineField({ name: 'subscriptionPlan', title: 'Subscription Plan', type: 'string' }),
        defineField({ name: 'subscriptionExpiry', title: 'Subscription Expiry', type: 'string' }),
        // Profile Status
        defineField({ name: 'profileCompleted', title: 'Profile Completed', type: 'boolean', initialValue: false }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'role' }
    }
});
