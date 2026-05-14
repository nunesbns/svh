<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->extractKey($request);

        if (! $key) {
            return response()->json(['error' => 'API Key required'], 401);
        }

        $prefix = substr($key, 0, 8);
        $apiKey = ApiKey::where('prefix', $prefix)->first();

        if (! $apiKey || ! password_verify($key, $apiKey->hash)) {
            return response()->json(['error' => 'Invalid API Key'], 401);
        }

        if ($apiKey->isRevoked()) {
            return response()->json(['error' => 'API Key revoked'], 401);
        }

        $apiKey->markUsed();

        $request->attributes->set('api_key_id', $apiKey->id);
        $request->attributes->set('api_key_name', $apiKey->name);
        $request->attributes->set('api_key_scope', $apiKey->scope);

        return $next($request);
    }

    private function extractKey(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        if ($request->hasHeader('X-API-Key')) {
            return $request->header('X-API-Key');
        }

        return null;
    }
}
