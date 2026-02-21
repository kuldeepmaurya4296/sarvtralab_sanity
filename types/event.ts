
export interface Event {
    id: string;
    _id?: string;
    title: string;
    type: 'webinar' | 'workshop' | 'competition' | 'meetup';
    date: string;
    time: string;
    description: string;
    presenter?: string;
    image: string;
    location?: string; // or 'Virtual'
    registrationLink?: string;
    videoUrl?: string; // YouTube link if recorded
    isPast?: boolean;
}
