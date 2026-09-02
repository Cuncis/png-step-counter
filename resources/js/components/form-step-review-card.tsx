import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatFormFieldValue } from '@/lib/format-form-value';
import { type FormStepDefinition, type FormStepValues } from '@/types';
import { Link } from '@inertiajs/react';

export default function FormStepReviewCard({ step, data }: { step: FormStepDefinition; data?: FormStepValues }) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <h2 className="text-base font-semibold">{step.name}</h2>
                <Link href={route('form.show', { step: step.number })} className="text-primary text-sm font-medium hover:underline">
                    Edit
                </Link>
            </CardHeader>
            <CardContent>
                {data ? (
                    <dl className="space-y-3">
                        {step.fields.map((field) => (
                            <div key={field.name} className="flex flex-col gap-0.5 border-t pt-3 sm:flex-row sm:gap-4">
                                <dt className="text-muted-foreground text-sm sm:w-44 sm:shrink-0">{field.label}</dt>
                                <dd className="text-sm break-words">{formatFormFieldValue(field, data)}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <p className="text-muted-foreground text-sm">Nothing saved for this step yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
