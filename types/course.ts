
export interface Lesson {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    duration: string;
    videoUrl?: string;
    resourceUrls?: string[];
    isFree?: boolean;
    type?: 'video' | 'quiz' | 'reading' | 'project';
    isCompleted?: boolean;
}

export interface CurriculumModule {
    id: string;
    _id?: string;
    title: string;
    lessons: Lesson[];
    duration?: string;
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
}
