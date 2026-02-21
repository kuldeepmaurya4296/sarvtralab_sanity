
export interface Job {
    id: string;
    _id?: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    description: string;
}

export interface BlogPost {
    id: string;
    _id?: string;
    title: string;
    excerpt: string;
    content: any;
    author: string;
    date: string;
    image: string;
    tags: string[];
}

export interface PressRelease {
    id: string;
    _id?: string;
    title: string;
    date: string;
    source: string;
    link: string;
}

export interface Video {
    id: string;
    _id?: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    views: number;
    category: string;
    videoUrl: string;
}

export interface Testimonial {
    id: string;
    _id?: string;
    name: string;
    role: string;
    school: string;
    content: string;
    rating: number;
    avatar: string;
}

export interface Feature {
    id: string;
    _id?: string;
    title: string;
    description: string;
    icon: string;
}
