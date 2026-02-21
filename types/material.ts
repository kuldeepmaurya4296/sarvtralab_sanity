
export interface Material {
    id: string;
    _id?: string;
    title: string;
    description?: string;
    type: 'pdf' | 'video' | 'link' | 'zip' | 'quiz';
    url?: string;
    downloadUrl?: string; // Sometimes used interchangeably with url
    courseId?: string;
    moduleId?: string;
    grade?: string;
    size?: string;
    uploadedAt?: string;
    createdAt?: string;
}
