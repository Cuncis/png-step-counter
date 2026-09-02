<?php

namespace App\Filament\Resources\StepEntries\Pages;

use App\Filament\Resources\StepEntries\StepEntryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStepEntries extends ListRecords
{
    protected static string $resource = StepEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
