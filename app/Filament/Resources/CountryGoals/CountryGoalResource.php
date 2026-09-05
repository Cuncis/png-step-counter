<?php

namespace App\Filament\Resources\CountryGoals;

use App\Filament\Resources\CountryGoals\Pages\ManageCountryGoals;
use App\Models\CountryGoal;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CountryGoalResource extends Resource
{
    protected static ?string $model = CountryGoal::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedFlag;

    protected static ?string $navigationLabel = 'Country Goals';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('goal_steps')
                    ->label('Target goal (steps)')
                    ->numeric()
                    ->minValue(1)
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Country'),
                TextColumn::make('code'),
                TextColumn::make('goal_steps')
                    ->label('Target goal (steps)')
                    ->numeric()
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageCountryGoals::route('/'),
        ];
    }
}
