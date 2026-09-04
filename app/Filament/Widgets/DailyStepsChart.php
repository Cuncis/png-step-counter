<?php

namespace App\Filament\Widgets;

use App\Models\StepEntry;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class DailyStepsChart extends ChartWidget
{
    protected ?string $heading = 'Total steps logged, last 30 days';

    protected int|string|array $columnSpan = 'full';

    protected ?string $maxHeight = '260px';

    protected function getData(): array
    {
        $start = today()->subDays(29);

        $totalsByDate = StepEntry::query()
            ->whereDate('date', '>=', $start)
            ->selectRaw('date(date) as day, sum(steps) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $dates = collect(range(0, 29))->map(fn (int $offset) => $start->copy()->addDays($offset));

        return [
            'datasets' => [
                [
                    'label' => 'Steps',
                    'data' => $dates->map(fn (Carbon $date) => (int) ($totalsByDate[$date->toDateString()] ?? 0))->all(),
                    'borderColor' => '#215AA8',
                    'backgroundColor' => '#215AA8',
                ],
            ],
            'labels' => $dates->map(fn (Carbon $date) => $date->format('M j'))->all(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
