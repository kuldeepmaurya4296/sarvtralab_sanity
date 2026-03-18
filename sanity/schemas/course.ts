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
        defineField({ name: 'skillFocus', title: 'Skill Focus', type: 'array', of: [{ type: 'string' }], description: 'e.g. Creativity, basic circuits, logical thinking' }),
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

        // Materials Required
        defineField({
            name: 'materialsRequired', title: 'Materials Required', type: 'array',
            of: [{
                type: 'object', name: 'materialCategory', title: 'Material Category',
                fields: [
                    defineField({ name: 'categoryName', title: 'Category Name', type: 'string', description: 'e.g. Electronics, Craft Supplies' }),
                    defineField({
                        name: 'items', title: 'Items', type: 'array',
                        of: [{
                            type: 'object', name: 'materialItem', title: 'Material Item',
                            fields: [
                                defineField({ name: 'name', title: 'Item Name', type: 'string' }),
                                defineField({ name: 'quantity', title: 'Quantity', type: 'string' }),
                            ]
                        }]
                    })
                ]
            }]
        }),

        // Safety Rules
        defineField({
            name: 'safetyRules', title: 'Safety Rules', type: 'array',
            of: [{ type: 'string' }],
            description: 'Safety instructions students must follow'
        }),

        // Step-by-step Instructions
        defineField({
            name: 'steps', title: 'Step-by-Step Instructions', type: 'array',
            of: [{
                type: 'object', name: 'courseStep', title: 'Step',
                fields: [
                    defineField({ name: 'stepNumber', title: 'Step Number', type: 'number' }),
                    defineField({ name: 'title', title: 'Step Title', type: 'string' }),
                    defineField({ name: 'partsNeeded', title: 'Parts Needed', type: 'array', of: [{ type: 'string' }] }),
                    defineField({ name: 'actions', title: 'Actions', type: 'array', of: [{ type: 'string' }] }),
                    defineField({ name: 'tips', title: 'Tips', type: 'text' }),
                    defineField({ name: 'output', title: 'Expected Output', type: 'string' }),
                ]
            }]
        }),

        // Learning Outcomes
        defineField({
            name: 'learningOutcomes', title: 'Learning Outcomes', type: 'array',
            of: [{ type: 'string' }],
            description: 'What students will learn from this course'
        }),

        // Extension Activities
        defineField({
            name: 'extensionActivities', title: 'Extension Activities', type: 'array',
            of: [{ type: 'string' }],
            description: 'Optional advanced activities for further exploration'
        }),

        // Teacher Note
        defineField({
            name: 'teacherNote', title: 'Teacher Note', type: 'text',
            description: 'Notes and guidance for teachers'
        }),

        // Curriculum (existing)
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
                                defineField({ name: 'description', title: 'Description / Content', type: 'text' }),
                                defineField({
                                    name: 'resourceUrls', title: 'Resource URLs', type: 'array',
                                    of: [{ type: 'string' }]
                                }),
                            ]
                        }]
                    })
                ]
            }]
        }),
        defineField({
            name: 'richContent',
            title: 'Dynamic Course Content (Rich Text)',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H1', value: 'h1' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'Quote', value: 'blockquote' }
                    ],
                    lists: [{ title: 'Bullet', value: 'bullet' }, { title: 'Number', value: 'number' }],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' }
                        ],
                    }
                },
                { type: 'image', options: { hotspot: true } }
            ]
        }),
        defineField({
            name: 'dynamicHtml',
            title: 'Dynamic Content (HTML)',
            type: 'text',
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
