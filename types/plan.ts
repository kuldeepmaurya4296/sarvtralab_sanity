
export interface Plan {
    id: string;
    _id?: string;
    name: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    popular: boolean;
    status: 'active' | 'inactive';
    customId?: string;
}

export interface Benefit {
    title: string;
    description: string;
    iconName: string;
}
