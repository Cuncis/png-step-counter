<?php

namespace App\Support;

use Exception;
use Illuminate\Support\Carbon;

/**
 * Single source of truth for the post-registration health journey: its
 * steps, fields, and the validation rules each step's fields must satisfy.
 * The step/field shape is shared with the frontend as an Inertia prop, so a
 * change here updates the wizard and the review page together.
 */
class FormSteps
{
    private const OCCUPATIONS = [
        ['value' => 'student', 'label' => 'Student'],
        ['value' => 'office', 'label' => 'Office / desk job'],
        ['value' => 'healthcare', 'label' => 'Healthcare worker'],
        ['value' => 'education', 'label' => 'Educator / teacher'],
        ['value' => 'retail_service', 'label' => 'Retail / service'],
        ['value' => 'trades', 'label' => 'Trades / manual labor'],
        ['value' => 'delivery_logistics', 'label' => 'Delivery / logistics'],
        ['value' => 'homemaker', 'label' => 'Homemaker'],
        ['value' => 'retired', 'label' => 'Retired'],
        ['value' => 'unemployed', 'label' => 'Not currently working'],
        ['value' => 'other', 'label' => 'Other'],
    ];

    private const ACTIVITY_LEVELS = [
        ['value' => 'sedentary', 'label' => 'Sedentary (desk job, little exercise)'],
        ['value' => 'light', 'label' => 'Lightly active (1-3 days a week)'],
        ['value' => 'moderate', 'label' => 'Moderately active (3-5 days a week)'],
        ['value' => 'very_active', 'label' => 'Very active (6-7 days a week)'],
    ];

    private const GENDERS = [
        ['value' => 'female', 'label' => 'Female'],
        ['value' => 'male', 'label' => 'Male'],
        ['value' => 'non_binary', 'label' => 'Non-binary'],
        ['value' => 'prefer_not_to_say', 'label' => 'Prefer not to say'],
    ];

    /**
     * @return array<int, array{name: string, description: string, icon: string, fields: list<array<string, mixed>>}>
     */
    protected static function definitions(): array
    {
        return [
            1 => [
                'name' => 'About you',
                'description' => 'The basics we use to personalize your goals.',
                'icon' => 'CalendarHeart',
                'fields' => [
                    ['name' => 'date_of_birth', 'label' => 'Date of birth', 'type' => 'date'],
                    ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'optional' => true, 'options' => self::GENDERS],
                    ['name' => 'country', 'label' => 'Country', 'type' => 'select', 'options' => Countries::options()],
                ],
            ],
            2 => [
                'name' => 'Body basics',
                'description' => 'Helps us estimate distance and calories more accurately.',
                'icon' => 'Ruler',
                'fields' => [
                    ['name' => 'height_cm', 'label' => 'Height', 'type' => 'number', 'suffix' => 'cm', 'placeholder' => '170'],
                    ['name' => 'weight_kg', 'label' => 'Weight', 'type' => 'number', 'suffix' => 'kg', 'placeholder' => '65'],
                ],
            ],
            3 => [
                'name' => 'Lifestyle',
                'description' => 'A little more, so your goals fit your day.',
                'icon' => 'Briefcase',
                'fields' => [
                    [
                        'name' => 'occupation',
                        'label' => 'Occupation',
                        'type' => 'select',
                        'options' => self::OCCUPATIONS,
                        'allowOther' => true,
                    ],
                    ['name' => 'activity_level', 'label' => 'Activity level', 'type' => 'select', 'options' => self::ACTIVITY_LEVELS],
                ],
            ],
        ];
    }

    public static function totalSteps(): int
    {
        return count(self::definitions());
    }

    public static function clamp(int $step): int
    {
        return max(1, min($step, self::totalSteps()));
    }

    /**
     * @return array{number: int, name: string, description: string, icon: string, fields: list<array<string, mixed>>}|null
     */
    public static function find(int $step): ?array
    {
        $definition = self::definitions()[$step] ?? null;

        return $definition ? ['number' => $step, ...$definition] : null;
    }

    /**
     * @return list<array{number: int, name: string, description: string, icon: string, fields: list<array<string, mixed>>}>
     */
    public static function all(): array
    {
        return array_map(
            fn (int $number) => self::find($number),
            array_keys(self::definitions()),
        );
    }

    /**
     * Formats a single saved answer for display, mirroring the frontend's
     * `formatFormFieldValue` so the admin panel reads the same as the app.
     *
     * @param  array<string, mixed>  $field
     * @param  array<string, string>  $data
     */
    public static function formatValue(array $field, array $data): string
    {
        $value = $data[$field['name']] ?? null;

        if ($value === null || trim($value) === '') {
            return 'Not answered';
        }

        if ($field['type'] === 'date') {
            try {
                return Carbon::parse($value)->format('F j, Y');
            } catch (Exception) {
                return $value;
            }
        }

        if ($field['type'] === 'select') {
            if (($field['allowOther'] ?? false) && $value === 'other') {
                $other = $data["{$field['name']}_other"] ?? null;

                return $other && trim($other) !== '' ? $other : 'Other';
            }

            $option = collect($field['options'] ?? [])->firstWhere('value', $value);

            return $option['label'] ?? $value;
        }

        if ($field['type'] === 'number') {
            return isset($field['suffix']) ? "{$value} {$field['suffix']}" : $value;
        }

        return $value;
    }

    /**
     * Validation rules for a step's fields, mirroring what the frontend
     * checks before it ever reaches here.
     *
     * @return array<string, array<int, string>>
     */
    public static function rules(int $step): array
    {
        return match ($step) {
            1 => [
                'date_of_birth' => ['required', 'date', 'before_or_equal:2010-12-31', 'after:1900-01-01'],
                'gender' => ['nullable', 'in:'.implode(',', array_column(self::GENDERS, 'value'))],
                'country' => ['required', 'in:'.implode(',', array_column(Countries::options(), 'value'))],
            ],
            2 => [
                'height_cm' => ['required', 'numeric', 'min:50', 'max:250'],
                'weight_kg' => ['required', 'numeric', 'min:20', 'max:300'],
            ],
            3 => [
                'occupation' => ['required', 'in:'.implode(',', array_column(self::OCCUPATIONS, 'value'))],
                'occupation_other' => ['nullable', 'required_if:occupation,other', 'string', 'max:100'],
                'activity_level' => ['required', 'in:'.implode(',', array_column(self::ACTIVITY_LEVELS, 'value'))],
            ],
            default => [],
        };
    }
}
