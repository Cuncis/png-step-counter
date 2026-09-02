<?php

namespace App\Filament\Resources\StepEntries\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StepEntryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                DatePicker::make('date')
                    ->required(),
                TextInput::make('steps')
                    ->required()
                    ->numeric()
                    ->minValue(0),
                FileUpload::make('evidence_path')
                    ->label('Evidence')
                    ->disk('public')
                    ->directory('step-evidence')
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/heic', 'application/pdf'])
                    ->required(),
            ]);
    }
}
