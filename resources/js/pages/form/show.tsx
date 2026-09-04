import FormStepField from '@/components/form-step-field';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormStepDefinition, type FormStepValues } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Briefcase, CalendarHeart, Check, LoaderCircle, Ruler, type LucideIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My journey', href: '/form' }];

const STEP_ICONS: Record<string, LucideIcon> = {
    CalendarHeart,
    Ruler,
    Briefcase,
};

export default function FormShow({
    step,
    totalSteps,
    values,
    errors,
}: {
    step: FormStepDefinition;
    totalSteps: number;
    values: FormStepValues;
    errors: Record<string, string>;
}) {
    const [data, setData] = useState<FormStepValues>(values);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setData(values);
    }, [step.number, values]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('form.update', { step: step.number }), data, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const StepIcon = STEP_ICONS[step.icon] ?? CalendarHeart;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={step.name} />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                <div className="animate-fade-slide-up text-center">
                    <span className="text-sm font-semibold tracking-wide text-[#215AA8] uppercase">Your health journey</span>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{step.number === 1 ? "Let's personalize your journey" : step.name}</h1>
                </div>

                <ol className="animate-fade-slide-up mt-6 flex items-center justify-center" style={{ animationDelay: '40ms' }}>
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((number, index) => {
                        const isDone = number < step.number;
                        const isActive = number === step.number;
                        return (
                            <li key={number} className="flex items-center">
                                {index > 0 && (
                                    <span
                                        className={`mx-1.5 h-0.5 w-8 rounded-full transition-colors duration-300 sm:w-14 ${
                                            isDone || isActive ? 'bg-[#215AA8]' : 'bg-secondary'
                                        }`}
                                    />
                                )}
                                <span
                                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                                        isDone
                                            ? 'bg-[#215AA8] text-white'
                                            : isActive
                                              ? 'bg-[#215AA8] text-white shadow-md ring-4 shadow-[#215AA8]/30 ring-[#215AA8]/15'
                                              : 'bg-secondary text-muted-foreground'
                                    }`}
                                >
                                    {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : number}
                                </span>
                            </li>
                        );
                    })}
                </ol>

                <Card className="animate-fade-slide-up mt-6 overflow-hidden shadow-sm" style={{ animationDelay: '80ms' }}>
                    <div className="relative overflow-hidden bg-[#00B0C7]/[0.06] px-6 pt-6 pb-5 sm:px-8">
                        <CardHeader className="flex-row items-start gap-3 space-y-0 p-0">
                            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                                <StepIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">{step.name}</h2>
                                {step.description && <p className="text-muted-foreground mt-0.5 text-sm">{step.description}</p>}
                            </div>
                        </CardHeader>
                    </div>

                    <CardContent className="px-6 pt-6 pb-6 sm:px-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5">
                                {step.fields.map((field) => (
                                    <FormStepField
                                        key={field.name}
                                        field={field}
                                        values={data}
                                        errors={errors}
                                        onChange={(name, value) => setData((prev) => ({ ...prev, [name]: value }))}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row-reverse sm:justify-between">
                                <Button type="submit" disabled={processing} className="w-full bg-[#215AA8] hover:bg-[#252B69] sm:w-auto">
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    {step.number === totalSteps ? 'Finish and review' : 'Save and continue'}
                                </Button>
                                {step.number > 1 && (
                                    <Link
                                        href={route('form.show', { step: step.number - 1 })}
                                        className={buttonVariants({ variant: 'secondary', className: 'w-full sm:w-auto' })}
                                    >
                                        Back
                                    </Link>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
