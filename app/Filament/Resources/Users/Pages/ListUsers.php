<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use App\Support\Countries;
use App\Support\CsvExport;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;
use Generator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export CSV')
                ->icon(Heroicon::OutlinedArrowDownTray)
                ->color('gray')
                ->action(fn (): StreamedResponse => CsvExport::download(
                    'users-'.now()->format('Y-m-d').'.csv',
                    ['Name', 'Email address', 'Country', 'Total steps', 'Days logged', 'Joined'],
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
        $query = ($this->getFilteredTableQuery() ?? UserResource::getEloquentQuery())
            ->with('formSubmission')
            ->withCount('stepEntries')
            ->withSum('stepEntries as steps_total', 'steps');

        foreach ($query->cursor() as $user) {
            /** @var User $user */
            $code = $user->formSubmission?->steps[1]['country'] ?? null;

            yield [
                $user->name,
                $user->email,
                $code ? (Countries::all()[$code] ?? $code) : '',
                (int) ($user->steps_total ?? 0),
                (int) $user->step_entries_count,
                $user->created_at->format('Y-m-d H:i:s'),
            ];
        }
    }
}
