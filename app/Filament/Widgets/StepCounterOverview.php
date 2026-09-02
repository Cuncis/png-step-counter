<?php

namespace App\Filament\Widgets;

use App\Models\FormSubmission;
use App\Models\StepEntry;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StepCounterOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $totalUsers = User::count();
        $completedJourneys = FormSubmission::where('is_complete', true)->count();

        return [
            Stat::make('Total users', number_format($totalUsers))
                ->color('primary'),
            Stat::make('Journeys completed', number_format($completedJourneys))
                ->description($totalUsers > 0 ? round(($completedJourneys / $totalUsers) * 100).'% of users' : '0% of users')
                ->color('success'),
            Stat::make('Steps logged today', number_format(StepEntry::whereDate('date', today())->sum('steps')))
                ->color('info'),
            Stat::make('Total steps logged', number_format(StepEntry::sum('steps')))
                ->color('warning'),
        ];
    }
}
