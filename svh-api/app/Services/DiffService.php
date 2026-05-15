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

    public function computeRaw(string $snapshotId, string $rawContent): array
    {
        $snapshot = HistorySnapshot::findOrFail($snapshotId);

        // Normalize whitespace for comparison if needed, 
        // but typically unified diff shows the actual changes.
        // To truly ignore whitespace in the diff algorithm with sebastian/diff,
        // we can pre-process lines or use a custom differ if available.
        // For now, let's just do a standard diff.
        
        $diff = $this->differ->diff(
            $snapshot->content_blob,
            $rawContent
        );

        return [
            'snapshot' => [
                'id' => $snapshot->id,
                'captured_at' => $snapshot->captured_at,
            ],
            'diff' => $diff,
        ];
    }

