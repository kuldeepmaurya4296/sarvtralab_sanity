
export interface AnalyticsData {
    totalStudents: number;
    totalSchools: number;
    totalCourses: number;
    totalRevenue: number;
    activeUsers: number;
    completionRate: number;
}

export interface TimeSeriesData {
    date: string;
    students: number;
    schools: number;
    revenue: number;
    completions: number;
}

export interface StudentProgress {
    courseId: string;
    courseName: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessed: string;
    timeSpent: number; // in minutes
    quizScore: number;
}

export interface WatchTimeData {
    day: string;
    minutes: number;
}

export interface SchoolAnalytics {
    totalStudents: number;
    activeStudents: number;
    coursesAssigned: number;
    averageProgress: number;
    topPerformers: string[];
    completionRate: number;
}
