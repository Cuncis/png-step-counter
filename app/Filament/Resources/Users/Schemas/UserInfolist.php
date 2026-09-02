<?php

namespace App\Filament\Resources\Users\Schemas;

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
                        IconEntry::make('is_admin')
                            ->label('Admin access')
                            ->boolean(),
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
                            ->state(fn ($record) => (bool) $record->formSubmission?->is_complete),
                        TextEntry::make('journey_step')
                            ->label('Current step')
                            ->state(fn ($record) => $record->formSubmission
                                ? $record->formSubmission->current_step.' of '.FormSteps::totalSteps()
                                : 'Not started'),
                    ]),
            ]);
    }
}
