import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    Award,
    BadgeCheck,
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    Crown,
    Diamond,
    Flame,
    Footprints,
    Gem,
    Medal,
    Mountain,
    Rocket,
    ShieldCheck,
    Sparkles,
    Star,
    Sun,
    Sunrise,
    Trophy,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

export const ACHIEVEMENTS: { key: string; label: string; description: string; icon: LucideIcon }[] = [
    { key: 'first-1000', label: 'First 1,000', description: 'Log 1,000 steps in a single day.', icon: Footprints },
    { key: 'five-thousand-day', label: '5,000 in a day', description: 'Log 5,000 steps in a single day.', icon: Flame },
    { key: 'ten-thousand-day', label: '10,000 in a day', description: 'Log 10,000 steps in a single day.', icon: Trophy },
    { key: 'fifteen-thousand-day', label: '15,000 in a day', description: 'Log 15,000 steps in a single day.', icon: Rocket },
    { key: 'twenty-thousand-day', label: '20,000 in a day', description: 'Log 20,000 steps in a single day.', icon: Crown },
    { key: 'three-day-streak', label: '3-day streak', description: 'Log steps 3 days in a row.', icon: CalendarCheck },
    { key: 'seven-day-streak', label: '7-day streak', description: 'Log steps 7 days in a row.', icon: CalendarDays },
    { key: 'fourteen-day-streak', label: '14-day streak', description: 'Log steps 14 days in a row.', icon: CalendarRange },
    { key: 'thirty-day-streak', label: '30-day streak', description: 'Log steps 30 days in a row.', icon: CalendarClock },
    { key: 'hundred-day-streak', label: '100-day streak', description: 'Log steps 100 days in a row.', icon: Medal },
    { key: 'total-50k', label: '50,000 lifetime steps', description: 'Reach 50,000 steps logged in total.', icon: Star },
    { key: 'total-100k', label: '100,000 lifetime steps', description: 'Reach 100,000 steps logged in total.', icon: Sparkles },
    { key: 'total-500k', label: '500,000 lifetime steps', description: 'Reach 500,000 steps logged in total.', icon: Gem },
    { key: 'total-1m', label: '1,000,000 lifetime steps', description: 'Reach 1,000,000 steps logged in total.', icon: Diamond },
    { key: 'total-5m', label: '5,000,000 lifetime steps', description: 'Reach 5,000,000 steps logged in total.', icon: Mountain },
    { key: 'thirty-day-month', label: '30 days in a month', description: 'Log steps on every day of a calendar month.', icon: Award },
    { key: 'first-week-logged', label: '7 days logged', description: 'Log steps on 7 different days.', icon: BadgeCheck },
    { key: 'hundred-days-logged', label: '100 days logged', description: 'Log steps on 100 different days.', icon: ShieldCheck },
    { key: 'weekend-warrior', label: 'Weekend warrior', description: 'Log steps on both Saturday and Sunday in the same week.', icon: Sun },
    { key: 'early-bird', label: 'Early bird', description: "Log a day's steps before 7 AM.", icon: Sunrise },
];

export default function AchievementsPanel({
    unlocked = [],
    newKeys = [],
    onView,
    layout = 'grid',
}: {
    unlocked?: string[];
    /** Unlocked achievements the walker hasn't opened the detail popup for yet. */
    newKeys?: string[];
    /** Called when an achievement's detail popup is opened, to clear its "new" badge. */
    onView?: (key: string) => void;
    layout?: 'grid' | 'horizontal';
}) {
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const unlockedCount = ACHIEVEMENTS.filter((achievement) => unlocked.includes(achievement.key)).length;
    const selected = ACHIEVEMENTS.find((achievement) => achievement.key === selectedKey) ?? null;
    const selectedIsUnlocked = selectedKey !== null && unlocked.includes(selectedKey);

    function openAchievement(key: string) {
        setSelectedKey(key);
        onView?.(key);
    }

    return (
        <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EF5323]/10 text-[#EF5323]">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h2 className="text-[15px] font-semibold">Achievements</h2>
                </div>
                <span className="text-muted-foreground text-[13px] tabular-nums">
                    {unlockedCount} of {ACHIEVEMENTS.length}
                </span>
            </CardHeader>

            <CardContent className="pt-4">
                <ul
                    className={
                        layout === 'horizontal'
                            ? 'flex justify-center gap-3 overflow-x-auto pb-1 sm:gap-4'
                            : 'grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-5 sm:gap-x-1.5'
                    }
                >
                    {ACHIEVEMENTS.map(({ key, label, icon: Icon }) => {
                        const isUnlocked = unlocked.includes(key);
                        const isNew = isUnlocked && newKeys.includes(key);
                        return (
                            <li key={key} className={layout === 'horizontal' ? 'flex w-16 flex-none flex-col sm:w-20' : 'flex flex-col'}>
                                <button
                                    type="button"
                                    onClick={() => openAchievement(key)}
                                    className="group flex w-full flex-col items-center gap-1.5 text-center focus:outline-none"
                                >
                                    <span className="relative">
                                        <span
                                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-105 ${
                                                isUnlocked
                                                    ? 'border-[#215AA8]/30 bg-[#215AA8]/10 text-[#215AA8]'
                                                    : 'border-border bg-secondary text-muted-foreground border-dashed group-hover:border-[#215AA8]/40 group-hover:text-[#215AA8]'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        {isNew && (
                                            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#EF5323] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                                                New
                                            </span>
                                        )}
                                    </span>
                                    <b className="text-[11px] leading-tight font-semibold">{label}</b>
                                    <span className="sr-only">
                                        {label}: {isUnlocked ? 'unlocked.' : 'not unlocked yet.'} {isNew ? 'New.' : ''}
                                    </span>
                                    <small
                                        className={`text-[10px] leading-tight ${isUnlocked ? 'font-semibold text-[#215AA8]' : 'text-muted-foreground'}`}
                                        aria-hidden="true"
                                    >
                                        {isUnlocked ? 'Unlocked' : 'Locked'}
                                    </small>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <p className="text-muted-foreground pt-4 text-[12px]">
                    {unlockedCount === ACHIEVEMENTS.length ? "You've unlocked every achievement." : 'Keep walking to unlock the rest.'}
                </p>
            </CardContent>

            <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedKey(null)}>
                <DialogContent className="text-center sm:max-w-sm">
                    {selected && (
                        <>
                            <DialogHeader className="items-center">
                                <span
                                    className={cn(
                                        'flex h-16 w-16 items-center justify-center rounded-full',
                                        selectedIsUnlocked ? 'bg-[#215AA8]/10 text-[#215AA8]' : 'bg-secondary text-muted-foreground',
                                    )}
                                >
                                    <selected.icon className="h-8 w-8" aria-hidden="true" />
                                </span>
                                <DialogTitle className="mt-3 text-xl">{selected.label}</DialogTitle>
                                <DialogDescription className="text-foreground text-base">{selected.description}</DialogDescription>
                            </DialogHeader>

                            <p className={cn('text-sm font-semibold', selectedIsUnlocked ? 'text-[#215AA8]' : 'text-muted-foreground')}>
                                {selectedIsUnlocked ? 'Unlocked' : 'Locked'}
                            </p>

                            <Button className="w-full bg-[#215AA8] hover:bg-[#252B69]" onClick={() => setSelectedKey(null)}>
                                Got it
                            </Button>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
