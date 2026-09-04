<?php

namespace Database\Seeders;

use App\Models\ChallengeCountry;
use App\Models\ChallengeStepEntry;
use App\Support\RegionalChallenge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Populates the v1 regional step challenge with realistic-looking sample
 * data so the dashboard isn't empty on first load.
 */
class ChallengeDemoSeeder extends Seeder
{
    /**
     * @var array<string, list<string>>
     */
    private const PARTICIPANT_NAMES = [
        'MY' => [
            'Aiman Hakim', 'Siti Nurhaliza', 'Wei Ling Tan', 'Kumar Raj', 'Farah Aina',
            'Hafiz Rahman', 'Mei Ling Chong', 'Azman Yusof', 'Nurul Izzah', 'Rajesh Kumar',
            'Amirah Zainal', 'Chong Wei', 'Fatimah Ali', 'Suresh Nair', 'Nabila Idris',
        ],
        'PH' => [
            'Juan Dela Cruz', 'Maria Santos', 'Jose Reyes', 'Anna Bautista', 'Mark Villanueva',
            'Grace Mendoza', 'Paolo Cruz', 'Liza Ramos', 'Ramon Torres', 'Cristina Aquino',
            'Ferdinand Garcia', 'Angeline Flores', 'Rico Domingo', 'Josephine Lim', 'Danilo Castro',
        ],
        'ID' => [
            'Budi Santoso', 'Dewi Lestari', 'Agus Setiawan', 'Sri Wahyuni', 'Andi Wijaya',
            'Rina Marlina', 'Eko Prasetyo', 'Wati Suryani', 'Joko Susilo', 'Ayu Kusuma',
            'Hendra Gunawan', 'Putri Ramadhani', 'Bambang Hartono', 'Nia Kurniasih', 'Yusuf Firmansyah',
        ],
    ];

    public function run(): void
    {
        $countries = [
            ['name' => 'Malaysia', 'code' => 'MY', 'flag_emoji' => '🇲🇾', 'goal_steps' => 3_333_333, 'target_total' => 2_145_800],
            ['name' => 'Philippines', 'code' => 'PH', 'flag_emoji' => '🇵🇭', 'goal_steps' => 3_333_333, 'target_total' => 2_850_450],
            ['name' => 'Indonesia', 'code' => 'ID', 'flag_emoji' => '🇮🇩', 'goal_steps' => 3_333_334, 'target_total' => 1_252_670],
        ];

        foreach ($countries as $data) {
            $country = ChallengeCountry::updateOrCreate(
                ['code' => $data['code']],
                ['name' => $data['name'], 'flag_emoji' => $data['flag_emoji'], 'goal_steps' => $data['goal_steps']],
            );

            $country->stepEntries()->delete();
            $this->seedEntriesForCountry($country, $data['target_total']);
        }
    }

    private function seedEntriesForCountry(ChallengeCountry $country, int $targetTotal): void
    {
        $names = self::PARTICIPANT_NAMES[$country->code];
        $entryCount = max(40, min(400, (int) round($targetTotal / 8_000)));

        $rawSteps = [];
        for ($i = 0; $i < $entryCount; $i++) {
            $rawSteps[] = random_int(4_000, 13_000);
        }

        $rawSum = array_sum($rawSteps);
        $scale = $targetTotal / $rawSum;

        $scaledSteps = array_map(
            fn (int $steps) => max(500, (int) round($steps * $scale)),
            $rawSteps,
        );

        $drift = $targetTotal - array_sum($scaledSteps);
        $scaledSteps[count($scaledSteps) - 1] = max(500, $scaledSteps[count($scaledSteps) - 1] + $drift);

        $days = RegionalChallenge::CHALLENGE_LENGTH_DAYS;
        $rows = [];

        foreach ($scaledSteps as $index => $steps) {
            $date = Carbon::today()->subDays($days - 1 - ($index % $days));

            $rows[] = [
                'challenge_country_id' => $country->id,
                'date' => $date->toDateString(),
                'participant_name' => $names[array_rand($names)],
                'steps' => $steps,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        ChallengeStepEntry::insert($rows);
    }
}
