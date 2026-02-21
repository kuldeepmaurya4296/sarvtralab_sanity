
export interface SupportArticle {
    id: string;
    _id?: string;
    title: string;
    content?: any;
    summary?: string;
    categoryId: string;
    lastUpdated?: string;
}

export interface SupportCategory {
    id: string;
    _id?: string;
    title: string;
    description: string;
    icon?: string;
    iconName?: string; // Sometimes used for Lucide mapping
    articles?: SupportArticle[];
}
