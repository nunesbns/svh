<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiErrorLoggerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log errors (non-200 and non-202 status codes)
        if (! in_array($response->getStatusCode(), [200, 201, 202])) {
            Log::build([
                'driver' => 'single',
                'path' => storage_path('logs/api-errors.log'),
            ])->warning('API Request Failed', [
                'status' => $response->getStatusCode(),
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'request_payload' => $request->all(),
                'response_body' => json_decode($response->getContent(), true) ?: $response->getContent(),
            ]);
        }

        return $response;
    }
}
