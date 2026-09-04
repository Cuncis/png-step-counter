export interface ChallengeCountrySummary {
    id: number;
    name: string;
    code: string;
    flag_emoji: string;
    goal_steps: number;
    total_steps: number;
    progress_percent: number;
    rank: number;
}

export interface ChallengeActivityEntry {
    id: number;
    date: string;
    participant_name: string | null;
    steps: number;
    country: { name: string; code: string; flag_emoji: string };
}

export interface ChallengeRegionalSummary {
    total_steps: number;
    goal_steps: number;
    progress_percent: number;
    remaining_steps: number;
    participants: number;
    days_remaining: number;
    is_complete: boolean;
}

export type ChallengeSortField = 'date' | 'country' | 'steps';
export type ChallengeSortDirection = 'asc' | 'desc';
