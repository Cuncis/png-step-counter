import AppLogo from '@/components/app-logo';
import { CountryFlag } from '@/components/country-flag';
import InputError from '@/components/input-error';
import AchievementUnlockedDialog from '@/components/step-counter/achievement-unlocked-dialog';
import AchievementsPanel from '@/components/step-counter/achievements-panel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import {
    type ChallengeActivityEntry,
    type ChallengeCountrySummary,
    type ChallengeRegionalSummary,
    type ChallengeSortDirection,
    type ChallengeSortField,
} from '@/types/challenge';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Calendar, Footprints, Globe, LoaderCircle, Medal, PartyPopper, Plus, Trophy } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

const MEDAL_COLORS: Record<number, string> = { 1: '#D4AF37', 2: '#A8A9AD', 3: '#CD7F32' };

function RankBadge({ rank }: { rank: number }) {
    const color = MEDAL_COLORS[rank];

    if (!color) {
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    }

    return <Medal className="h-5 w-5" style={{ color }} aria-hidden="true" />;
}

interface HomeProps {
    regional: ChallengeRegionalSummary;
    countries: ChallengeCountrySummary[];
    activity: {
        entries: ChallengeActivityEntry[];
        sort: ChallengeSortField;
        direction: ChallengeSortDirection;
        country: string | null;
        date: string | null;
        current_page: number;
        last_page: number;
        total: number;
    };
    authCountry: { code: string; name: string } | null;
    personal: { unlockedAchievements: string[] } | null;
}

function formatShortDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function formatDateTime(date: Date): string {
    return date.toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function Hero({ regional }: { regional: ChallengeRegionalSummary }) {
    if (regional.is_complete) {
        return (
            <section className="rounded-2xl bg-[#215AA8] px-6 py-12 text-center text-white shadow-sm sm:px-10 sm:py-16">
                <p className="animate-fade-slide-up flex items-center justify-center gap-1.5 text-sm font-semibold tracking-wide uppercase opacity-90">
                    <Footprints className="h-4 w-4" aria-hidden="true" /> 10 Million Steps
                </p>
                <h1 className="animate-fade-slide-up mt-3 flex items-center justify-center gap-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                    <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" /> WE DID IT!
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                    Together, Malaysia, Philippines and Indonesia have reached 10,000,000 steps!
                </p>
                <p className="mt-6 text-3xl font-bold tabular-nums">{regional.total_steps.toLocaleString()} steps</p>
            </section>
        );
    }

    return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
            <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold tracking-wide text-[#215AA8] uppercase">
                <Footprints className="h-4 w-4" aria-hidden="true" /> Regional Step Challenge
            </p>

            <p className="mt-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase">Total Steps</p>
            <p className="mt-1 text-center text-5xl font-extrabold text-gray-900 tabular-nums sm:text-7xl">{regional.total_steps.toLocaleString()}</p>
            <p className="text-muted-foreground mt-2 text-center text-sm">Steps accumulated across Malaysia, Philippines &amp; Indonesia</p>

            <div className="mx-auto mt-8 max-w-2xl">
                <Progress value={regional.progress_percent} className="h-4" indicatorClassName="bg-[#215AA8]" />
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#215AA8]">{regional.progress_percent}% COMPLETE</span>
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

function CountryCards({ countries }: { countries: ChallengeCountrySummary[] }) {
    const byId = [...countries].sort((a, b) => a.id - b.id);

    return (
        <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Globe className="h-5 w-5 text-[#215AA8]" aria-hidden="true" /> Regional Progress
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {byId.map((country) => (
                    <Card key={country.id} className="shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <CountryFlag code={country.code} className="inline-block h-5 w-7 overflow-hidden rounded-sm" />
                                <h3 className="font-bold text-gray-900">{country.name}</h3>
                            </div>
                            <span className="rounded-full bg-[#215AA8]/10 px-2.5 py-1 text-xs font-bold text-[#215AA8]">#{country.rank}</span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{country.total_steps.toLocaleString()}</p>
                            <p className="text-muted-foreground text-xs">steps</p>

                            <Progress value={country.progress_percent} className="mt-4 h-3" indicatorClassName="bg-[#215AA8]" />
                            <p className="mt-2 text-sm font-semibold text-gray-700">{country.progress_percent}% of country goal</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function Leaderboard({ countries }: { countries: ChallengeCountrySummary[] }) {
    const ranked = [...countries].sort((a, b) => a.rank - b.rank);

    return (
        <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Trophy className="h-5 w-5 text-[#215AA8]" aria-hidden="true" /> Country Leaderboard
            </h2>

            <Card className="mt-4 overflow-hidden shadow-sm">
                <CardContent className="divide-y divide-gray-100 p-0">
                    {ranked.map((country) => (
                        <div
                            key={country.id}
                            className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6', country.rank === 1 && 'bg-[#215AA8]/5')}
                        >
                            <div className="flex items-center gap-3 sm:w-48">
                                <RankBadge rank={country.rank} />
                                <CountryFlag code={country.code} className="inline-block h-4 w-6 overflow-hidden rounded-sm" />
                                <span className="font-bold text-gray-900">{country.name}</span>
                            </div>

                            <div className="flex-1">
                                <Progress value={country.progress_percent} className="h-3" indicatorClassName="bg-[#215AA8]" />
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:w-56 sm:justify-end">
                                <span className="font-bold text-gray-900 tabular-nums">{country.total_steps.toLocaleString()} steps</span>
                                <span className="w-12 text-right text-sm font-bold text-[#215AA8]">{country.progress_percent}%</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}

function Pagination({ currentPage, lastPage, onPageChange }: { currentPage: number; lastPage: number; onPageChange: (page: number) => void }) {
    if (lastPage <= 1) {
        return null;
    }

    const pageNumbers = [...new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1].filter((p) => p >= 1 && p <= lastPage))].sort(
        (a, b) => a - b,
    );

    const items: (number | 'ellipsis')[] = [];
    pageNumbers.forEach((page, index) => {
        if (index > 0 && page - pageNumbers[index - 1] > 1) {
            items.push('ellipsis');
        }
        items.push(page);
    });

    return (
        <nav className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-3" aria-label="Pagination">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
                Prev
            </button>

            {items.map((item, index) =>
                item === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        aria-current={item === currentPage ? 'page' : undefined}
                        className={cn(
                            'min-w-9 rounded-md px-2.5 py-1.5 text-sm font-medium',
                            item === currentPage ? 'bg-[#215AA8] text-white' : 'text-gray-600 hover:bg-gray-100',
                        )}
                    >
                        {item}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
            >
                Next
            </button>
        </nav>
    );
}

function ActivityTable({
    entries,
    sort,
    direction,
    country,
    date,
    current_page: currentPage,
    last_page: lastPage,
    countries,
}: HomeProps['activity'] & { countries: ChallengeCountrySummary[] }) {
    function updateQuery(
        next: Partial<{ sort: ChallengeSortField; direction: ChallengeSortDirection; country: string | null; date: string | null; page: number }>,
    ) {
        const isFilterChange = next.sort !== undefined || next.direction !== undefined || next.country !== undefined || next.date !== undefined;

        router.get(
            route('home'),
            {
                sort: next.sort ?? sort,
                direction: next.direction ?? direction,
                country: next.country === undefined ? country : next.country,
                date: next.date === undefined ? date : next.date,
                page: next.page ?? (isFilterChange ? 1 : currentPage),
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
        <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Calendar className="h-5 w-5 text-[#215AA8]" aria-hidden="true" /> Daily Activity
                </h2>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select value={country ?? 'all'} onValueChange={(next) => updateQuery({ country: next === 'all' ? null : next })}>
                        <SelectTrigger className="h-9 w-full sm:w-[170px]">
                            <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All countries</SelectItem>
                            {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    <span className="flex items-center gap-1.5">
                                        <CountryFlag code={c.code} />
                                        {c.name}
                                    </span>
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
                                        <span className="flex items-center gap-1.5">
                                            <CountryFlag code={entry.country.code} />
                                            {entry.country.name}
                                        </span>
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

                <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => updateQuery({ page })} />
            </Card>
        </section>
    );
}

function HomeHeader({ canLogSteps, onLogSteps }: { canLogSteps: boolean; onLogSteps: () => void }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={route('home')} className="flex items-center">
                    <AppLogo />
                </Link>

                <nav className="flex items-center gap-3 text-sm">
                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 gap-2 rounded-full pr-1 pl-3">
                                    <span className="text-sm font-medium text-gray-700">{auth.user.name}</span>
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href={route('login')} className="px-3 py-2 font-medium text-gray-700 hover:text-[#215AA8]">
                            Log in
                        </Link>
                    )}

                    {canLogSteps ? (
                        <Button
                            type="button"
                            onClick={onLogSteps}
                            className="gap-1.5 bg-[#215AA8] px-4 py-2 font-medium text-white hover:bg-[#252B69]"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" /> Log Steps
                        </Button>
                    ) : (
                        <Link
                            href={route('login')}
                            className="flex items-center gap-1.5 rounded-md bg-[#215AA8] px-4 py-2 font-medium text-white hover:bg-[#252B69]"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" /> Log Steps
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

function LogStepsDialog({
    open,
    onOpenChange,
    authCountry,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    authCountry: { code: string; name: string } | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{ steps: string; evidence: File | null }>({
        steps: '',
        evidence: null,
    });
    const [clientErrors, setClientErrors] = useState<{ steps?: string; evidence?: string }>({});
    const evidenceInputRef = useRef<HTMLInputElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const nextErrors: { steps?: string; evidence?: string } = {};
        if (!data.steps.trim()) {
            nextErrors.steps = 'Please enter your step count.';
        }
        if (!data.evidence) {
            nextErrors.evidence = 'Please upload evidence.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setClientErrors(nextErrors);
            return;
        }

        post(route('steps.store'), {
            onSuccess: () => {
                reset();
                if (evidenceInputRef.current) {
                    evidenceInputRef.current.value = '';
                }
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    clearErrors();
                    setClientErrors({});
                }
                onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Today&apos;s Steps</DialogTitle>
                    <DialogDescription>
                        Enter today&apos;s step count and upload a photo as evidence.{' '}
                        <strong className="text-foreground font-semibold">{formatDateTime(new Date())}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="grid gap-5">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <div className="border-input bg-muted/40 text-foreground flex items-center rounded-md border px-3 py-2 text-sm font-medium">
                            {auth.user?.name}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Country</Label>
                        <div className="border-input bg-muted/40 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                            {authCountry ? (
                                <>
                                    <CountryFlag code={authCountry.code} />
                                    <span className="text-foreground font-medium">{authCountry.name}</span>
                                </>
                            ) : (
                                <span>Not set</span>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="steps">Step count</Label>
                        <Input
                            id="steps"
                            type="number"
                            min={0}
                            max={200000}
                            value={data.steps}
                            onChange={(e) => {
                                setData('steps', e.target.value);
                                setClientErrors((prev) => ({ ...prev, steps: undefined }));
                            }}
                            placeholder="e.g. 8400"
                            aria-invalid={Boolean(clientErrors.steps || errors.steps)}
                        />
                        <InputError message={clientErrors.steps || errors.steps} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="evidence">Evidence (screenshot or photo)</Label>
                        <div className="border-input bg-background flex items-center gap-3 rounded-md border p-1">
                            <input
                                id="evidence"
                                type="file"
                                accept="image/*,.pdf"
                                ref={evidenceInputRef}
                                onChange={(e) => {
                                    setData('evidence', e.target.files?.[0] ?? null);
                                    setClientErrors((prev) => ({ ...prev, evidence: undefined }));
                                }}
                                className="peer sr-only"
                            />
                            <label
                                htmlFor="evidence"
                                className={cn(
                                    buttonVariants({ variant: 'secondary' }),
                                    'peer-focus-visible:ring-ring h-8 flex-none cursor-pointer rounded-sm px-3 text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
                                )}
                            >
                                Choose File
                            </label>
                            <span className="text-muted-foreground truncate text-sm">{data.evidence ? data.evidence.name : 'No file chosen'}</span>
                        </div>
                        <p className="text-muted-foreground text-xs">JPG, PNG, HEIC, or PDF, up to 5MB.</p>
                        <InputError message={clientErrors.evidence || errors.evidence} />
                    </div>

                    <Button type="submit" disabled={processing} className="w-full bg-[#215AA8] hover:bg-[#252B69]">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Submit Steps
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Home({ regional, countries, activity, authCountry, personal }: HomeProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <Head title="P&G Step Counter" />

            <HomeHeader canLogSteps={Boolean(auth.user)} onLogSteps={() => setDialogOpen(true)} />

            <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-8">
                <Hero regional={regional} />

                <CountryCards countries={countries} />

                {personal && <AchievementsPanel unlocked={personal.unlockedAchievements} />}

                <Leaderboard countries={countries} />

                <ActivityTable
                    entries={activity.entries}
                    sort={activity.sort}
                    direction={activity.direction}
                    country={activity.country}
                    date={activity.date}
                    current_page={activity.current_page}
                    last_page={activity.last_page}
                    total={activity.total}
                    countries={countries}
                />

                <section className="rounded-2xl bg-[#215AA8] px-6 py-10 text-center text-white">
                    <p className="text-lg font-bold">3 Countries. 1 Challenge. 10 Million Steps.</p>
                    <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/85">
                        <CountryFlag code="MY" /> Malaysia + <CountryFlag code="PH" /> Philippines + <CountryFlag code="ID" /> Indonesia
                    </p>
                    <p className="mt-1 text-sm text-white/85">Together, let&apos;s reach 10,000,000 steps.</p>
                </section>
            </main>

            <LogStepsDialog open={dialogOpen} onOpenChange={setDialogOpen} authCountry={authCountry} />

            <AchievementUnlockedDialog keys={flash.newAchievements ?? []} />
        </div>
    );
}
