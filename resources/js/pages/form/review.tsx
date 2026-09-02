import FormStepReviewCard from '@/components/form-step-review-card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormStepDefinition, type FormSubmissionData } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Review answers', href: '/review' }];

export default function Review({ steps, submission }: { steps: FormStepDefinition[]; submission: FormSubmissionData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review answers" />

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
            </div>
        </AppLayout>
    );
}
