import { polarPoint } from '@/lib/polar';
import { useEffect, useState } from 'react';

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2 + 8;
const RADIUS = 120;
const TICK_COUNT = 32;

function semicirclePath(cx: number, cy: number, r: number) {
    const start = polarPoint(cx, cy, r, 180);
    const end = polarPoint(cx, cy, r, 360);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

function valueTextSizeClass(formattedValue: string): string {
    if (formattedValue.length >= 9) return 'text-xl sm:text-2xl';
    if (formattedValue.length >= 7) return 'text-2xl sm:text-3xl';
    if (formattedValue.length >= 6) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
}

export default function StepGauge({ value, goal, label = 'Today' }: { value: number; goal: number; label?: string }) {
    const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setAnimatedPercent(percent));
        return () => cancelAnimationFrame(frame);
    }, [percent]);

    const trackPath = semicirclePath(CX, CY, RADIUS);
    const circumference = Math.PI * RADIUS;
    const dashOffset = circumference * (1 - animatedPercent / 100);

    const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = 180 + (180 / (TICK_COUNT - 1)) * i;
        const inner = polarPoint(CX, CY, RADIUS - 20, angle);
        const outer = polarPoint(CX, CY, RADIUS - 9, angle);
        return { key: i, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
    });

    return (
        <div className="relative mx-auto w-full max-w-[360px]" style={{ aspectRatio: `${SIZE} / ${CY + 10}` }}>
            <svg
                viewBox={`0 0 ${SIZE} ${CY + 10}`}
                role="img"
                aria-label={`${value.toLocaleString()} steps, ${percent}% of a ${goal.toLocaleString()} step goal`}
                className="h-full w-full drop-shadow-[0_4px_16px_rgba(33,90,168,0.12)]"
            >
                {ticks.map((tick) => (
                    <line
                        key={tick.key}
                        x1={tick.x1}
                        y1={tick.y1}
                        x2={tick.x2}
                        y2={tick.y2}
                        stroke="var(--border)"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                ))}
                <path d={trackPath} fill="none" stroke="var(--secondary)" strokeWidth={14} strokeLinecap="round" />
                <path
                    d={trackPath}
                    fill="none"
                    stroke="#215AA8"
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
                />
            </svg>
            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center px-4 text-center">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{label}</span>
                <strong className={`font-bold tabular-nums ${valueTextSizeClass(value.toLocaleString())}`}>{value.toLocaleString()}</strong>
                <span className="text-muted-foreground text-xs">of {goal.toLocaleString()} steps</span>
            </div>
        </div>
    );
}
