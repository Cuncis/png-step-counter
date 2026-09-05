<?php

namespace App\Filament\Resources\Users\Tables;

use App\Models\User;
use App\Support\Countries;
use App\Support\CountryFlags;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with('formSubmission'))
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                ImageColumn::make('country')
                    ->label('Country')
                    ->state(fn (User $record) => CountryFlags::dataUri($record->formSubmission?->steps[1]['country'] ?? null))
                    ->alt(fn (User $record) => Countries::all()[$record->formSubmission?->steps[1]['country'] ?? ''] ?? 'Unknown')
                    ->imageHeight(20)
                    ->imageWidth(30)
                    ->placeholder('—'),
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
