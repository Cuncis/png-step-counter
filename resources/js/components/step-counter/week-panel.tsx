import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toLocalISODate } from '@/lib/dates';
import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AXIS_LABELS = ['10K', '7.5K', '5K', '2.5K', '0'];
const DAILY_GOAL = 10_000;

function mondayOf(reference: Date) {
    const day = reference.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    const monday = new Date(reference);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(reference.getDate() + offset);
    return monday;
}

export default function WeekPanel({ entries = {} }: { entries?: Record<string, number> }) {
    const today = useMemo(() => new Date(), []);
    const todayIso = toLocalISODate(today);
    const monday = useMemo(() => mondayOf(today), [today]);
    const days = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + i);
                return date;
            }),
        [monday],
    );
    const sunday = days[6];

    const rangeLabel = `${monday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} – ${sunday.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })}`;

    const todaySteps = entries[todayIso] ?? 0;
    const daysRecorded = days.filter((date) => (entries[toLocalISODate(date)] ?? 0) > 0).length;

    return (
        <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold">This Week</h2>
                    <p className="text-muted-foreground truncate pt-0.5 text-[13px]">{rangeLabel}</p>
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {days.map((date, index) => {
                        const isToday = date.toDateString() === today.toDateString();
                        const isFuture = date > today;
                        return (
                            <div
                                key={date.toISOString()}
                                aria-current={isToday ? 'date' : undefined}
                                className={`flex h-13 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] transition-all duration-300 sm:h-14 sm:text-[12px] ${
                                    isFuture ? 'opacity-40' : ''
                                } ${
                                    isToday
                                        ? 'scale-105 bg-[#215AA8] text-white shadow-md shadow-[#215AA8]/30'
                                        : 'bg-secondary text-secondary-foreground'
                                }`}
                            >
                                <span className="opacity-80">{DAY_LABELS[index]}</span>
                                <b className="text-[12px] font-bold tabular-nums sm:text-[13px]">{date.getDate()}</b>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-2 pt-5">
                    <div
                        className="text-muted-foreground flex flex-none flex-col justify-between text-[10px] tabular-nums sm:text-[11px]"
                        style={{ height: 130 }}
                    >
                        {AXIS_LABELS.map((label) => (
                            <span key={label}>{label}</span>
                        ))}
                    </div>
                    <div className="relative flex-1" style={{ height: 130 }}>
                        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-[#00B0C7]/50">
                            <span className="text-muted-foreground absolute right-0 -translate-y-full text-[10px] tabular-nums sm:text-[11px]">
                                10K goal
                            </span>
                        </div>
                        <div className="flex h-full items-end gap-1 sm:gap-1.5">
                            {days.map((date, index) => {
                                const steps = entries[toLocalISODate(date)] ?? 0;
                                const height = Math.min(100, Math.round((steps / DAILY_GOAL) * 100));
                                return (
                                    <div key={date.toISOString()} className="flex h-full flex-1 items-end">
                                        <div
                                            className="w-full rounded-t-sm bg-[#00B0C7] transition-[height] duration-700 ease-out motion-reduce:transition-none"
                                            style={{ height: `${height}%`, transitionDelay: `${index * 40}ms` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="text-muted-foreground flex flex-wrap items-baseline justify-between gap-2 pt-4 text-[13px]">
                    <span>
                        Today &middot; <strong className="text-foreground font-bold tabular-nums">{todaySteps.toLocaleString()}</strong> steps
                    </span>
                    <span>{daysRecorded} of 7 days recorded</span>
                </div>
            </CardContent>
        </Card>
    );
}
