import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Copy, Facebook, Instagram, Share2 } from 'lucide-react';
import { useState, type ComponentType, type SVGProps } from 'react';

function XLogoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.09v12.4a2.59 2.59 0 1 1-3.66-2.36V9.66a5.85 5.85 0 0 0-1.03-.09 5.86 5.86 0 1 0 5.86 5.86V9.01a7.34 7.34 0 0 0 4.3 1.38V7.3a4.26 4.26 0 0 1-1.32-1.48z" />
        </svg>
    );
}

const PLATFORMS: {
    key: string;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    color: string;
    href?: (url: string, text: string) => string;
}[] = [
    {
        key: 'facebook',
        label: 'Facebook',
        icon: Facebook,
        color: '#1877F2',
        href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        key: 'x',
        label: 'X',
        icon: XLogoIcon,
        color: '#000000',
        href: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
        key: 'instagram',
        label: 'Instagram',
        icon: Instagram,
        color: '#E1306C',
    },
    {
        key: 'tiktok',
        label: 'TikTok',
        icon: TikTokIcon,
        color: '#000000',
    },
];

export default function ShareMenu({ url, text }: { url: string; text: string }) {
    const [copied, setCopied] = useState(false);
    const [note, setNote] = useState<string | null>(null);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be denied; the URL is still visible to copy manually.
        }
    }

    function handlePlatform(platform: (typeof PLATFORMS)[number]) {
        if (platform.href) {
            window.open(platform.href(url, text), '_blank', 'noopener,noreferrer,width=600,height=500');
            return;
        }
        navigator.clipboard?.writeText(url).catch(() => {});
        setNote(`${platform.label} doesn't support direct sharing. Link copied, paste it into your ${platform.label} post.`);
        setTimeout(() => setNote(null), 4000);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    aria-label="Share progress"
                    className="bg-secondary text-secondary-foreground flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-[#215AA8]/10 hover:text-[#215AA8] active:scale-95"
                >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogTitle>Share your progress</DialogTitle>
                <DialogDescription>Post to a platform, or copy the link.</DialogDescription>

                <div className="grid grid-cols-4 gap-3 pt-2">
                    {PLATFORMS.map((platform) => (
                        <button
                            key={platform.key}
                            type="button"
                            onClick={() => handlePlatform(platform)}
                            className="flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-transform hover:scale-105 active:scale-95"
                        >
                            <span
                                className="flex h-11 w-11 items-center justify-center rounded-full text-white"
                                style={{ background: platform.color }}
                            >
                                <platform.icon className="h-5 w-5" />
                            </span>
                            <span className="text-foreground text-[11px] font-medium">{platform.label}</span>
                        </button>
                    ))}
                </div>

                {note && <p className="text-muted-foreground text-xs">{note}</p>}

                <div className="border-input bg-secondary/40 flex items-center gap-2 rounded-md border p-1 pl-3">
                    <span className="text-muted-foreground flex-1 truncate text-xs">{url}</span>
                    <button
                        type="button"
                        onClick={copyLink}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex flex-none items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy link'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
