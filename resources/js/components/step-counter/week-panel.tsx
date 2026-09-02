import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toLocalISODate } from '@/lib/dates';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

interface WeekPanelProps {
    entries?: Record<string, number>;
    /** ISO date (any day within the week to display); defaults to today. */
    referenceDate?: string;
    canGoPrevious?: boolean;
    canGoNext?: boolean;
    onNavigate?: (direction: 'prev' | 'next') => void;
}

export default function WeekPanel({ entries = {}, referenceDate, canGoPrevious = true, canGoNext = false, onNavigate }: WeekPanelProps) {
    const today = useMemo(() => new Date(), []);
    const todayIso = toLocalISODate(today);
    const reference = useMemo(() => (referenceDate ? new Date(`${referenceDate}T00:00:00`) : today), [referenceDate, today]);
    const monday = useMemo(() => mondayOf(reference), [reference]);
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
    const dayIsos = useMemo(() => days.map(toLocalISODate), [days]);

    const [selectedDate, setSelectedDate] = useState<string>(() => (dayIsos.includes(todayIso) ? todayIso : dayIsos[dayIsos.length - 1]));

    useEffect(() => {
        setSelectedDate(dayIsos.includes(todayIso) ? todayIso : dayIsos[dayIsos.length - 1]);
        // Reset the selection whenever the displayed week changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monday.getTime()]);

    const rangeLabel = `${monday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} – ${sunday.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })}`;

    const daysRecorded = days.filter((date) => (entries[toLocalISODate(date)] ?? 0) > 0).length;
    const selectedIndex = dayIsos.indexOf(selectedDate);
    const selectedSteps = entries[selectedDate] ?? 0;
    const selectedLabel =
        selectedIndex >= 0 ? days[selectedIndex].toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : selectedDate;

    return (
        <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-[15px] font-semibold">This Week</h2>
                        <p className="text-muted-foreground truncate pt-0.5 text-[13px]">{rangeLabel}</p>
                    </div>
                </div>

                {onNavigate && (
                    <div className="flex flex-none gap-1">
                        <button
                            type="button"
                            aria-label="Previous week"
                            disabled={!canGoPrevious}
                            onClick={() => onNavigate('prev')}
                            className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-[#215AA8]/10 hover:text-[#215AA8] disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            aria-label="Next week"
                            disabled={!canGoNext}
                            onClick={() => onNavigate('next')}
                            className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-[#215AA8]/10 hover:text-[#215AA8] disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-4">
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {days.map((date, index) => {
                        const iso = dayIsos[index];
                        const isToday = iso === todayIso;
                        const isFuture = date > today;
                        const isSelected = iso === selectedDate;
                        return (
                            <button
                                key={iso}
                                type="button"
                                aria-pressed={isSelected}
                                aria-current={isToday ? 'date' : undefined}
                                disabled={isFuture}
                                onClick={() => setSelectedDate(iso)}
                                className={`flex h-13 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] transition-all duration-300 sm:h-14 sm:text-[12px] ${
                                    isFuture ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:scale-105'
                                } ${
                                    isSelected
                                        ? 'scale-105 bg-[#215AA8] text-white shadow-md shadow-[#215AA8]/30'
                                        : isToday
                                          ? 'bg-[#215AA8]/10 text-[#215AA8] ring-1 ring-[#215AA8]/40'
                                          : 'bg-secondary text-secondary-foreground'
                                }`}
                            >
                                <span className="opacity-80">{DAY_LABELS[index]}</span>
                                <b className="text-[12px] font-bold tabular-nums sm:text-[13px]">{date.getDate()}</b>
                            </button>
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
                                const iso = dayIsos[index];
                                const steps = entries[iso] ?? 0;
                                const height = Math.min(100, Math.round((steps / DAILY_GOAL) * 100));
                                const isSelected = iso === selectedDate;
                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        aria-label={`${DAY_LABELS[index]} ${date.getDate()}: ${steps.toLocaleString()} steps`}
                                        onClick={() => setSelectedDate(iso)}
                                        className="flex h-full flex-1 cursor-pointer items-end"
                                    >
                                        <div
                                            className={`w-full rounded-t-sm transition-[height] duration-700 ease-out motion-reduce:transition-none ${
                                                isSelected ? 'bg-[#215AA8]' : 'bg-[#00B0C7]'
                                            }`}
                                            style={{ height: `${height}%`, transitionDelay: `${index * 40}ms` }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="text-muted-foreground flex flex-wrap items-baseline justify-between gap-2 pt-4 text-[13px]">
                    <span>
                        {selectedLabel} &middot; <strong className="text-foreground font-bold tabular-nums">{selectedSteps.toLocaleString()}</strong>{' '}
                        steps
                    </span>
                    <span>{daysRecorded} of 7 days recorded</span>
                </div>
            </CardContent>
        </Card>
    );
}
