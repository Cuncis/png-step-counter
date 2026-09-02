<?php

namespace App\Filament\Resources\FormSubmissions\Schemas;

use App\Models\FormSubmission;
use App\Support\FormSteps;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FormSubmissionInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Overview')
                    ->columns(3)
                    ->components([
                        TextEntry::make('user.name')
                            ->label('User'),
                        TextEntry::make('current_step')
                            ->label('Step')
                            ->state(fn (FormSubmission $record) => "{$record->current_step} of ".FormSteps::totalSteps()),
                        IconEntry::make('is_complete')
                            ->boolean(),
                    ]),
                ...collect(FormSteps::all())->map(
                    fn (array $step) => Section::make($step['name'])
                        ->columns(2)
                        ->components(
                            collect($step['fields'])
                                ->map(fn (array $field) => TextEntry::make("steps.{$step['number']}.{$field['name']}")
                                    ->label($field['label'])
                                    ->state(fn (FormSubmission $record) => FormSteps::formatValue(
                                        $field,
                                        $record->steps[$step['number']] ?? [],
                                    )))
                                ->all(),
                        ),
                )->all(),
            ]);
    }
}
