<?php

namespace App\Filament\Resources\StepEntries\Schemas;

use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class StepEntryInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('user.name')
                    ->label('User'),
                TextEntry::make('date')
                    ->date(),
                TextEntry::make('steps')
                    ->numeric(),
                ImageEntry::make('evidence_path')
                    ->label('Evidence')
                    ->disk('public')
                    ->height(320),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
