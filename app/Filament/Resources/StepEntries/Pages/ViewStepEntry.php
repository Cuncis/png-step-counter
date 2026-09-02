<?php

namespace App\Filament\Resources\StepEntries\Pages;

use App\Filament\Resources\StepEntries\StepEntryResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStepEntry extends ViewRecord
{
    protected static string $resource = StepEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
