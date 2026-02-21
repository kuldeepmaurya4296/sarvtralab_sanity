
export interface Certificate {
    id: string;
    _id?: string;
    studentId: string;
    courseId: string;
    issueDate: string;
    hash?: string;
    downloadUrl?: string;
    status?: 'issued' | 'revoked';
}
