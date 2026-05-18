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
    /**
     * Snapshot types and their semantics:
     *
     *   app_event   - regular application event (cod_apl required)
     *   function    - PHP method inside an application (cod_apl required)
     *   lib_file    - library file (kept for backwards compatibility)
     *   project_lib - project-scoped library (no cod_apl; lives at the
     *                 project level)
     *   public_lib  - global library shared across projects (no cod_apl)
     */
    private const APPLICATION_TYPES = ['app_event', 'function'];
    private const LIB_TYPES = ['lib_file', 'project_lib', 'public_lib'];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cod_prj' => 'required|string',
            'cod_apl' => 'nullable|string',
            'scope' => 'required|string',
            'type' => 'required|string|in:app_event,lib_file,function,project_lib,public_lib',
            'content' => 'required|string',
            'user_sc_login' => 'required|string',
            'captured_at' => 'required|date',
            'metadata' => 'nullable|array',
        ]);

        $type = $validated['type'];
        $isLib = in_array($type, self::LIB_TYPES, true);

        // Application-scoped types must carry a cod_apl.
        if (in_array($type, self::APPLICATION_TYPES, true) && empty($validated['cod_apl'])) {
            return response()->json(['error' => 'cod_apl is required for type ' . $type], 422);
        }

        $project = Project::where('cod_prj', $validated['cod_prj'])->first();

        if (! $project) {
            return response()->json(['error' => 'Project Not Mapped'], 404);
        }

        $applicationId = null;
        $auditTarget = $project->id;

        if (! $isLib) {
            $application = Application::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'cod_prj' => $validated['cod_prj'],
                    'cod_apl' => $validated['cod_apl'],
                ],
                [
                    'display_name' => $validated['cod_apl'],
                ],
            );
            $applicationId = $application->id;
            $auditTarget = $application->id;
        }

        $payload = [
            ...$validated,
            'project_id' => $project->id,
            'application_id' => $applicationId,
        ];

        PersistSnapshotJob::dispatch($payload)->onQueue('snapshots');

        AuditLog::create([
            'action' => 'snapshot.created',
            'actor' => $validated['user_sc_login'],
            'target' => $auditTarget,
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
