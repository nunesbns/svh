<?php

namespace App\Services;

use App\Models\HistorySnapshot;

class SnapshotService
{
    public function persist(array $payload): void
    {
        $hash = hash('sha256', $payload['content']);

        $last = HistorySnapshot::query()
            ->where('application_id', $payload['application_id'])
            ->where('scope', $payload['scope'])
            ->latest('captured_at')
            ->first();

        if ($last && $last->hash_sha256 === $hash) {
            return;
        }

        HistorySnapshot::create([
            'project_id' => $payload['project_id'],
            'application_id' => $payload['application_id'],
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
