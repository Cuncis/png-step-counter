<?php

namespace App\Filament\Resources\Users\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StepEntriesRelationManager extends RelationManager
{
    protected static string $relationship = 'stepEntries';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
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

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('date')
            ->defaultSort('date', 'desc')
            ->columns([
                ImageColumn::make('evidence_path')
                    ->label('Evidence')
                    ->disk('public')
                    ->square(),
                TextColumn::make('date')
                    ->date()
                    ->sortable(),
                TextColumn::make('steps')
                    ->numeric()
                    ->sortable(),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
