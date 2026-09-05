import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export const ACHIEVEMENTS: { key: string; label: string; icon: LucideIcon }[] = [
    { key: 'first-1000', label: 'First 1,000', icon: Footprints },
    { key: 'five-thousand-day', label: '5,000 in a day', icon: Flame },
    { key: 'ten-thousand-day', label: '10,000 in a day', icon: Trophy },
    { key: 'fifteen-thousand-day', label: '15,000 in a day', icon: Rocket },
    { key: 'twenty-thousand-day', label: '20,000 in a day', icon: Crown },
    { key: 'three-day-streak', label: '3-day streak', icon: CalendarCheck },
    { key: 'seven-day-streak', label: '7-day streak', icon: CalendarDays },
    { key: 'fourteen-day-streak', label: '14-day streak', icon: CalendarRange },
    { key: 'thirty-day-streak', label: '30-day streak', icon: CalendarClock },
    { key: 'hundred-day-streak', label: '100-day streak', icon: Medal },
    { key: 'total-50k', label: '50,000 lifetime steps', icon: Star },
    { key: 'total-100k', label: '100,000 lifetime steps', icon: Sparkles },
    { key: 'total-500k', label: '500,000 lifetime steps', icon: Gem },
    { key: 'total-1m', label: '1,000,000 lifetime steps', icon: Diamond },
    { key: 'total-5m', label: '5,000,000 lifetime steps', icon: Mountain },
    { key: 'thirty-day-month', label: '30 days in a month', icon: Award },
    { key: 'first-week-logged', label: '7 days logged', icon: BadgeCheck },
    { key: 'hundred-days-logged', label: '100 days logged', icon: ShieldCheck },
    { key: 'weekend-warrior', label: 'Weekend warrior', icon: Sun },
    { key: 'early-bird', label: 'Early bird', icon: Sunrise },
];

export default function AchievementsPanel({ unlocked = [], layout = 'grid' }: { unlocked?: string[]; layout?: 'grid' | 'horizontal' }) {
    const unlockedCount = ACHIEVEMENTS.filter((achievement) => unlocked.includes(achievement.key)).length;

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
                        return (
                            <li
                                key={key}
                                className={
                                    layout === 'horizontal'
                                        ? 'group flex w-16 flex-none flex-col items-center gap-1.5 text-center sm:w-20'
                                        : 'group flex flex-col items-center gap-1.5 text-center'
                                }
                            >
                                <span
                                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-105 ${
                                        isUnlocked
                                            ? 'border-[#215AA8]/30 bg-[#215AA8]/10 text-[#215AA8]'
                                            : 'border-border bg-secondary text-muted-foreground border-dashed group-hover:border-[#215AA8]/40 group-hover:text-[#215AA8]'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <b className="text-[11px] leading-tight font-semibold">{label}</b>
                                <span className="sr-only">
                                    {label}: {isUnlocked ? 'unlocked.' : 'not unlocked yet.'}
                                </span>
                                <small
                                    className={`text-[10px] leading-tight ${isUnlocked ? 'font-semibold text-[#215AA8]' : 'text-muted-foreground'}`}
                                    aria-hidden="true"
                                >
                                    {isUnlocked ? 'Unlocked' : 'Locked'}
                                </small>
                            </li>
                        );
                    })}
                </ul>
                <p className="text-muted-foreground pt-4 text-[12px]">
                    {unlockedCount === ACHIEVEMENTS.length ? "You've unlocked every achievement." : 'Keep walking to unlock the rest.'}
                </p>
            </CardContent>
        </Card>
    );
}
