<?php

namespace App\Services;

use App\Models\HistorySnapshot;
use Illuminate\Support\Facades\Redis;
use SebastianBergmann\Diff\Differ;
use SebastianBergmann\Diff\Output\UnifiedDiffOutputBuilder;

class DiffService
{
    private Differ $differ;

    public function __construct()
    {
        $builder = new UnifiedDiffOutputBuilder("--- a\n+++ b\n", false);
        $this->differ = new Differ($builder);
    }

    /**
     * Compute a diff between two persisted snapshots (cached in Redis).
     */
    public function compute(string $a, string $b): array
    {
        $cacheKey = "diff:{$a}:{$b}";
        $cached = Redis::get($cacheKey);

        if ($cached) {
            return json_decode($cached, true);
        }

        $snapshotA = HistorySnapshot::findOrFail($a);
        $snapshotB = HistorySnapshot::findOrFail($b);

        $diff = $this->differ->diff(
            (string) $snapshotA->content_blob,
            (string) $snapshotB->content_blob,
        );

        $result = [
            'a' => [
                'id' => $snapshotA->id,
                'captured_at' => $snapshotA->captured_at,
            ],
            'b' => [
                'id' => $snapshotB->id,
                'captured_at' => $snapshotB->captured_at,
            ],
            'diff' => $diff,
        ];

        Redis::setex($cacheKey, 3600, json_encode($result));

        return $result;
    }

    /**
     * Compute a diff between a persisted snapshot and the current editor content.
     * Not cached because the right-hand side comes from the user's live buffer.
     */
    public function computeRaw(string $snapshotId, string $rawContent): array
    {
        $snapshot = HistorySnapshot::findOrFail($snapshotId);

        $diff = $this->differ->diff(
            (string) $snapshot->content_blob,
            (string) $rawContent,
        );

        return [
            'snapshot' => [
                'id' => $snapshot->id,
                'captured_at' => $snapshot->captured_at,
            ],
            'diff' => $diff,
        ];
    }
}
