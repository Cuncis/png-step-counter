import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Download, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface AdminCountry {
    id: number;
    name: string;
    code: string;
    flag_emoji: string;
    goal_steps: number;
    total_steps: number;
}

interface AdminEntry {
    id: number;
    date: string;
    participant_name: string | null;
    steps: number;
    country: { id: number; name: string; code: string; flag_emoji: string };
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
}

interface AdminProps {
    countries: AdminCountry[];
    regional: { total_steps: number; goal_steps: number; progress_percent: number };
    entries: Paginated<AdminEntry>;
    filters: { country: string | null; date_from: string | null; date_to: string | null };
}

function GoalsForm({ countries }: { countries: AdminCountry[] }) {
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        goals: countries.map((c) => ({ id: c.id, goal_steps: c.goal_steps })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('v1.admin.goals.update'), { preserveScroll: true });
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <h2 className="font-bold text-gray-900">Country Goals</h2>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
                    {countries.map((country, index) => (
                        <div key={country.id} className="grid gap-2">
                            <Label htmlFor={`goal-${country.id}`}>
                                {country.flag_emoji} {country.name}
                            </Label>
                            <Input
                                id={`goal-${country.id}`}
                                type="number"
                                min={1}
                                value={data.goals[index].goal_steps}
                                onChange={(e) => {
                                    const next = [...data.goals];
                                    next[index] = { ...next[index], goal_steps: Number(e.target.value) };
                                    setData('goals', next);
                                }}
                            />
                        </div>
                    ))}
                    <div className="flex items-center gap-3 sm:col-span-3">
                        <Button type="submit" disabled={processing} className="bg-[#0E9F6E] hover:bg-[#0B8259]">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save Goals
                        </Button>
                        {recentlySuccessful && <span className="text-sm text-[#0E9F6E]">Saved</span>}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function EditEntryDialog({ entry, countries, onClose }: { entry: AdminEntry | null; countries: AdminCountry[]; onClose: () => void }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        challenge_country_id: entry ? String(entry.country.id) : '',
        date: entry?.date ?? '',
        steps: entry ? String(entry.steps) : '',
        participant_name: entry?.participant_name ?? '',
    });

    useEffect(() => {
        if (entry) {
            setData({
                challenge_country_id: String(entry.country.id),
                date: entry.date,
                steps: String(entry.steps),
                participant_name: entry.participant_name ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entry?.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!entry) return;
        put(route('v1.admin.entries.update', entry.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Step Entry</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-country">Country</Label>
                        <Select value={data.challenge_country_id} onValueChange={(next) => setData('challenge_country_id', next)}>
                            <SelectTrigger id="edit-country">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.flag_emoji} {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.challenge_country_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input id="edit-date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                        <InputError message={errors.date} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-steps">Steps</Label>
                        <Input id="edit-steps" type="number" min={1} value={data.steps} onChange={(e) => setData('steps', e.target.value)} />
                        <InputError message={errors.steps} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-participant">Participant</Label>
                        <Input id="edit-participant" value={data.participant_name} onChange={(e) => setData('participant_name', e.target.value)} />
                        <InputError message={errors.participant_name} />
                    </div>
                    <Button type="submit" disabled={processing} className="bg-[#0E9F6E] hover:bg-[#0B8259]">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ChallengeAdmin({ countries, regional, entries, filters }: AdminProps) {
    const { flash } = usePage<SharedData>().props;
    const [editing, setEditing] = useState<AdminEntry | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (flash.success) {
            setSuccessMessage(flash.success);
            const timeout = setTimeout(() => setSuccessMessage(null), 4000);
            return () => clearTimeout(timeout);
        }
    }, [flash.success]);

    function updateFilters(next: Partial<{ country: string | null; date_from: string | null; date_to: string | null }>) {
        router.get(
            route('v1.admin.index'),
            {
                country: next.country === undefined ? filters.country : next.country,
                date_from: next.date_from === undefined ? filters.date_from : next.date_from,
                date_to: next.date_to === undefined ? filters.date_to : next.date_to,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function destroy(entry: AdminEntry) {
        if (!confirm(`Delete this ${entry.steps.toLocaleString()}-step entry for ${entry.country.name}?`)) return;
        router.delete(route('v1.admin.entries.destroy', entry.id), { preserveScroll: true });
    }

    const exportUrl = route('v1.admin.export', {
        country: filters.country ?? undefined,
        date_from: filters.date_from ?? undefined,
        date_to: filters.date_to ?? undefined,
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <Head title="Step Challenge Admin" />

            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <h1 className="font-bold text-gray-900">Step Challenge — Admin</h1>
                    <a href={exportUrl} className="inline-flex items-center gap-2 text-sm font-medium text-[#0E9F6E] hover:underline">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </a>
                </div>
            </header>

            {successMessage && (
                <div className="mx-auto mt-4 flex max-w-6xl items-center gap-2 rounded-lg bg-[#0E9F6E]/10 px-4 py-3 text-sm font-medium text-[#0B8259] sm:px-6 lg:px-8">
                    <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden="true" />
                    {successMessage}
                </div>
            )}

            <main className="mx-auto mt-6 flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card className="shadow-sm">
                        <CardContent className="py-5">
                            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{regional.total_steps.toLocaleString()}</p>
                            <p className="text-muted-foreground text-xs">Regional total ({regional.progress_percent}%)</p>
                        </CardContent>
                    </Card>
                    {countries.map((c) => (
                        <Card key={c.id} className="shadow-sm">
                            <CardContent className="py-5">
                                <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{c.total_steps.toLocaleString()}</p>
                                <p className="text-muted-foreground text-xs">
                                    {c.flag_emoji} {c.name}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <GoalsForm countries={countries} />

                <Card className="shadow-sm">
                    <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                        <h2 className="font-bold text-gray-900">All Submissions ({entries.total})</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={filters.country ?? 'all'}
                                onValueChange={(next) => updateFilters({ country: next === 'all' ? null : next })}
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="All countries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All countries</SelectItem>
                                    {countries.map((c) => (
                                        <SelectItem key={c.id} value={c.code}>
                                            {c.flag_emoji} {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                value={filters.date_from ?? ''}
                                onChange={(e) => updateFilters({ date_from: e.target.value || null })}
                                className="h-9 w-[150px]"
                                aria-label="From date"
                            />
                            <Input
                                type="date"
                                value={filters.date_to ?? ''}
                                onChange={(e) => updateFilters({ date_to: e.target.value || null })}
                                className="h-9 w-[150px]"
                                aria-label="To date"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-500 uppercase">Country</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-500 uppercase">Participant</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">Steps</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.data.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{entry.date}</td>
                                        <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">
                                            {entry.country.flag_emoji} {entry.country.name}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">{entry.participant_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">{entry.steps.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(entry)}
                                                className="text-muted-foreground mr-3 inline-flex items-center hover:text-gray-900"
                                                aria-label="Edit entry"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => destroy(entry)}
                                                className="inline-flex items-center text-red-500 hover:text-red-700"
                                                aria-label="Delete entry"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {entries.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                            No submissions found for these filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {(entries.prev_page_url || entries.next_page_url) && (
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            disabled={!entries.prev_page_url}
                            onClick={() =>
                                entries.prev_page_url && router.get(entries.prev_page_url, {}, { preserveState: true, preserveScroll: true })
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-muted-foreground text-sm">
                            Page {entries.current_page} of {entries.last_page}
                        </span>
                        <Button
                            variant="outline"
                            disabled={!entries.next_page_url}
                            onClick={() =>
                                entries.next_page_url && router.get(entries.next_page_url, {}, { preserveState: true, preserveScroll: true })
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </main>

            <EditEntryDialog entry={editing} countries={countries} onClose={() => setEditing(null)} />
        </div>
    );
}
