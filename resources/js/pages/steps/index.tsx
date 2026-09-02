import InputError from '@/components/input-error';
import AchievementsPanel from '@/components/step-counter/achievements-panel';
import StepGauge from '@/components/step-counter/gauge';
import GoalDonut from '@/components/step-counter/goal-donut';
import ShareMenu from '@/components/step-counter/share-menu';
import StreakCard from '@/components/step-counter/streak-card';
import WeekPanel from '@/components/step-counter/week-panel';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { estimateCalories, estimateDistanceKm } from '@/lib/step-estimates';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Flame, LoaderCircle, MapPin, Paperclip, Upload } from 'lucide-react';
import { FormEventHandler, useMemo, useRef, useState } from 'react';

const DAILY_GOAL = 10_000;
const WEEKLY_GOAL = 70_000;

const PERIODS = ['Day', 'Week', 'Month', 'Year'] as const;
type Period = (typeof PERIODS)[number];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Steps', href: '/steps' }];

interface StepsPageProps {
    today: { steps: number; evidenceUrl: string | null };
    week: { entries: Record<string, number>; total: number; daysRecorded: number };
    month: { total: number; daysRecorded: number };
    year: { total: number; daysRecorded: number };
    streakDays: number;
    unlockedAchievements: string[];
}

function daysInMonth(reference: Date): number {
    return new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
}

