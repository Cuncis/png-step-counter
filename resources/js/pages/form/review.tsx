import AppLogo from '@/components/app-logo';
import FormStepReviewCard from '@/components/form-step-review-card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type FormStepDefinition, type FormSubmissionData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, LogOut } from 'lucide-react';

export default function Review({ steps, submission }: { steps: FormStepDefinition[]; submission: FormSubmissionData }) {
    return (
        <div className="bg-background min-h-svh">
            <Head title="Review answers" />

            <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
                <div className="flex items-center">
                    <AppLogo />
                </div>
                <Link
                    method="post"
                    href={route('logout')}
                    as="button"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                </Link>
            </header>

            <div className="mx-auto w-full max-w-2xl px-4 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Your journey so far</h1>
                    {submission.is_complete && (
                        <Badge className="w-fit gap-1.5 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            All steps complete
                        </Badge>
                    )}
                </div>

                <div className="mt-6 space-y-4">
                    {steps.map((step) => (
                        <FormStepReviewCard key={step.number} step={step} data={submission.steps[String(step.number)]} />
                    ))}
                </div>

                {submission.is_complete && (
                    <div className="mt-6 flex justify-end">
                        <Link href={route('home')} className={cn(buttonVariants(), 'w-full gap-2 bg-[#215AA8] hover:bg-[#252B69] sm:w-auto')}>
                            Go to Step Counter
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
