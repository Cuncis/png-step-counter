import { Progress } from '@/components/ui/progress';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Award, Flame, Footprints, Lock, MapPin, Target } from 'lucide-react';

const ACHIEVEMENTS = ['First 1,000 steps', '5,000 steps in a day', '10,000 steps in a day', '7-day streak', '30 days in a month'];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="P&G Step Counter" />

            <div className="min-h-screen bg-[#FAFBFF] text-[#1b1b18] dark:bg-[#0b0d17] dark:text-[#EDEDEC]">
                <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-2 font-semibold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#215AA8] text-white">
                            <Footprints className="h-4.5 w-4.5" />
                        </span>
                        P&amp;G Step Counter
                    </div>
                    <nav className="flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-[#215AA8] px-4 py-2 font-medium text-white transition-colors hover:bg-[#252B69]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="px-3 py-2 font-medium hover:text-[#215AA8]">
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-[#215AA8] px-4 py-2 font-medium text-white transition-colors hover:bg-[#252B69]"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #215AA8 0%, #252B69 100%)' }}>
                    <div
                        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
                        style={{ background: '#00B0C7' }}
                    />
                    <div
                        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
                        style={{ background: '#EF5323' }}
                    />

                    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-28">
                        <span className="text-sm font-semibold tracking-wide text-[#7fd4e2] uppercase">P&amp;G Step Counter</span>
                        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Take the next step.</h1>
                        <p className="mt-5 max-w-xl text-lg text-white/85">
                            Track your steps, reach your daily goal, and stay consistent, one step at a time.
                        </p>
                        <p className="mt-2 max-w-xl text-white/70">10,000 steps a day. Your progress, at a glance.</p>

                        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm ring-1 ring-white/20 backdrop-blur">
                            <Lock className="h-4 w-4 text-[#00B0C7]" />
                            <span className="font-medium">Private by default.</span>
                            <span className="text-white/70">Your step data is stored on this device only. Nothing is uploaded.</span>
                        </div>
                    </div>
                </section>

                <main className="mx-auto w-full max-w-5xl px-6 py-16">
                    {/* Today */}
                    <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <h2 className="text-sm font-semibold tracking-wide text-[#252B69] uppercase dark:text-[#8fb3e0]">Today</h2>

                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-5xl font-bold" style={{ color: '#215AA8' }}>
                                0
                            </span>
                            <span className="text-muted-foreground text-lg">steps</span>
                            <span className="text-muted-foreground text-sm">of 10,000 steps</span>
                        </div>

                        <Progress value={0} className="mt-5 h-3 [&>div]:bg-[#00B0C7]" />

                        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />0 km estimated distance
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Flame className="h-4 w-4" />0 kcal estimated calories
                            </span>
                        </div>

                        <p className="text-muted-foreground mt-4 text-sm">Start walking to begin tracking.</p>
                    </section>

                    {/* Your Progress */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-semibold tracking-tight">Your Progress</h2>
                        <p className="text-muted-foreground mt-1">Track your activity today, this week, and over time.</p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <Target className="h-4 w-4" style={{ color: '#215AA8' }} />
                                    Daily Goal
                                </div>
                                <p className="mt-2 text-2xl font-semibold">10,000 steps</p>
                            </div>
                            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                    <Target className="h-4 w-4" style={{ color: '#00B0C7' }} />
                                    Weekly Goal
                                </div>
                                <p className="mt-2 text-2xl font-semibold">70,000 steps</p>
                            </div>
                        </div>
                    </section>

                    {/* Achievements */}
                    <section className="mt-16">
                        <h2 className="text-2xl font-semibold tracking-tight">Achievements</h2>
                        <p className="text-muted-foreground mt-1">Every step counts. Unlock achievements as you progress:</p>

                        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                            {ACHIEVEMENTS.map((achievement) => (
                                <li
                                    key={achievement}
                                    className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                                >
                                    <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: 'color-mix(in srgb, #EF5323 15%, transparent)' }}
                                    >
                                        <Award className="h-4 w-4" style={{ color: '#EF5323' }} />
                                    </span>
                                    <span className="text-sm font-medium">{achievement}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </main>

                {/* Closing */}
                <section className="text-white" style={{ background: 'linear-gradient(135deg, #252B69 0%, #215AA8 100%)' }}>
                    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Walk. Track. Achieve.</h2>
                        <p className="mt-3 max-w-xl text-white/80">
                            Stay active, build consistency, and celebrate every milestone with P&amp;G Step Counter.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
