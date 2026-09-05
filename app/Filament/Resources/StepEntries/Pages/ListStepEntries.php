<?php

namespace App\Filament\Resources\StepEntries\Pages;

use App\Filament\Resources\StepEntries\StepEntryResource;
use App\Models\StepEntry;
use App\Support\Countries;
use App\Support\CsvExport;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;
use Generator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListStepEntries extends ListRecords
{
    protected static string $resource = StepEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export CSV')
                ->icon(Heroicon::OutlinedArrowDownTray)
                ->color('gray')
                ->action(fn (): StreamedResponse => CsvExport::download(
                    'submissions-'.now()->format('Y-m-d').'.csv',
                    ['User', 'Email address', 'Country', 'Date', 'Steps', 'Logged at'],
                    $this->exportRows(),
                )),
            CreateAction::make(),
        ];
    }

    /**
     * @return Generator<int, list<string|int>>
     */
    protected function exportRows(): Generator
    {
        $query = ($this->getFilteredTableQuery() ?? StepEntryResource::getEloquentQuery())
            ->with('user.formSubmission');

        foreach ($query->cursor() as $entry) {
            /** @var StepEntry $entry */
            $code = $entry->user?->formSubmission?->steps[1]['country'] ?? null;

            yield [
                $entry->user?->name ?? '',
                $entry->user?->email ?? '',
                $code ? (Countries::all()[$code] ?? $code) : '',
                $entry->date->format('Y-m-d'),
                $entry->steps,
                $entry->created_at->format('Y-m-d H:i:s'),
            ];
        }
    }
}
