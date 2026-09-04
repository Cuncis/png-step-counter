import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Award, CalendarCheck, Flame, Footprints, Trophy, type LucideIcon } from 'lucide-react';

const ACHIEVEMENTS: { key: string; label: string; icon: LucideIcon }[] = [
    { key: 'first-1000', label: 'First 1,000', icon: Footprints },
    { key: 'five-thousand-day', label: '5,000 in a day', icon: Flame },
    { key: 'ten-thousand-day', label: '10,000 in a day', icon: Trophy },
    { key: 'seven-day-streak', label: '7-day streak', icon: CalendarCheck },
    { key: 'thirty-day-month', label: '30 days in a month', icon: Award },
];

export default function AchievementsPanel({ unlocked = [] }: { unlocked?: string[] }) {
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
                <ul className="flex justify-center gap-3 overflow-x-auto pb-1 sm:gap-4">
                    {ACHIEVEMENTS.map(({ key, label, icon: Icon }) => {
                        const isUnlocked = unlocked.includes(key);
                        return (
                            <li key={key} className="group flex w-16 flex-none flex-col items-center gap-1.5 text-center sm:w-20">
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
