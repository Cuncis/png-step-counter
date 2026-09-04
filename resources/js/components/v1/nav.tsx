import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ChallengeCountrySummary } from '@/types/challenge';
import { Footprints } from 'lucide-react';
import { useEffect, useState } from 'react';

export function useMyCountry(defaultCode: string) {
    const [myCountry, setMyCountry] = useState(defaultCode);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('v1-my-country');
            if (saved) setMyCountry(saved);
        } catch {
            // localStorage unavailable, keep default
        }
    }, []);

    const updateMyCountry = (code: string) => {
        setMyCountry(code);
        try {
            localStorage.setItem('v1-my-country', code);
        } catch {
            // ignore
        }
    };

    return { myCountry, updateMyCountry };
}

export function ChallengeNav({
    countries,
    myCountry,
    onMyCountryChange,
    onLogSteps,
}: {
    countries: ChallengeCountrySummary[];
    myCountry: string;
    onMyCountryChange: (code: string) => void;
    onLogSteps: () => void;
}) {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E9F6E] text-white">
                        <Footprints className="h-5 w-5" />
                    </span>
                    <span className="hidden sm:inline">Step Challenge</span>
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
                    <a href="#top" className="hover:text-[#0E9F6E]">
                        Dashboard
                    </a>
                    <button type="button" onClick={onLogSteps} className="hover:text-[#0E9F6E]">
                        Log Steps
                    </button>
                    <a href="#leaderboard" className="hover:text-[#0E9F6E]">
                        Leaderboard
                    </a>
                    <a href="#activity" className="hover:text-[#0E9F6E]">
                        Activity
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <Select value={myCountry} onValueChange={onMyCountryChange}>
                        <SelectTrigger className="hidden h-9 w-[240px] shrink-0 sm:flex">
                            <span className="text-muted-foreground mr-1 shrink-0 text-xs whitespace-nowrap">My Country:</span>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.flag_emoji} {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={onLogSteps} className="bg-[#0E9F6E] hover:bg-[#0B8259]">
                        + Log Steps
                    </Button>
                </div>
            </div>
        </header>
    );
}
