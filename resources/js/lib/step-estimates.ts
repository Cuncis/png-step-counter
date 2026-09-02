// Rough, commonly-used approximations: ~0.7m per step, ~0.04 kcal per step.
export function estimateDistanceKm(steps: number): number {
    return Math.round(steps * 0.0007 * 10) / 10;
}

export function estimateCalories(steps: number): number {
    return Math.round(steps * 0.04);
}
