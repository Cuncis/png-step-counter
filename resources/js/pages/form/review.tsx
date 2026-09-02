import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormStepDefinition, type FormSubmissionData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Review answers', href: '/review' }];

function formatValue(field: FormStepDefinition['fields'][number], value: string | undefined): string {
    if (value === undefined || value.trim() === '') return 'Not answered';

    if (field.type === 'date') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    return value;
}

export default function Review({ steps, submission }: { steps: FormStepDefinition[]; submission: FormSubmissionData }) {
    const handleReset = () => {
        router.post(route('form.reset'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review answers" />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Your answers</h1>
                    {submission.is_complete && (
                        <Badge className="w-fit gap-1.5 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            All steps complete
                        </Badge>
                    )}
                </div>

                <div className="mt-6 space-y-4">
                    {steps.map((step) => {
                        const data = submission.steps[String(step.number)];
                        return (
                            <Card key={step.number}>
                                <CardHeader className="flex-row items-center justify-between space-y-0">
                                    <h2 className="text-base font-semibold">{step.name}</h2>
                                    <Link
                                        href={route('form.show', { step: step.number })}
                                        className="text-primary text-sm font-medium hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {data ? (
                                        <dl className="space-y-3">
                                            {step.fields.map((field) => (
                                                <div key={field.name} className="flex flex-col gap-0.5 border-t pt-3 sm:flex-row sm:gap-4">
                                                    <dt className="text-muted-foreground text-sm sm:w-44 sm:shrink-0">{field.label}</dt>
                                                    <dd className="text-sm break-words">{formatValue(field, data[field.name])}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Nothing saved for this step yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('dashboard')}>Done</Link>
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="w-full sm:w-auto">
                                Start over
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Start over?</DialogTitle>
                            <DialogDescription>
                                This clears every answer you've saved and takes you back to step 1. This cannot be undone.
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={handleReset}>
                                    Start over
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
