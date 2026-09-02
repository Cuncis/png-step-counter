import StepCounterPanel from '@/components/step-counter/panel';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Footprints, Lock } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const ctaHref = auth.user ? route('dashboard') : route('register');

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
                <section className="relative overflow-hidden text-white" style={{ background: '#215AA8' }}>
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

                <main className="mx-auto w-full max-w-6xl px-6 py-16">
                    <StepCounterPanel ctaHref={ctaHref} />
                </main>

                {/* Closing */}
                <section className="text-white" style={{ background: '#252B69' }}>
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
