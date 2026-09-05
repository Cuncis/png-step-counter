<?php

namespace App\Filament\Resources\StepEntries\Tables;

use App\Models\StepEntry;
use App\Support\Countries;
use App\Support\CountryFlags;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class StepEntriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('date', 'desc')
            ->modifyQueryUsing(fn (Builder $query) => $query->with('user.formSubmission'))
            ->columns([
                ImageColumn::make('evidence_path')
                    ->label('Evidence')
                    ->disk('public')
                    ->square(),
                TextColumn::make('user.name')
                    ->searchable(),
                ImageColumn::make('country')
                    ->label('Country')
                    ->state(fn (StepEntry $record) => CountryFlags::dataUri($record->user?->formSubmission?->steps[1]['country'] ?? null))
                    ->alt(fn (StepEntry $record) => Countries::all()[$record->user?->formSubmission?->steps[1]['country'] ?? ''] ?? 'Unknown')
                    ->imageHeight(20)
                    ->imageWidth(30)
                    ->placeholder('—'),
                TextColumn::make('date')
                    ->date()
                    ->sortable(),
                TextColumn::make('steps')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Logged')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('user_id')
                    ->label('User')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('country')
                    ->label('Country')
                    ->options(Countries::all())
                    ->query(fn (Builder $query, array $data): Builder => $query->when(
                        $data['value'] ?? null,
                        fn (Builder $q, string $country) => $q->whereHas(
                            'user.formSubmission',
                            fn (Builder $q2) => $q2->where('steps->1->country', $country),
                        ),
                    )),
                Filter::make('date')
                    ->schema([
                        DatePicker::make('from'),
                        DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn (Builder $q, $date) => $q->whereDate('date', '>=', $date))
                            ->when($data['until'] ?? null, fn (Builder $q, $date) => $q->whereDate('date', '<=', $date));
                    }),
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
