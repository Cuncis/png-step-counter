import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Flame, Play } from 'lucide-react';

export default function StreakCard({ streakDays = 0, ctaHref }: { streakDays?: number; ctaHref?: string }) {
    const hasStreak = streakDays > 0;

    return (
        <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
            <CardContent className="flex flex-col items-stretch gap-3 py-5 sm:flex-row sm:items-center">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#EF5323]/10 text-[#EF5323]">
                    <Flame className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <b className="text-[14px] font-bold">{hasStreak ? `${streakDays}-day streak` : 'No streak yet'}</b>
                    <small className="text-muted-foreground text-[12px]">
                        {hasStreak ? 'Log today to keep it going.' : 'Record a step today and the streak starts at one.'}
                    </small>
                </span>
                {ctaHref && (
                    <Link
                        href={ctaHref}
                        className="flex flex-none items-center justify-center gap-1.5 rounded-lg bg-[#215AA8] px-4 py-2.5 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#252B69] hover:shadow-lg hover:shadow-[#215AA8]/25 active:translate-y-0 active:scale-95"
                    >
                        <Play className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor" />
                        Start a walk
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
