
export interface Report {
    id: string;
    name: string;
    type: string;
    generatedBy: string;
    generatedAt: string;
    status: 'Ready' | 'Processing' | 'Failed';
    size?: string;
    description: string;
    schoolId?: string;
}

// Reports are now fetched from Sanity CMS via report.actions.ts
export const mockReports: Report[] = [];
