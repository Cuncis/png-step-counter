export interface CountryStanding {
    id: number;
    name: string;
    code: string;
    flag_emoji: string;
    goal_steps: number;
    total_steps: number;
    progress_percent: number;
    rank: number;
}

export interface CountryActivityEntry {
    id: number;
    date: string;
    participant_name: string | null;
    steps: number;
    country: { name: string; code: string; flag_emoji: string };
}

export interface RegionalStandingSummary {
    total_steps: number;
    goal_steps: number;
    progress_percent: number;
    remaining_steps: number;
    participants: number;
    is_complete: boolean;
}

export type ActivitySortField = 'date' | 'country' | 'steps';
export type ActivitySortDirection = 'asc' | 'desc';