function daysInYear(reference: Date): number {
    const year = reference.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

export default function StepsIndex({ today, week, month, year, streakDays, unlockedAchievements }: StepsPageProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{ steps: string; evidence: File | null }>({
        steps: today.steps ? String(today.steps) : '',
        evidence: null,
    });
    const evidenceInputRef = useRef<HTMLInputElement>(null);
    const [period, setPeriod] = useState<Period>('Day');
    const activeIndex = PERIODS.indexOf(period);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('steps.store'), {
            onSuccess: () => {
                reset('evidence');
                // React can't clear a file input's selection via state, so the DOM
                // node has to be cleared directly or a same-file resubmission is a no-op.
                if (evidenceInputRef.current) {
                    evidenceInputRef.current.value = '';
                }
            },
        });
    };

    const now = useMemo(() => new Date(), []);

    const periodStats: Record<Period, { value: number; goal: number; title: string; subtitle: string; recordedNote: string; toGoLabel: string }> = {
        Day: {
            value: today.steps,
            goal: DAILY_GOAL,
            title: 'Today',
            subtitle: 'Your logged step count for today.',
            recordedNote: 'No earlier day to compare with yet.',
            toGoLabel: 'to go today',
        },
        Week: {
            value: week.total,
            goal: WEEKLY_GOAL,
            title: 'This Week',
            subtitle: 'Your total step count this week.',
            recordedNote: `${week.daysRecorded} of 7 days recorded this week.`,
            toGoLabel: 'to go this week',
        },
        Month: {
            value: month.total,
            goal: DAILY_GOAL * daysInMonth(now),
            title: 'This Month',
            subtitle: 'Your total step count this month.',
            recordedNote: `${month.daysRecorded} of ${daysInMonth(now)} days recorded this month.`,
            toGoLabel: 'to go this month',
        },
        Year: {
            value: year.total,
            goal: DAILY_GOAL * daysInYear(now),
            title: 'This Year',
            subtitle: 'Your total step count this year.',
            recordedNote: `${year.daysRecorded} of ${daysInYear(now)} days recorded this year.`,
            toGoLabel: 'to go this year',
        },
    };

    const active = periodStats[period];
    const weekPercent = WEEKLY_GOAL > 0 ? Math.min(100, Math.round((week.total / WEEKLY_GOAL) * 100)) : 0;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Steps" />

            <div className="mx-auto w-full max-w-5xl px-4 py-8">
                <h1 className="text-2xl font-semibold tracking-tight">Log your steps</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Enter today&apos;s step count and upload a photo of your phone or tracker as evidence.
                </p>

                <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="flex flex-col gap-4 sm:gap-5">
                        <Card className="overflow-hidden shadow-sm">
                            <div className="relative overflow-hidden px-5 pt-5 pb-2 sm:px-7 sm:pt-6">
                                <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 p-0">
                                    <div className="min-w-0">
                                        <h2 className="text-[17px] font-semibold">{active.title}</h2>
                                        <p className="text-muted-foreground pt-0.5 text-[13px]">{active.subtitle}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div role="tablist" aria-label="Summary period" className="bg-secondary relative flex rounded-lg p-1">
                                            <div
                                                aria-hidden="true"
                                                className="absolute top-1 bottom-1 rounded-md bg-[#215AA8] shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none"
                                                style={{
                                                    width: `calc((100% - 8px) / ${PERIODS.length})`,
                                                    transform: `translateX(${activeIndex * 100}%)`,
                                                }}
                                            />
                                            {PERIODS.map((label) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={period === label}
                                                    onClick={() => setPeriod(label)}
                                                    className={`relative z-10 flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
                                                        period === label ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <ShareMenu url={shareUrl} text="Track my walking progress with P&G Step Counter." />
                                    </div>
                                </CardHeader>

                                <div className="pt-2 pb-4 sm:pt-4">
                                    <StepGauge value={active.value} goal={active.goal} label={active.title} />
                                </div>
                            </div>

                            <CardContent className="px-5 pb-5 sm:px-7 sm:pb-7">
                                <p className="text-muted-foreground text-center text-[13px]">{active.recordedNote}</p>

                                <div className="border-border mt-5 flex items-center gap-2 border-t pt-5 sm:gap-3">
                                    <div className="flex flex-1 items-center justify-center gap-2.5 sm:gap-3">
                                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                                            <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
                                        </span>
                                        <span className="flex flex-col">
                                            <span className="text-muted-foreground flex items-center gap-1.5 text-[12px] sm:text-[13px]">
                                                Distance
                                                <span className="bg-secondary rounded px-1 py-px text-[10px] font-bold tracking-wide uppercase sm:text-[11px]">
                                                    est
                                                </span>
                                            </span>
                                            <strong className="pt-0.5 text-[18px] font-bold tabular-nums sm:text-[20px]">
                                                {estimateDistanceKm(active.value)} <em className="text-[13px] font-normal not-italic">km</em>
                                            </strong>
                                        </span>
                                    </div>
                                    <span className="bg-border h-9 w-px flex-none" />
                                    <div className="flex flex-1 items-center justify-center gap-2.5 sm:gap-3">
                                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#EF5323]/10 text-[#EF5323]">
                                            <Flame className="h-4.5 w-4.5" aria-hidden="true" />
                                        </span>
                                        <span className="flex flex-col">
                                            <span className="text-muted-foreground flex items-center gap-1.5 text-[12px] sm:text-[13px]">
                                                Calories
                                                <span className="bg-secondary rounded px-1 py-px text-[10px] font-bold tracking-wide uppercase sm:text-[11px]">
                                                    est
                                                </span>
                                            </span>
                                            <strong className="pt-0.5 text-[18px] font-bold tabular-nums sm:text-[20px]">
                                                {estimateCalories(active.value)} <em className="text-[13px] font-normal not-italic">kcal</em>
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                {today.evidenceUrl && (
                                    <a
                                        href={today.evidenceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border-border bg-secondary text-foreground hover:bg-secondary/70 mt-5 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors"
                                    >
                                        <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                                        View today&apos;s evidence
                                    </a>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <h2 className="text-[15px] font-semibold">{today.steps > 0 ? "Update today's entry" : "Log today's steps"}</h2>
                                <p className="text-muted-foreground pt-0.5 text-[13px]">
                                    Resubmitting for today replaces your previous count and evidence.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="steps">Step count</Label>
                                        <Input
                                            id="steps"
                                            type="number"
                                            min={0}
                                            max={200000}
                                            required
                                            value={data.steps}
                                            onChange={(e) => setData('steps', e.target.value)}
                                            placeholder="e.g. 8400"
                                        />
                                        <InputError message={errors.steps} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="evidence">Evidence (screenshot or photo)</Label>
                                        <div className="border-input bg-background flex items-center gap-3 rounded-md border p-1">
                                            <input
                                                id="evidence"
                                                type="file"
                                                accept="image/*,.pdf"
                                                ref={evidenceInputRef}
                                                onChange={(e) => setData('evidence', e.target.files?.[0] ?? null)}
                                                className="peer sr-only"
                                            />
                                            <label
                                                htmlFor="evidence"
                                                className={buttonVariants({
                                                    variant: 'secondary',
                                                    className:
                                                        'peer-focus-visible:ring-ring h-8 flex-none cursor-pointer rounded-sm px-3 text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                                                })}
                                            >
                                                Choose File
                                            </label>
                                            <span className="text-muted-foreground truncate text-sm">
                                                {data.evidence ? data.evidence.name : 'No file chosen'}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-xs">JPG, PNG, HEIC, or PDF, up to 5MB.</p>
                                        <InputError message={errors.evidence} />
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full bg-[#215AA8] hover:bg-[#252B69] sm:w-auto">
                                        {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        Save today&apos;s steps
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardContent className="py-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <strong className="block text-[20px] font-bold tabular-nums">0m</strong>
                                        <span className="text-muted-foreground text-[13px]">active {active.title.toLowerCase()}</span>
                                    </div>
                                    <div>
                                        <strong className="block text-[20px] font-bold tabular-nums">
                                            {Math.max(0, active.goal - active.value).toLocaleString()}
                                        </strong>
                                        <span className="text-muted-foreground text-[13px]">{active.toGoLabel}</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground pt-3 text-[13px] leading-relaxed">
                                    Distance and calories are estimates worked out from your step count, not measurements.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-5">
                        <WeekPanel entries={week.entries} />

                        <Card className="shadow-sm">
                            <CardHeader className="flex-row items-start gap-3 space-y-0">
                                <div>
                                    <h2 className="text-[15px] font-semibold">Goal Progress</h2>
                                    <p className="text-muted-foreground pt-0.5 text-[13px]">
                                        Last 7 days &middot; {WEEKLY_GOAL.toLocaleString()} steps
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-col items-center gap-5 sm:flex-row">
                                    <GoalDonut percent={weekPercent} completed={week.total} goal={WEEKLY_GOAL} />
                                    <div className="flex w-full min-w-[9rem] flex-1 flex-col gap-3">
                                        <p className="grid grid-cols-[9px_1fr] items-center gap-2 text-[13px]">
                                            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#00B0C7]" />
                                            <span className="text-muted-foreground">
                                                Completed{' '}
                                                <strong className="text-foreground font-bold tabular-nums">{week.total.toLocaleString()}</strong>
                                            </span>
                                        </p>
                                        <p className="grid grid-cols-[9px_1fr] items-center gap-2 text-[13px]">
                                            <span aria-hidden="true" className="bg-border h-2 w-2 rounded-full" />
                                            <span className="text-muted-foreground">
                                                Remaining{' '}
                                                <strong className="text-foreground font-bold tabular-nums">
                                                    {Math.max(0, WEEKLY_GOAL - week.total).toLocaleString()}
                                                </strong>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground pt-4 text-[12px]">{week.daysRecorded} of 7 days recorded this week.</p>
                            </CardContent>
                        </Card>

                        <AchievementsPanel unlocked={unlockedAchievements} />
                    </div>

                    <div className="lg:col-span-2">
                        <StreakCard streakDays={streakDays} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
