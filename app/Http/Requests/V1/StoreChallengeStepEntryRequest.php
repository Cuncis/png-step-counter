<?php

namespace App\Http\Requests\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChallengeStepEntryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'challenge_country_id' => ['required', 'integer', 'exists:challenge_countries,id'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'steps' => ['required', 'integer', 'min:1', 'max:100000'],
            'participant_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}
