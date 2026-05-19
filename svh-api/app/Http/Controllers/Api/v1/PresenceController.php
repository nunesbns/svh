<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\PresenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function __construct(
        private PresenceService $presenceService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cod_prj' => 'required|string',
            'cod_apl' => 'required|string',
            'scope' => 'required|string',
            'user_sc_login' => 'required|string',
        ]);

        $this->presenceService->heartbeat($validated);

        return response()->json(['status' => 'ok']);
    }

    public function conflicts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cod_prj' => 'required|string',
            'cod_apl' => 'required|string',
        ]);

        $users = $this->presenceService->getActiveUsers(
            $validated['cod_prj'],
            $validated['cod_apl']
        );

        return response()->json([
            'data' => $users
        ]);
    }
}
