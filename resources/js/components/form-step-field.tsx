import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type FormField } from '@/types';

export default function FormStepField({
    field,
    value,
    onChange,
    error,
}: {
    field: FormField;
    value: string;
    onChange: (name: string, value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.optional && <span className="text-muted-foreground ml-1 font-normal">(optional)</span>}
            </Label>

            {field.type === 'textarea' ? (
                <Textarea
                    id={field.name}
                    value={value}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                />
            ) : (
                <Input
                    id={field.name}
                    type={field.type}
                    value={value}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    max={field.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
                    aria-invalid={Boolean(error)}
                />
            )}

            <InputError message={error} />
        </div>
    );
}
