// Sanity schema: Course document type
import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'course',
    title: 'Course',
    type: 'document',
    fields: [
        defineField({ name: 'customId', title: 'Custom ID', type: 'string', validation: r => r.required() }),
        defineField({ name: 'title', title: 'Title', type: 'string', validation: r => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'grade', title: 'Grade', type: 'string' }),
        defineField({ name: 'duration', title: 'Duration', type: 'string' }),
        defineField({ name: 'sessions', title: 'Sessions', type: 'number' }),
        defineField({ name: 'totalHours', title: 'Total Hours', type: 'number' }),
        defineField({ name: 'price', title: 'Price', type: 'number' }),
        defineField({ name: 'originalPrice', title: 'Original Price', type: 'number' }),
        defineField({ name: 'emiAvailable', title: 'EMI Available', type: 'boolean' }),
        defineField({ name: 'emiAmount', title: 'EMI Amount', type: 'number' }),
        defineField({ name: 'emiMonths', title: 'EMI Months', type: 'number' }),
        defineField({ name: 'image', title: 'Image URL', type: 'string' }),
        defineField({
            name: 'category', title: 'Category', type: 'string',
            options: { list: ['foundation', 'intermediate', 'advanced'] }
        }),
        defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'features', title: 'Features', type: 'array', of: [{ type: 'string' }] }),
        defineField({
            name: 'curriculum', title: 'Curriculum', type: 'array',
            of: [{
                type: 'object', name: 'curriculumModule', title: 'Module',
                fields: [
                    defineField({ name: 'moduleId', title: 'Module ID', type: 'string' }),
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'duration', title: 'Duration', type: 'string' }),
                    defineField({
                        name: 'lessons', title: 'Lessons', type: 'array',
                        of: [{
                            type: 'object', name: 'lesson', title: 'Lesson',
                            fields: [
                                defineField({ name: 'lessonId', title: 'Lesson ID', type: 'string' }),
                                defineField({ name: 'title', title: 'Title', type: 'string' }),
                                defineField({ name: 'duration', title: 'Duration', type: 'string' }),
                                defineField({
                                    name: 'lessonType', title: 'Type', type: 'string',
                                    options: { list: ['video', 'pdf', 'quiz', 'project'] }
                                }),
                                defineField({ name: 'isCompleted', title: 'Completed', type: 'boolean' }),
                                defineField({ name: 'videoUrl', title: 'Video URL', type: 'string' }),
                            ]
                        }]
                    })
                ]
            }]
        }),
        defineField({ name: 'rating', title: 'Rating', type: 'number' }),
        defineField({ name: 'studentsEnrolled', title: 'Students Enrolled', type: 'number', initialValue: 0 }),
        defineField({ name: 'instructor', title: 'Instructor', type: 'reference', to: [{ type: 'user' }] }),
        defineField({ name: 'schoolRef', title: 'School', type: 'reference', to: [{ type: 'school' }] }),
        defineField({
            name: 'level', title: 'Level', type: 'string',
            options: { list: ['Beginner', 'Intermediate', 'Advanced'] }
        }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'category' }
    }
});
