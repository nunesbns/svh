<?php

namespace App\Services;

use App\Models\HistorySnapshot;
use SebastianBergmann\Diff\Differ;
use SebastianBergmann\Diff\Output\UnifiedDiffOutputBuilder;
use Illuminate\Support\Facades\Redis;

class DiffService
{
    private Differ $differ;

    public function __construct()
    {
        $builder = new UnifiedDiffOutputBuilder("--- a\n+++ b\n", false);
        $this->differ = new Differ($builder);
    }

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
            $snapshotA->content_blob,
            $snapshotB->content_blob
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
}
