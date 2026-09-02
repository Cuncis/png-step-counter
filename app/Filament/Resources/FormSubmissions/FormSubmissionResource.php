<?php

namespace App\Filament\Resources\FormSubmissions;

use App\Filament\Resources\FormSubmissions\Pages\EditFormSubmission;
use App\Filament\Resources\FormSubmissions\Pages\ListFormSubmissions;
use App\Filament\Resources\FormSubmissions\Pages\ViewFormSubmission;
use App\Filament\Resources\FormSubmissions\Schemas\FormSubmissionForm;
use App\Filament\Resources\FormSubmissions\Schemas\FormSubmissionInfolist;
use App\Filament\Resources\FormSubmissions\Tables\FormSubmissionsTable;
use App\Models\FormSubmission;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FormSubmissionResource extends Resource
{
    protected static ?string $model = FormSubmission::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentCheck;

    protected static ?string $navigationLabel = 'Health journeys';

    public static function form(Schema $schema): Schema
    {
        return FormSubmissionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return FormSubmissionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FormSubmissionsTable::configure($table);
    }

    public static function canCreate(): bool
    {
        return false;
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
            'index' => ListFormSubmissions::route('/'),
            'view' => ViewFormSubmission::route('/{record}'),
            'edit' => EditFormSubmission::route('/{record}/edit'),
        ];
    }
}
