
export interface Lesson {
    id?: string;
    _id?: string;
    lessonId?: string;
    title: string;
    description?: string;
    duration: string;
    videoUrl?: string;
    lessonType?: 'video' | 'pdf' | 'quiz' | 'project';
    resourceUrls?: string[];
    isFree?: boolean;
    isCompleted?: boolean;
}

export interface CurriculumModule {
    id?: string;
    _id?: string;
    moduleId?: string;
    title: string;
    lessons: Lesson[];
    duration?: string;
}

export interface MaterialItem {
    name: string;
    quantity?: string;
}

export interface MaterialCategory {
    categoryName: string;
    items: MaterialItem[];
}

export interface CourseStep {
    stepNumber: number;
    title: string;
    partsNeeded?: string[];
    actions: string[];
    tips?: string;
    output?: string;
}

export interface Course {
    id: string;
    _id?: string;
    customId?: string;
    title: string;
    description: string;
    category: 'foundation' | 'intermediate' | 'advanced';
    grade: string;
    price: number;
    originalPrice: number;
    thumbnail?: string;
    image?: string;
    totalHours: number;
    sessions?: number;
    studentsEnrolled: number;
    rating: number;
    level: string;
    duration?: string;
    emiAvailable: boolean;
    emiAmount?: number;
    emiMonths?: number;
    curriculum: CurriculumModule[];
    instructor?: string;
    tags?: string[];
    features?: string[];

    // New structured course content fields
    ageGroup?: string;
    skillFocus?: string[];
    materialsRequired?: MaterialCategory[];
    safetyRules?: string[];
    steps?: CourseStep[];
    learningOutcomes?: string[];
    extensionActivities?: string[];
    teacherNote?: string;
    richContent?: any[];
    dynamicHtml?: string;
}
