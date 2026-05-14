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
}
