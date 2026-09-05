<?php

namespace App\Filament\Resources\CountryGoals\Pages;

use App\Filament\Resources\CountryGoals\CountryGoalResource;
use Filament\Resources\Pages\ManageRecords;

class ManageCountryGoals extends ManageRecords
{
    protected static string $resource = CountryGoalResource::class;
}
