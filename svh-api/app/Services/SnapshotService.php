<?php

namespace App\Services;

use App\Models\HistorySnapshot;

class SnapshotService
{
    public function persist(array $payload): void
    {
        $hash = hash('sha256', $payload['content']);

        // Look up the latest snapshot for the same scope to decide if this
        // save is a duplicate. Application-scoped snapshots are keyed by
        // application_id; library snapshots have no application and are
        // keyed by project_id + type instead.
        $query = HistorySnapshot::query()
            ->where('scope', $payload['scope'])
            ->where('type', $payload['type']);

        if (! empty($payload['application_id'])) {
            $query->where('application_id', $payload['application_id']);
        } else {
            $query->whereNull('application_id')
                  ->where('project_id', $payload['project_id']);
        }

        $last = $query->latest('captured_at')->first();

        if ($last && $last->hash_sha256 === $hash) {
            return;
        }

        HistorySnapshot::create([
            'project_id' => $payload['project_id'],
            'application_id' => $payload['application_id'] ?? null,
            'type' => $payload['type'],
            'scope' => $payload['scope'],
            'user_sc_login' => $payload['user_sc_login'],
            'content_blob' => $payload['content'],
            'hash_sha256' => $hash,
            'captured_at' => $payload['captured_at'],
            'metadata' => $payload['metadata'] ?? null,
        ]);
    }
}
