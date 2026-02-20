
export interface Course {
  id: string;
  customId?: string;
  _id?: string;
  title: string;
  description: string;
  grade: string;
  duration: string;
  sessions: number;
  totalHours: number;
  price: number;
  originalPrice: number;
  emiAvailable: boolean;
  emiAmount?: number;
  emiMonths?: number;
  image: string;
  category: 'foundation' | 'intermediate' | 'advanced';
  tags: string[];
  features: string[];
  curriculum: CurriculumModule[];
  rating: number;
  studentsEnrolled: number;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CurriculumModule {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz' | 'project';
  isCompleted?: boolean;
  videoUrl?: string; // YouTube video URL
}

// Mock data cleared - Now using Sanity CMS
export const courses: Course[] = [];

export const courseCategories = [
  { id: 'foundation', name: 'Foundation Maker', grades: 'Class 4-6', color: 'primary' },
  { id: 'intermediate', name: 'Intermediate Robotics', grades: 'Class 7-10', color: 'secondary' },
  { id: 'advanced', name: 'Advanced Pre-Engineering', grades: 'Class 11-12', color: 'accent' }
];
