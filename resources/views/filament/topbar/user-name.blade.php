@php
    $user = filament()->auth()->user();
@endphp

@if ($user)
    <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1.25; margin-right: 0.5rem;">
        <span style="font-size: 0.875rem; font-weight: 500;">{{ $user->name }}</span>
        <span style="font-size: 0.75rem; color: #6b7280;">{{ $user->email }}</span>
    </div>
@endif
