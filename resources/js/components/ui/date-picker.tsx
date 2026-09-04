import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

function parseIsoDate(value: string): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function DatePicker({
    id,
    value,
    onChange,
    placeholder = 'Pick a date',
    max,
    fromYear = 1900,
    toYear,
    invalid,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    max?: string;
    fromYear?: number;
    toYear?: number;
    invalid?: boolean;
}) {
    const [open, setOpen] = React.useState(false);

    const selected = parseIsoDate(value);
    const maxDate = max ? parseIsoDate(max) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    aria-invalid={invalid}
                    className={cn(
                        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
                        'hover:bg-accent/40 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'aria-invalid:border-destructive',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    <span>
                        {selected
                            ? selected.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                            : placeholder}
                    </span>
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    defaultMonth={selected ?? maxDate}
                    onSelect={(date) => {
                        if (date) {
                            onChange(formatIsoDate(date));
                            setOpen(false);
                        }
                    }}
                    disabled={maxDate ? { after: maxDate } : undefined}
                    captionLayout="dropdown"
                    fromYear={fromYear}
                    toYear={toYear ?? new Date().getFullYear()}
                />
            </PopoverContent>
        </Popover>
    );
}
