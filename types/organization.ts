
export interface OrganizationDetails {
    name: string;
    tagline?: string;
    description: string;
    logo?: string;
    contact: {
        email: string;
        phone: string;
        address: string;
        hours?: string;
        mapEmbedUrl?: string;
    };
    socials: SocialProfile[];
    stats?: { label: string; value: string; iconName: string }[];
}

export interface ContactDetail {
    iconName: string; // Storing icon name as string for mapping in component
    title: string;
    content: string;
    subtext?: string;
    link?: string;
}

export interface SocialProfile {
    platform: string;
    url: string;
    iconName: string;
}

export interface ContactCard extends ContactDetail { }
