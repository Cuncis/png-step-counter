import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type ChallengeCountrySummary } from '@/types/challenge';

export function CountryCards({ countries }: { countries: ChallengeCountrySummary[] }) {
    const byId = [...countries].sort((a, b) => a.id - b.id);

    return (
        <section>
            <h2 className="text-xl font-bold text-gray-900">🌏 Regional Progress</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {byId.map((country) => (
                    <Card key={country.id} className="shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl" aria-hidden="true">
                                    {country.flag_emoji}
                                </span>
                                <h3 className="font-bold text-gray-900">{country.name}</h3>
                            </div>
                            <span className="rounded-full bg-[#0E9F6E]/10 px-2.5 py-1 text-xs font-bold text-[#0E9F6E]">#{country.rank}</span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{country.total_steps.toLocaleString()}</p>
                            <p className="text-muted-foreground text-xs">steps</p>

                            <Progress value={country.progress_percent} className="mt-4 h-3 [&>div]:bg-[#0E9F6E]" />
                            <p className="mt-2 text-sm font-semibold text-gray-700">{country.progress_percent}% of country goal</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
