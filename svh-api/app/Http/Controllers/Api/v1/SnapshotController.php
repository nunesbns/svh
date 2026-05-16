<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Jobs\PersistSnapshotJob;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SnapshotController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cod_prj' => 'required|string',
            'cod_apl' => 'required|string',
            'scope' => 'required|string',
            'type' => 'required|string|in:app_event,lib_file,function',
            'content' => 'required|string',
            'user_sc_login' => 'required|string',
            'captured_at' => 'required|date',
            'metadata' => 'nullable|array',
        ]);

        $project = Project::where('cod_prj', $validated['cod_prj'])->first();

        if (! $project) {
            return response()->json(['error' => 'Project Not Mapped'], 404);
        }

        $application = Application::firstOrCreate(
            [
                'project_id' => $project->id,
                'cod_prj' => $validated['cod_prj'],
                'cod_apl' => $validated['cod_apl'],
            ],
            [
                'display_name' => $validated['cod_apl'],
            ]
        );

        $payload = [
            ...$validated,
            'project_id' => $project->id,
            'application_id' => $application->id,
        ];

        PersistSnapshotJob::dispatch($payload)->onQueue('snapshots');

        AuditLog::create([
            'action' => 'snapshot.created',
            'actor' => $validated['user_sc_login'],
            'target' => $application->id,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json(['status' => 'queued'], 202);
    }

    public function show(string $id): JsonResponse
    {
        $snapshot = \App\Models\HistorySnapshot::findOrFail($id);

        return response()->json([
            'id' => $snapshot->id,
            'content' => $snapshot->content_blob,
            'scope' => $snapshot->scope,
            'type' => $snapshot->type,
            'user_sc_login' => $snapshot->user_sc_login,
            'captured_at' => $snapshot->captured_at,
            'metadata' => $snapshot->metadata,
        ]);
    }
}
