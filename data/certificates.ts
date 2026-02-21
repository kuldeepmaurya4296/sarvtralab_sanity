
export interface Certificate {
    id: string;
    studentId: string;
    courseId: string;
    issueDate: string;
    hash?: string;
    downloadUrl?: string;
    status?: 'issued' | 'revoked';
}

// Mock data cleared - Now using Sanity CMS via certificate.actions.ts
export const mockIssuedCertificates: Certificate[] = [];
