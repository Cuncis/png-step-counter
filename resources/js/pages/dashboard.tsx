import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormStepDefinition, type FormSubmissionData, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ submission, steps }: { submission: FormSubmissionData; steps: FormStepDefinition[] }) {
    const { auth } = usePage<SharedData>().props;

    const completed = submission.is_complete ? steps.length : submission.current_step - 1;
    const percent = Math.round((completed / steps.length) * 100);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {auth.user.name}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{auth.user.email}</p>

                <Card className="mt-8">
                    <CardHeader className="flex-row items-baseline justify-between space-y-0">
                        <h2 className="text-sm font-semibold tracking-wide text-[#252B69] uppercase dark:text-[#8fb3e0]">Your application</h2>
                        <span className="text-muted-foreground text-sm">
                            {completed} of {steps.length} steps
                        </span>
                    </CardHeader>

                    <CardContent>
                        <Progress value={percent} className="[&>div]:bg-[#00B0C7]" />
                        <p className="text-muted-foreground mt-2 text-sm">{percent}% complete</p>

                        <ol className="mt-6 space-y-2">
                            {steps.map((step) => {
                                const done = Boolean(submission.steps[String(step.number)]);
                                return (
                                    <li key={step.number} className="flex items-center gap-3 text-sm">
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                                done ? 'bg-[#215AA8] text-white' : 'bg-secondary text-muted-foreground'
                                            }`}
                                        >
                                            {done ? <Check className="h-3 w-3" /> : step.number}
                                        </span>
                                        <span className={done ? '' : 'text-muted-foreground'}>{step.name}</span>
                                    </li>
                                );
                            })}
                        </ol>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {submission.is_complete ? (
                                <Button asChild className="w-full bg-[#215AA8] hover:bg-[#252B69] sm:w-auto">
                                    <Link href={route('form.review')}>Review answers</Link>
                                </Button>
                            ) : (
                                <Button asChild className="w-full bg-[#215AA8] hover:bg-[#252B69] sm:w-auto">
                                    <Link href={route('form.index')}>{completed === 0 ? 'Start the form' : 'Resume the form'}</Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
