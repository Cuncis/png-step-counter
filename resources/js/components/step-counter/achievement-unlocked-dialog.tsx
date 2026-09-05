import { ACHIEVEMENTS } from '@/components/step-counter/achievements-panel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Celebrates newly unlocked achievements one at a time, queued so a single
 * submission that crosses several thresholds at once doesn't overlap dialogs.
 */
export default function AchievementUnlockedDialog({ keys }: { keys: string[] }) {
    const [queue, setQueue] = useState<string[]>([]);

    useEffect(() => {
        if (keys.length > 0) {
            setQueue(keys);
        }
        // Only pick up a fresh batch of keys, not on every re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.join(',')]);

    const currentKey = queue[0];
    const achievement = ACHIEVEMENTS.find((item) => item.key === currentKey);

    if (!achievement) {
        return null;
    }

    const Icon = achievement.icon;
    const dismiss = () => setQueue((prev) => prev.slice(1));

    return (
        <Dialog open onOpenChange={(open) => !open && dismiss()}>
            <DialogContent className="text-center sm:max-w-sm">
                <DialogHeader className="items-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#215AA8]/10 text-[#215AA8]">
                        <Icon className="h-8 w-8" aria-hidden="true" />
                    </span>
                    <DialogTitle className="mt-3 flex items-center justify-center gap-2 text-xl">
                        <PartyPopper className="h-5 w-5 text-[#EF5323]" aria-hidden="true" />
                        Achievement Unlocked!
                    </DialogTitle>
                    <DialogDescription className="text-foreground text-base font-semibold">{achievement.label}</DialogDescription>
                </DialogHeader>

                <Button className="w-full bg-[#215AA8] hover:bg-[#252B69]" onClick={dismiss}>
                    Nice!
                </Button>
            </DialogContent>
        </Dialog>
    );
}
