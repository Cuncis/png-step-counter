<?php

namespace App\Filament\Resources\FormSubmissions\Tables;

use App\Models\FormSubmission;
use App\Support\FormSteps;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class FormSubmissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->searchable(),
                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),
                TextColumn::make('current_step')
                    ->label('Step')
                    ->state(fn (FormSubmission $record) => "{$record->current_step} of ".FormSteps::totalSteps())
                    ->sortable(),
                IconColumn::make('is_complete')
                    ->boolean()
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->label('Last updated')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_complete'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ]);
    }
}
