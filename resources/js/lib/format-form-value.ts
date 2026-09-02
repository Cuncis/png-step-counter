import { type FormField, type FormStepValues } from '@/types';

export function formatFormFieldValue(field: FormField, data: FormStepValues): string {
    const value = data[field.name];
    if (value === undefined || value.trim() === '') return 'Not answered';

    if (field.type === 'date') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    if (field.type === 'select') {
        if (field.allowOther && value === 'other') {
            const other = data[`${field.name}_other`];
            return other && other.trim() !== '' ? other : 'Other';
        }
        return field.options?.find((option) => option.value === value)?.label ?? value;
    }

    if (field.type === 'number') {
        return field.suffix ? `${value} ${field.suffix}` : value;
    }

    return value;
}
