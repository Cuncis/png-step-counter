<?php

namespace App\Support;

class Countries
{
    /**
     * Countries eligible for the health journey's country field, keyed by
     * alpha-2 code, alphabetical by name.
     *
     * @return array<string, string>
     */
    public static function all(): array
    {
        return [
            'ID' => 'Indonesia',
            'MY' => 'Malaysia',
            'PH' => 'Philippines',
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (string $code, string $name) => ['value' => $code, 'label' => $name],
            array_keys(self::all()),
            self::all(),
        );
    }
}
