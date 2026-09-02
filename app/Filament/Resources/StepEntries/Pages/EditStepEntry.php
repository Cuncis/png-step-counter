<?php

namespace App\Filament\Resources\StepEntries\Pages;

use App\Filament\Resources\StepEntries\StepEntryResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditStepEntry extends EditRecord
{
    protected static string $resource = StepEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
