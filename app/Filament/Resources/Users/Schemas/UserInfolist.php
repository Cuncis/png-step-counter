<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\User;
use App\Support\CountryFlags;
use App\Support\FormSteps;
use App\Support\StepStats;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UserInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->dense()
            ->components([
                Section::make('Account')
                    ->columns(2)
                    ->components([
                        TextEntry::make('name'),
                        TextEntry::make('email')
                            ->label('Email address'),
                        TextEntry::make('created_at')
                            ->label('Joined')
                            ->dateTime(),
                    ]),
                Section::make('Step counter activity')
                    ->columns(3)
                    ->components([
                        TextEntry::make('stepEntries_sum_steps')
                            ->label('Total steps logged')
                            ->state(fn ($record) => number_format($record->stepEntries->sum('steps'))),
                        TextEntry::make('stepEntries_count')
                            ->label('Days logged')
                            ->state(fn ($record) => $record->stepEntries->count()),
                        TextEntry::make('streak')
                            ->label('Current streak')
                            ->state(fn ($record) => StepStats::currentStreak($record->stepEntries).' days'),
                    ]),
                Section::make('Health journey')
                    ->columns(2)
                    ->components([
                        IconEntry::make('journey_complete')
                            ->label('Completed')
                            ->boolean()
                            ->state(fn (User $record) => (bool) $record->formSubmission?->is_complete),
                        TextEntry::make('journey_step')
                            ->label('Current step')
                            ->state(fn (User $record) => $record->formSubmission
                                ? $record->formSubmission->current_step.' of '.FormSteps::totalSteps()
                                : 'Not started'),
                    ]),
                ...collect(FormSteps::all())->map(
                    fn (array $step) => Section::make($step['name'])
                        ->columns(2)
                        ->components(
                            collect($step['fields'])
                                ->map(function (array $field) use ($step) {
                                    $entry = TextEntry::make("journey.{$step['number']}.{$field['name']}")
                                        ->label($field['label']);

                                    if ($field['name'] === 'country') {
                                        return $entry->html()->state(fn (User $record) => CountryFlags::labelHtml(
                                            $record->formSubmission?->steps[$step['number']][$field['name']] ?? null,
                                            FormSteps::formatValue($field, $record->formSubmission?->steps[$step['number']] ?? []),
                                        ));
                                    }

                                    return $entry->state(fn (User $record) => FormSteps::formatValue(
                                        $field,
                                        $record->formSubmission?->steps[$step['number']] ?? [],
                                    ));
                                })
                                ->all(),
                        ),
                )->all(),
            ]);
    }
}
