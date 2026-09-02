<?php

namespace App\Support;

/**
 * Single source of truth for the onboarding form: its steps, fields, and the
 * validation rules each step's fields must satisfy. The step/field shape is
 * shared with the frontend as an Inertia prop, so a change here updates the
 * progress checklist, the wizard, and the review page together.
 */
class FormSteps
{
    /**
     * @return array<int, array{name: string, description: string, fields: list<array<string, mixed>>}>
     */
    protected static function definitions(): array
    {
        return [
            1 => [
                'name' => 'Basic info',
                'description' => 'Tell us who you are.',
                'fields' => [
                    ['name' => 'first_name', 'label' => 'First name', 'type' => 'text', 'placeholder' => 'Budi'],
                    ['name' => 'last_name', 'label' => 'Last name', 'type' => 'text', 'placeholder' => 'Santoso'],
                    ['name' => 'date_of_birth', 'label' => 'Date of birth', 'type' => 'date'],
                ],
            ],
            2 => [
                'name' => 'Contact',
                'description' => 'How we can reach you.',
                'fields' => [
                    ['name' => 'email_address', 'label' => 'Email address', 'type' => 'email', 'placeholder' => 'budi@example.com'],
                    ['name' => 'phone_number', 'label' => 'Phone number', 'type' => 'tel', 'placeholder' => '+62 812 3456 7890'],
                ],
            ],
            3 => [
                'name' => 'Address',
                'description' => 'Where you live.',
                'fields' => [
                    ['name' => 'street_address', 'label' => 'Street address', 'type' => 'text', 'placeholder' => 'Jl. Sudirman No. 45'],
                    ['name' => 'city', 'label' => 'City', 'type' => 'text', 'placeholder' => 'Jakarta'],
                    ['name' => 'postal_code', 'label' => 'Postal code', 'type' => 'text', 'placeholder' => '10220'],
                    ['name' => 'country', 'label' => 'Country', 'type' => 'text', 'placeholder' => 'Indonesia'],
                ],
            ],
            4 => [
                'name' => 'Preferences',
                'description' => 'A little more about you.',
                'fields' => [
                    ['name' => 'occupation', 'label' => 'Occupation', 'type' => 'text', 'placeholder' => 'Product designer'],
                    [
                        'name' => 'bio',
                        'label' => 'Short bio',
                        'type' => 'textarea',
                        'optional' => true,
                        'placeholder' => 'Optional. Up to 500 characters.',
                    ],
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
     * @return array{number: int, name: string, description: string, fields: list<array<string, mixed>>}|null
     */
    public static function find(int $step): ?array
    {
        $definition = self::definitions()[$step] ?? null;

        return $definition ? ['number' => $step, ...$definition] : null;
    }

    /**
     * @return list<array{number: int, name: string, description: string, fields: list<array<string, mixed>>}>
     */
    public static function all(): array
    {
        return array_map(
            fn (int $number) => self::find($number),
            array_keys(self::definitions()),
        );
    }

    /**
     * Validation rules for a step's fields, mirroring what the frontend
     * checks before it ever reaches here.
     *
     * @return array<string, string>
     */
    public static function rules(int $step): array
    {
        return match ($step) {
            1 => [
                'first_name' => ['required', 'string', 'max:100'],
                'last_name' => ['required', 'string', 'max:100'],
                'date_of_birth' => ['required', 'date', 'before:today'],
            ],
            2 => [
                'email_address' => ['required', 'email'],
                'phone_number' => ['required', 'string', 'max:20'],
            ],
            3 => [
                'street_address' => ['required', 'string', 'max:255'],
                'city' => ['required', 'string', 'max:255'],
                'postal_code' => ['required', 'string', 'max:20'],
                'country' => ['required', 'string', 'max:255'],
            ],
            4 => [
                'occupation' => ['required', 'string', 'max:255'],
                'bio' => ['nullable', 'string', 'max:500'],
            ],
            default => [],
        };
    }
}
