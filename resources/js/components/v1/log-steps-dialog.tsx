import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ChallengeCountrySummary } from '@/types/challenge';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

function todayIso(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function LogStepsDialog({
    open,
    onOpenChange,
    countries,
    defaultCountryCode,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    countries: ChallengeCountrySummary[];
    defaultCountryCode: string;
}) {
    const defaultCountry = countries.find((c) => c.code === defaultCountryCode) ?? countries[0];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        challenge_country_id: defaultCountry ? String(defaultCountry.id) : '',
        date: todayIso(),
        steps: '',
        participant_name: '',
    });

    useEffect(() => {
        if (open && defaultCountry) {
            setData('challenge_country_id', String(defaultCountry.id));
        }
        // Only sync when the dialog opens, not on every countries/defaultCountry re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('v1.steps.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('steps', 'participant_name');
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) clearErrors();
                onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Log Today&apos;s Steps</DialogTitle>
                    <DialogDescription>Add your step count to your country&apos;s regional total.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="challenge_country_id">Country</Label>
                        <Select value={data.challenge_country_id} onValueChange={(next) => setData('challenge_country_id', next)}>
                            <SelectTrigger id="challenge_country_id" aria-invalid={Boolean(errors.challenge_country_id)}>
                                <SelectValue placeholder="Select country" />
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
                        <Label htmlFor="date">Date</Label>
                        <DatePicker
                            id="date"
                            value={data.date}
                            onChange={(next) => setData('date', next)}
                            max={todayIso()}
                            invalid={Boolean(errors.date)}
                        />
                        <InputError message={errors.date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="steps">Step Count</Label>
                        <Input
                            id="steps"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={100000}
                            required
                            value={data.steps}
                            onChange={(e) => setData('steps', e.target.value)}
                            placeholder="10,000"
                            aria-invalid={Boolean(errors.steps)}
                        />
                        <InputError message={errors.steps} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="participant_name">
                            Participant Name / ID <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="participant_name"
                            value={data.participant_name}
                            onChange={(e) => setData('participant_name', e.target.value)}
                            placeholder="Your name"
                            aria-invalid={Boolean(errors.participant_name)}
                        />
                        <InputError message={errors.participant_name} />
                    </div>

                    <Button type="submit" disabled={processing} className="w-full bg-[#0E9F6E] hover:bg-[#0B8259]">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Submit Steps
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
