'use client';

import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface BlogShareButtonsProps {
    title: string;
    url: string;
}

export default function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = (platform: string) => {
        let shareUrl = '';
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Share:</span>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => handleShare('twitter')}>
                <Twitter className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => handleShare('facebook')}>
                <Facebook className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => handleShare('linkedin')}>
                <Linkedin className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted ml-2" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
            </Button>
        </div>
    );
}
