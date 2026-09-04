<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['challenge_country_id', 'date', 'participant_name', 'steps'])]
class ChallengeStepEntry extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'steps' => 'integer',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(ChallengeCountry::class, 'challenge_country_id');
    }
}
