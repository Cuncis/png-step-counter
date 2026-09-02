import AchievementsPanel from '@/components/step-counter/achievements-panel';
import StepGauge from '@/components/step-counter/gauge';
import GoalDonut from '@/components/step-counter/goal-donut';
import ShareMenu from '@/components/step-counter/share-menu';
import StreakCard from '@/components/step-counter/streak-card';
import WeekPanel from '@/components/step-counter/week-panel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Activity, Flame, MapPin, Play, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const PERIODS = ['Day', 'Week', 'Month', 'Year'] as const;
type Period = (typeof PERIODS)[number];

const DAILY_GOAL = 10_000;
const WEEKLY_GOAL = 70_000;

function fadeIn(delayMs: number) {
    return { animationDelay: `${delayMs}ms` };
}

export default function StepCounterPanel({ ctaHref }: { ctaHref: string }) {
    const [period, setPeriod] = useState<Period>('Day');
    const activeIndex = PERIODS.indexOf(period);
    const steps = 0;

    return (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-4 sm:gap-5">
                <Card className="animate-fade-slide-up overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg" style={fadeIn(0)}>
                    <div className="relative overflow-hidden px-5 pt-5 pb-2 sm:px-7 sm:pt-6">
                        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 p-0">
                            <div className="min-w-0">
                                <h2 className="text-[17px] font-semibold">Step Counter</h2>
                                <p className="text-muted-foreground pt-0.5 text-[13px]">Track your steps. Achieve your goals. Stay consistent.</p>
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
                                <ShareMenu
                                    url={typeof window !== 'undefined' ? window.location.href : ''}
                                    text="Track my walking progress with P&G Step Counter."
                                />
                            </div>
                        </CardHeader>

                        <div className="pt-2 pb-4 sm:pt-4">
                            <StepGauge value={steps} goal={DAILY_GOAL} />
                        </div>
                    </div>

                    <CardContent className="px-5 pb-5 sm:px-7 sm:pb-7">
                        <p className="text-muted-foreground text-center text-[13px]">No earlier day to compare with yet.</p>

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
                                        0 <em className="text-[13px] font-normal not-italic">km</em>
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
                                        0 <em className="text-[13px] font-normal not-italic">kcal</em>
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="animate-fade-slide-up" style={fadeIn(80)}>
                    <Link
                        href={ctaHref}
                        className="flex h-14 w-full items-center justify-center gap-2.5 rounded-lg bg-[#215AA8] text-[17px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#252B69] hover:shadow-xl hover:shadow-[#215AA8]/30 active:translate-y-0 active:scale-[.98] md:h-12 md:text-[16px]"
                    >
                        <Play className="h-5 w-5" aria-hidden="true" fill="currentColor" />
                        Start counting
                    </Link>
                    <p className="text-muted-foreground pt-2 text-[13px] leading-relaxed sm:text-[14px]">
                        Your phone will ask for motion access. Tap Allow, or steps can&apos;t be counted. Then keep this page on screen, pocket or
                        hand is fine.
                    </p>
                </div>

                <Card className="animate-fade-slide-up shadow-sm transition-shadow duration-300 hover:shadow-md" style={fadeIn(140)}>
                    <CardContent className="py-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <strong className="block text-[20px] font-bold tabular-nums">0m</strong>
                                <span className="text-muted-foreground text-[13px]">active today</span>
                            </div>
                            <div>
                                <strong className="block text-[20px] font-bold tabular-nums">{DAILY_GOAL.toLocaleString()}</strong>
                                <span className="text-muted-foreground text-[13px]">to go today</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground pt-3 text-[13px] leading-relaxed">
                            Distance and calories are estimates worked out from your step count, not measurements.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 sm:gap-5">
                <div className="animate-fade-slide-up" style={fadeIn(40)}>
                    <WeekPanel />
                </div>

                <Card className="animate-fade-slide-up shadow-sm transition-shadow duration-300 hover:shadow-md" style={fadeIn(120)}>
                    <CardHeader className="flex-row items-start gap-3 space-y-0">
                        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#00B0C7]/10 text-[#00B0C7]">
                            <Target className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-[15px] font-semibold">Goal Progress</h2>
                            <p className="text-muted-foreground pt-0.5 text-[13px]">Last 7 days &middot; {WEEKLY_GOAL.toLocaleString()} steps</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-col items-center gap-5 sm:flex-row">
                            <GoalDonut percent={0} completed={0} goal={WEEKLY_GOAL} />
                            <div className="flex w-full min-w-[9rem] flex-1 flex-col gap-3">
                                <p className="grid grid-cols-[9px_1fr] items-center gap-2 text-[13px]">
                                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#00B0C7]" />
                                    <span className="text-muted-foreground">
                                        Completed <strong className="text-foreground font-bold tabular-nums">0</strong>
                                    </span>
                                </p>
                                <p className="grid grid-cols-[9px_1fr] items-center gap-2 text-[13px]">
                                    <span aria-hidden="true" className="bg-border h-2 w-2 rounded-full" />
                                    <span className="text-muted-foreground">
                                        Remaining <strong className="text-foreground font-bold tabular-nums">{WEEKLY_GOAL.toLocaleString()}</strong>
                                    </span>
                                </p>
                            </div>
                        </div>
                        <p className="text-muted-foreground pt-4 text-[12px]">No steps recorded in the last 7 days.</p>
                    </CardContent>
                </Card>

                <div className="animate-fade-slide-up" style={fadeIn(200)}>
                    <AchievementsPanel />
                </div>
            </div>

            <div className="grid gap-4 sm:gap-5 lg:col-span-2 lg:grid-cols-2">
                <Card className="animate-fade-slide-up shadow-sm transition-shadow duration-300 hover:shadow-md" style={fadeIn(240)}>
                    <CardHeader className="flex-row items-start gap-3 space-y-0">
                        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                            <Activity className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-[15px] font-semibold">Activity Breakdown</h2>
                            <p className="text-muted-foreground pt-0.5 text-[13px]">By walking pace, measured from your rhythm.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="bg-secondary/60 text-muted-foreground rounded-lg p-4 text-center text-[13px]">
                            No pace recorded today yet. This fills in once a walk locks on to a rhythm the detector can measure.
                        </div>
                    </CardContent>
                </Card>

                <Card className="animate-fade-slide-up shadow-sm transition-shadow duration-300 hover:shadow-md" style={fadeIn(280)}>
                    <CardHeader className="flex-row items-start gap-3 space-y-0">
                        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#00B0C7]/10 text-[#00B0C7]">
                            <TrendingUp className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-[15px] font-semibold">Step Trend</h2>
                            <p className="text-muted-foreground pt-0.5 text-[13px]">Running total across today.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="bg-secondary/60 text-muted-foreground rounded-lg p-4 text-center text-[13px]">
                            The trend draws itself as you walk. Start a session to see today take shape.
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="animate-fade-slide-up lg:col-span-2" style={fadeIn(320)}>
                <StreakCard ctaHref={ctaHref} />
            </div>
        </div>
    );
}
