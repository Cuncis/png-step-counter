import FormStepField from '@/components/form-step-field';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormStepDefinition, type FormStepValues } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Onboarding form', href: '/form' }];

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

    const percent = Math.round(((step.number - 1) / totalSteps) * 100);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('form.update', { step: step.number }), data, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={step.name} />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                <Card>
                    <CardHeader className="gap-4">
                        <div>
                            <div className="flex items-baseline justify-between">
                                <p className="text-sm font-medium">
                                    Step {step.number} of {totalSteps}
                                </p>
                                <p className="text-muted-foreground text-sm">{percent}% complete</p>
                            </div>
                            <Progress value={percent} className="mt-2" />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold">{step.name}</h1>
                            {step.description && <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5">
                                {step.fields.map((field) => (
                                    <FormStepField
                                        key={field.name}
                                        field={field}
                                        value={data[field.name] ?? ''}
                                        onChange={(name, value) => setData((prev) => ({ ...prev, [name]: value }))}
                                        error={errors[field.name]}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row-reverse sm:justify-between">
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
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

                <p className="text-muted-foreground mt-4 text-center text-sm">
                    Each step is saved when you continue, so you can leave and come back.
                </p>
            </div>
        </AppLayout>
    );
}
