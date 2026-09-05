<?php

namespace App\Filament\Resources\StepEntries;

use App\Filament\Resources\StepEntries\Pages\CreateStepEntry;
use App\Filament\Resources\StepEntries\Pages\EditStepEntry;
use App\Filament\Resources\StepEntries\Pages\ListStepEntries;
use App\Filament\Resources\StepEntries\Pages\ViewStepEntry;
use App\Filament\Resources\StepEntries\Schemas\StepEntryForm;
use App\Filament\Resources\StepEntries\Schemas\StepEntryInfolist;
use App\Filament\Resources\StepEntries\Tables\StepEntriesTable;
use App\Models\StepEntry;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StepEntryResource extends Resource
{
    protected static ?string $model = StepEntry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?string $navigationLabel = 'All Submissions';

    protected static ?string $modelLabel = 'submission';

    protected static ?string $pluralModelLabel = 'All Submissions';

    public static function form(Schema $schema): Schema
    {
        return StepEntryForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return StepEntryInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StepEntriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStepEntries::route('/'),
            'create' => CreateStepEntry::route('/create'),
            'view' => ViewStepEntry::route('/{record}'),
            'edit' => EditStepEntry::route('/{record}/edit'),
        ];
    }
}
