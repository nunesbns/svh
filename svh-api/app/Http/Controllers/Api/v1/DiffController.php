<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\DiffService;
use Illuminate\Http\JsonResponse;

class DiffController extends Controller
{
    public function __construct(
        private DiffService $diffService
    ) {}

    public function show(string $a, string $b): JsonResponse
    {
        $diff = $this->diffService->compute($a, $b);

        return response()->json($diff);
    }

    public function raw(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'snapshot_id' => 'required|uuid',
            'content' => 'present|string|nullable',
        ]);

        $diff = $this->diffService->computeRaw(
            $validated['snapshot_id'],
            $validated['content'] ?? '',
        );

        return response()->json($diff);
    }
}
