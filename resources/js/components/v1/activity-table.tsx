import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ChallengeActivityEntry, type ChallengeCountrySummary, type ChallengeSortDirection, type ChallengeSortField } from '@/types/challenge';
import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';

function formatShortDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ActivityTable({
    entries,
    sort,
    direction,
    country,
    date,
    countries,
}: {
    entries: ChallengeActivityEntry[];
    sort: ChallengeSortField;
    direction: ChallengeSortDirection;
    country: string | null;
    date: string | null;
    countries: ChallengeCountrySummary[];
}) {
    function updateQuery(
        next: Partial<{ sort: ChallengeSortField; direction: ChallengeSortDirection; country: string | null; date: string | null }>,
    ) {
        router.get(
            route('v1.dashboard'),
            {
                sort: next.sort ?? sort,
                direction: next.direction ?? direction,
                country: next.country === undefined ? country : next.country,
                date: next.date === undefined ? date : next.date,
            },
            { only: ['activity'], preserveState: true, preserveScroll: true },
        );
    }

    function toggleSort(field: ChallengeSortField) {
        if (field === sort) {
            updateQuery({ sort: field, direction: direction === 'asc' ? 'desc' : 'asc' });
        } else {
            updateQuery({ sort: field, direction: 'desc' });
        }
    }

    function SortHeader({ field, label, align = 'left' }: { field: ChallengeSortField; label: string; align?: 'left' | 'right' }) {
        const active = sort === field;
        return (
            <button
                type="button"
                onClick={() => toggleSort(field)}
                className={`flex items-center gap-1 text-xs font-bold tracking-wide text-gray-500 uppercase hover:text-gray-900 ${
                    align === 'right' ? 'ml-auto' : ''
                }`}
            >
                {label}
                {active && (direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </button>
        );
    }

    return (
        <section id="activity">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-gray-900">📅 Daily Activity</h2>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={country ?? 'all'} onValueChange={(next) => updateQuery({ country: next === 'all' ? null : next })}>
                        <SelectTrigger className="h-9 w-full sm:w-[170px]">
                            <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.flag_emoji} {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={date ?? ''}
                        onChange={(e) => updateQuery({ date: e.target.value || null })}
                        className="h-9 w-full sm:w-[160px]"
                    />
                </div>
            </div>

            <Card className="mt-4 overflow-hidden shadow-sm">
                <CardContent className="overflow-x-auto p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">
                                    <SortHeader field="date" label="Date" />
                                </th>
                                <th className="px-4 py-3">
                                    <SortHeader field="country" label="Country" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-500 uppercase">Participant</th>
                                <th className="px-4 py-3 text-right">
                                    <SortHeader field="steps" label="Steps" align="right" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatShortDate(entry.date)}</td>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">
                                        {entry.country.flag_emoji} {entry.country.name}
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">{entry.participant_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">{entry.steps.toLocaleString()}</td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                        No activity found for these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </section>
    );
}
