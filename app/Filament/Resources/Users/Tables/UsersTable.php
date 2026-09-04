<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                IconColumn::make('formSubmission.is_complete')
                    ->label('Journey complete')
                    ->boolean(),
                TextColumn::make('step_entries_sum_steps')
                    ->label('Total steps')
                    ->numeric()
                    ->sortable()
                    ->sum('stepEntries', 'steps'),
                TextColumn::make('step_entries_count')
                    ->label('Days logged')
                    ->counts('stepEntries')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Joined')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('journey_complete')
                    ->label('Journey complete')
                    ->queries(
                        true: fn ($query) => $query->whereHas('formSubmission', fn ($q) => $q->where('is_complete', true)),
                        false: fn ($query) => $query->whereDoesntHave('formSubmission', fn ($q) => $q->where('is_complete', true)),
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
