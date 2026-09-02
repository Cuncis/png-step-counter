import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type FormField, type FormStepValues } from '@/types';

export default function FormStepField({
    field,
    values,
    onChange,
    errors,
}: {
    field: FormField;
    values: FormStepValues;
    onChange: (name: string, value: string) => void;
    errors: Record<string, string>;
}) {
    const value = values[field.name] ?? '';
    const error = errors[field.name];
    const otherKey = `${field.name}_other`;
    const showOther = field.allowOther && value === 'other';

    return (
        <div className="grid gap-2">
            <Label htmlFor={field.name}>
                {field.label}
                {field.optional && <span className="text-muted-foreground ml-1 font-normal">(optional)</span>}
            </Label>

            {field.type === 'textarea' && (
                <Textarea
                    id={field.name}
                    value={value}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                />
            )}

            {field.type === 'select' && (
                <Select value={value || undefined} onValueChange={(next) => onChange(field.name, next)}>
                    <SelectTrigger id={field.name} aria-invalid={Boolean(error)}>
                        <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {field.type === 'number' && (
                <div className="relative">
                    <Input
                        id={field.name}
                        type="number"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={field.suffix ? 'pr-12' : undefined}
                        aria-invalid={Boolean(error)}
                    />
                    {field.suffix && (
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                            {field.suffix}
                        </span>
                    )}
                </div>
            )}

            {!['textarea', 'select', 'number'].includes(field.type) && (
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

            {showOther && (
                <div className="grid gap-2 pt-1">
                    <Label htmlFor={otherKey} className="text-muted-foreground">
                        Please specify
                    </Label>
                    <Input
                        id={otherKey}
                        value={values[otherKey] ?? ''}
                        onChange={(e) => onChange(otherKey, e.target.value)}
                        placeholder="Tell us more"
                        aria-invalid={Boolean(errors[otherKey])}
                    />
                    <InputError message={errors[otherKey]} />
                </div>
            )}
        </div>
    );
}
