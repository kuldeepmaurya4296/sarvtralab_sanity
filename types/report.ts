
export interface Report {
    id: string;
    _id?: string;
    name: string;
    type: string;
    generatedBy: string;
    generatedAt: string;
    status: 'Ready' | 'Processing' | 'Failed';
    size?: string;
    description: string;
    schoolId?: string;
}
