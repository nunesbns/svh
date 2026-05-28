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
            // cod_apl is mandatory for application-scoped types (events,
            // functions) and absent for libraries.
            'cod_apl' => 'nullable|string',
            'scope' => 'required|string',
            'type' => 'nullable|string|in:app_event,lib_file,function,project_lib,public_lib',
            'cursor' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $validated['limit'] ?? 20;
        $type = $validated['type'] ?? null;
        $isPublicLib = $type === 'public_lib';

        $scope = $validated['scope'];
        if ($type === 'function') {
            $scope = preg_replace('/\s*\(.*\)\s*$/', '', $scope);
        }

        $query = HistorySnapshot::query()
            ->where('scope', $scope)
            ->orderByDesc('captured_at');

        if ($type !== null) {
            $query->where('type', $type);
        }

        // Public libs are global: their history spans every project the
        // saving user has access to. All other types stay scoped to a
        // specific project (and, for application types, a specific cod_apl).
        if (! $isPublicLib) {
            if (! empty($validated['cod_apl'])) {
                $query->whereHas('application', function ($q) use ($validated) {
                    $q->where('cod_prj', $validated['cod_prj'])
                      ->where('cod_apl', $validated['cod_apl']);
                });
            } else {
                // Library scoped to a project — match on project's cod_prj
                // directly because there is no application row.
                $query->whereHas('project', function ($q) use ($validated) {
                    $q->where('cod_prj', $validated['cod_prj']);
                });
            }
        }

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
