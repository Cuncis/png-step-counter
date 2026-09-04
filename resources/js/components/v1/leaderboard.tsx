import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type ChallengeCountrySummary } from '@/types/challenge';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function Leaderboard({ countries }: { countries: ChallengeCountrySummary[] }) {
    const ranked = [...countries].sort((a, b) => a.rank - b.rank);

    return (
        <section id="leaderboard">
            <h2 className="text-xl font-bold text-gray-900">🏆 Country Leaderboard</h2>

            <Card className="mt-4 overflow-hidden shadow-sm">
                <CardContent className="divide-y divide-gray-100 p-0">
                    {ranked.map((country) => (
                        <div
                            key={country.id}
                            className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6', country.rank === 1 && 'bg-[#0E9F6E]/5')}
                        >
                            <div className="flex items-center gap-3 sm:w-48">
                                <span className="text-xl font-bold text-gray-400">{MEDALS[country.rank] ?? `#${country.rank}`}</span>
                                <span className="text-xl" aria-hidden="true">
                                    {country.flag_emoji}
                                </span>
                                <span className="font-bold text-gray-900">{country.name}</span>
                            </div>

                            <div className="flex-1">
                                <Progress value={country.progress_percent} className="h-3 [&>div]:bg-[#0E9F6E]" />
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:w-56 sm:justify-end">
                                <span className="font-bold text-gray-900 tabular-nums">{country.total_steps.toLocaleString()} steps</span>
                                <span className="w-12 text-right text-sm font-bold text-[#0E9F6E]">{country.progress_percent}%</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}
