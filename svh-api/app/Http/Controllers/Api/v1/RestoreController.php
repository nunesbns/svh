<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HistorySnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestoreController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'snapshot_id' => 'required|string|uuid',
        ]);

        $snapshot = HistorySnapshot::findOrFail($validated['snapshot_id']);

        AuditLog::create([
            'action' => 'restore.requested',
            'actor' => $request->attributes->get('api_key_name', 'unknown'),
            'target' => $snapshot->id,
            'metadata' => [
                'project_id' => $snapshot->project_id,
                'application_id' => $snapshot->application_id,
            ],
        ]);

        return response()->json([
            'content' => $snapshot->content_blob,
            'snapshot' => [
                'id' => $snapshot->id,
                'scope' => $snapshot->scope,
                'type' => $snapshot->type,
                'user_sc_login' => $snapshot->user_sc_login,
                'captured_at' => $snapshot->captured_at,
            ],
        ]);
    }
}
