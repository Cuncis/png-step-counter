import { Progress } from '@/components/ui/progress';
import { type ChallengeRegionalSummary } from '@/types/challenge';

export function ChallengeHero({ regional }: { regional: ChallengeRegionalSummary }) {
    if (regional.is_complete) {
        return (
            <section id="top" className="rounded-2xl bg-[#0E9F6E] px-6 py-12 text-center text-white shadow-sm sm:px-10 sm:py-16">
                <p className="animate-fade-slide-up text-sm font-semibold tracking-wide uppercase opacity-90">🚶 10 Million Steps</p>
                <h1 className="animate-fade-slide-up mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">🎉 WE DID IT!</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                    Together, Malaysia, Philippines and Indonesia have reached 10,000,000 steps!
                </p>
                <p className="mt-6 text-3xl font-bold tabular-nums">{regional.total_steps.toLocaleString()} steps</p>
            </section>
        );
    }

    return (
        <section id="top" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
            <p className="text-center text-sm font-bold tracking-wide text-[#0E9F6E] uppercase">🚶 Regional Step Challenge</p>

            <p className="mt-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase">Total Steps</p>
            <p className="mt-1 text-center text-5xl font-extrabold text-gray-900 tabular-nums sm:text-7xl">{regional.total_steps.toLocaleString()}</p>
            <p className="text-muted-foreground mt-2 text-center text-sm">Steps accumulated across Malaysia, Philippines &amp; Indonesia</p>

            <div className="mx-auto mt-8 max-w-2xl">
                <Progress value={regional.progress_percent} className="h-4 [&>div]:bg-[#0E9F6E]" />
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#0E9F6E]">{regional.progress_percent}% COMPLETE</span>
                    <span className="text-muted-foreground">{regional.remaining_steps.toLocaleString()} steps to go</span>
                </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 border-t border-gray-100 pt-6 text-center sm:grid-cols-3">
                <div>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">{regional.goal_steps.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs">Regional Goal</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">{regional.participants.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs">Participants</p>
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">{regional.days_remaining}</p>
                    <p className="text-muted-foreground text-xs">Days Remaining</p>
                </div>
            </div>
        </section>
    );
}
