import { useEffect, useState } from 'react';

const SIZE = 128;
const RADIUS = 57.5;

export default function GoalDonut({ percent, completed, goal }: { percent: number; completed: number; goal: number }) {
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setAnimatedPercent(percent));
        return () => cancelAnimationFrame(frame);
    }, [percent]);

    const circumference = 2 * Math.PI * RADIUS;
    const dashOffset = circumference * (1 - animatedPercent / 100);

    return (
        <div className="relative mx-auto shrink-0 sm:mx-0" style={{ width: SIZE, height: SIZE }}>
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`${percent}% of this week's goal: ${completed} of ${goal} steps`}
                className="drop-shadow-[0_4px_16px_rgba(33,90,168,0.1)]"
            >
                <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--secondary)" strokeWidth={13} />
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="#00B0C7"
                    strokeWidth={13}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <strong className="text-[22px] font-bold tabular-nums">{percent}%</strong>
                <small className="text-muted-foreground text-[11px] tabular-nums">
                    {completed.toLocaleString()}
                    <br />/ {goal.toLocaleString()}
                </small>
            </div>
        </div>
    );
}
