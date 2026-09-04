import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-2',
                month: 'flex flex-col gap-4',
                caption: 'flex justify-center pt-1 relative items-center w-full',
                caption_label: 'inline-flex items-center text-sm font-medium',
                caption_dropdowns: 'flex items-center gap-1.5',
                dropdown: 'absolute inset-0 z-10 cursor-pointer opacity-0',
                dropdown_month: 'relative inline-flex items-center rounded-md border border-input bg-background px-2 py-1 text-sm',
                dropdown_year: 'relative inline-flex items-center rounded-md border border-input bg-background px-2 py-1 text-sm',
                vhidden: 'hidden',
                nav: 'flex items-center gap-1',
                nav_button: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-70 hover:opacity-100'),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-x-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                day: cn(buttonVariants({ variant: 'ghost' }), 'size-9 p-0 font-normal aria-selected:opacity-100'),
                day_range_end: 'day-range-end',
                day_selected: 'bg-[#215AA8] text-white hover:bg-[#215AA8] hover:text-white focus:bg-[#215AA8] focus:text-white',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'day-outside text-muted-foreground aria-selected:text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="size-4" />,
                IconRight: () => <ChevronRight className="size-4" />,
                IconDropdown: () => <ChevronDown className="ml-1.5 size-3.5 opacity-60" />,
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
