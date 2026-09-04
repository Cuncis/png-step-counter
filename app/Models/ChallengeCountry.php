<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code', 'flag_emoji', 'goal_steps'])]
class ChallengeCountry extends Model
{
    protected function casts(): array
    {
        return [
            'goal_steps' => 'integer',
        ];
    }

    public function stepEntries(): HasMany
    {
        return $this->hasMany(ChallengeStepEntry::class);
    }

    public function totalSteps(): int
    {
        return (int) $this->stepEntries()->sum('steps');
    }

    public function progressPercent(): int
    {
        if ($this->goal_steps <= 0) {
            return 0;
        }

        return min(100, (int) round(($this->totalSteps() / $this->goal_steps) * 100));
    }
}
