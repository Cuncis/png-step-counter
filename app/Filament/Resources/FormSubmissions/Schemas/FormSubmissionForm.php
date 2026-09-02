<?php

namespace App\Filament\Resources\FormSubmissions\Schemas;

use App\Support\FormSteps;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FormSubmissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('current_step')
                    ->required()
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(FormSteps::totalSteps()),
                Toggle::make('is_complete'),
            ]);
    }
}
