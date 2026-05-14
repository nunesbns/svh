<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\HistorySnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cod_prj' => 'required|string',
            'cod_apl' => 'required|string',
            'scope' => 'required|string',
            'cursor' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $validated['limit'] ?? 20;

        $query = HistorySnapshot::query()
            ->whereHas('application', function ($q) use ($validated) {
                $q->where('cod_prj', $validated['cod_prj'])
                  ->where('cod_apl', $validated['cod_apl']);
            })
            ->where('scope', $validated['scope'])
            ->orderByDesc('captured_at');

        if ($validated['cursor'] ?? false) {
            $query->where('captured_at', '<', $validated['cursor']);
        }

        $items = $query->limit($limit)->get([
            'id',
            'scope',
            'type',
            'user_sc_login',
            'captured_at',
            'metadata',
        ]);

        return response()->json([
            'data' => $items,
            'next_cursor' => $items->last()?->captured_at,
        ]);
    }
}
