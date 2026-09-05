const MALAYSIA_STRIPES = Array.from({ length: 14 }, (_, i) => ({
    y: (i * 40) / 14,
    height: 40 / 14 + 0.1,
    fill: i % 2 === 0 ? '#CC0001' : '#FFFFFF',
}));

function IndonesiaFlag() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            <rect width="60" height="20" fill="#CE1126" />
            <rect y="20" width="60" height="20" fill="#FFFFFF" />
        </svg>
    );
}

function MalaysiaFlag() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            {MALAYSIA_STRIPES.map((stripe, index) => (
                <rect key={index} y={stripe.y} width="60" height={stripe.height} fill={stripe.fill} />
            ))}
            <rect width="26" height="20" fill="#010066" />
            <circle cx="10" cy="10" r="6.5" fill="#FFCC00" />
            <circle cx="12.5" cy="10" r="5.5" fill="#010066" />
            <polygon points="19,10 21.8,7.8 20.6,10 21.8,12.2" fill="#FFCC00" />
        </svg>
    );
}

function PhilippinesFlag() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            <rect width="60" height="20" fill="#0038A8" />
            <rect y="20" width="60" height="20" fill="#CE1126" />
            <polygon points="0,0 0,40 26,20" fill="#FFFFFF" />
            <circle cx="12" cy="20" r="4.5" fill="#FCD116" />
            <circle cx="7" cy="7" r="1.7" fill="#FCD116" />
            <circle cx="7" cy="33" r="1.7" fill="#FCD116" />
            <circle cx="22.5" cy="20" r="1.7" fill="#FCD116" />
        </svg>
    );
}

const FLAGS: Record<string, () => React.JSX.Element> = {
    ID: IndonesiaFlag,
    MY: MalaysiaFlag,
    PH: PhilippinesFlag,
};

export function CountryFlag({ code, className }: { code: string; className?: string }) {
    const Flag = FLAGS[code];

    if (!Flag) {
        return null;
    }

    return (
        <span className={className ?? 'inline-block h-4 w-6 overflow-hidden rounded-sm align-middle'} aria-hidden="true">
            <Flag />
        </span>
    );
}
