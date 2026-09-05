<?php

namespace App\Filament\Widgets;

use App\Models\CountryGoal;
use App\Models\User;
use App\Support\CountryFlags;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\HtmlString;

class StepCounterOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $countries = CountryGoal::query()->orderBy('id')->get();

        $stepsByCountry = User::query()
            ->with('formSubmission')
            ->withSum('stepEntries as steps_total', 'steps')
            ->get()
            ->groupBy(fn (User $user) => $user->formSubmission?->steps[1]['country'] ?? null)
            ->map(fn ($users) => (int) $users->sum('steps_total'));

        $regionalTotal = $countries->sum(fn (CountryGoal $country) => $stepsByCountry[$country->code] ?? 0);

        return [
            Stat::make('Regional total', number_format($regionalTotal))
                ->color('primary'),
            ...$countries->map(fn (CountryGoal $country) => Stat::make(
                new HtmlString(CountryFlags::labelHtml($country->code, $country->name)),
                number_format($stepsByCountry[$country->code] ?? 0),
            )
                ->description('Goal: '.number_format($country->goal_steps))
                ->color('info'))->all(),
        ];
    }
}
