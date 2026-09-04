import { ActivityTable } from '@/components/v1/activity-table';
import { CountryCards } from '@/components/v1/country-cards';
import { ChallengeHero } from '@/components/v1/hero';
import { Leaderboard } from '@/components/v1/leaderboard';
import { LogStepsDialog } from '@/components/v1/log-steps-dialog';
import { ChallengeNav, useMyCountry } from '@/components/v1/nav';
import { type SharedData } from '@/types';
import {
    type ChallengeActivityEntry,
    type ChallengeCountrySummary,
    type ChallengeRegionalSummary,
    type ChallengeSortDirection,
    type ChallengeSortField,
} from '@/types/challenge';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardProps {
    regional: ChallengeRegionalSummary;
    countries: ChallengeCountrySummary[];
    activity: {
        entries: ChallengeActivityEntry[];
        sort: ChallengeSortField;
        direction: ChallengeSortDirection;
        country: string | null;
        date: string | null;
    };
}

export default function ChallengeDashboard({ regional, countries, activity }: DashboardProps) {
    const { flash } = usePage<SharedData>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const defaultCountryCode = [...countries].sort((a, b) => a.id - b.id)[0]?.code ?? 'MY';
    const { myCountry, updateMyCountry } = useMyCountry(defaultCountryCode);

    useEffect(() => {
        if (flash.success) {
            setSuccessMessage(flash.success);
            const timeout = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timeout);
        }
    }, [flash.success]);

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <Head title="Regional Step Challenge" />

            <ChallengeNav countries={countries} myCountry={myCountry} onMyCountryChange={updateMyCountry} onLogSteps={() => setDialogOpen(true)} />

            {successMessage && (
                <div className="mx-auto mt-4 flex max-w-7xl items-center gap-2 rounded-lg bg-[#0E9F6E]/10 px-4 py-3 text-sm font-medium text-[#0B8259] sm:px-6 lg:px-8">
                    <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden="true" />
                    🎉 {successMessage}
                </div>
            )}

            <main className="mx-auto mt-6 flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
                <ChallengeHero regional={regional} />

                <CountryCards countries={countries} />

                <Leaderboard countries={countries} />

                <ActivityTable
                    entries={activity.entries}
                    sort={activity.sort}
                    direction={activity.direction}
                    country={activity.country}
                    date={activity.date}
                    countries={countries}
                />

                <section className="rounded-2xl bg-[#0E9F6E] px-6 py-10 text-center text-white">
                    <p className="text-lg font-bold">3 Countries. 1 Challenge. 10 Million Steps.</p>
                    <p className="mt-2 text-sm text-white/85">🇲🇾 Malaysia + 🇵🇭 Philippines + 🇮🇩 Indonesia</p>
                    <p className="mt-1 text-sm text-white/85">Together, let&apos;s reach 10,000,000 steps.</p>
                </section>
            </main>

            <LogStepsDialog open={dialogOpen} onOpenChange={setDialogOpen} countries={countries} defaultCountryCode={myCountry} />
        </div>
    );
}
