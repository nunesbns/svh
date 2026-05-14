<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Services\SnapshotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PersistSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function handle(SnapshotService $svc): void
    {
        $svc->persist($this->payload);

        AuditLog::create([
            'action' => 'snapshot.created',
            'actor' => $this->payload['user_sc_login'] ?? 'unknown',
            'target' => $this->payload['scope'],
            'metadata' => [
                'project_id' => $this->payload['project_id'],
                'application_id' => $this->payload['application_id'],
            ],
        ]);
    }
}
