<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminsFromApp
{
    /**
     * Admins manage the platform from the Filament panel only; keep them out
     * of the participant-facing app (homepage, journey, step logging).
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->is_admin) {
            // Inertia::location() forces a real browser navigation, since a
            // normal redirect would have Inertia's client router fetch the
            // non-Inertia admin panel via XHR instead of visiting it.
            return Inertia::location(url('/admin'));
        }

        return $next($request);
    }
}
