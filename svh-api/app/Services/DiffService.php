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
        // The second argument (`addLineNumbers`) makes the builder emit
        // proper `@@ -1,5 +1,5 @@` hunk headers, which are required for
        // diff2html to correctly identify changed regions and produce a
        // side-by-side view.
        //
        // The diff is computed with the live editor on the LEFT and the
        // saved snapshot on the RIGHT, so that the snapshot the user is
        // about to restore appears on the right side of the modal — the
        // direction users expect when comparing "current" vs "incoming".
        $builder = new UnifiedDiffOutputBuilder("--- editor\n+++ snapshot\n", true);
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
            $this->normalizeLineEndings((string) $snapshotA->content_blob),
            $this->normalizeLineEndings((string) $snapshotB->content_blob),
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
     * Compute a diff between the current editor content (left) and a
     * persisted snapshot (right). Not cached because the left-hand side
     * comes from the user's live buffer.
     */
    public function computeRaw(string $snapshotId, string $rawContent): array
    {
        $snapshot = HistorySnapshot::findOrFail($snapshotId);

        $diff = $this->differ->diff(
            $this->normalizeLineEndings((string) $rawContent),
            $this->normalizeLineEndings((string) $snapshot->content_blob),
        );

        return [
            'snapshot' => [
                'id' => $snapshot->id,
                'captured_at' => $snapshot->captured_at,
            ],
            'diff' => $diff,
        ];
    }

    /**
     * sebastian/diff is line-ending sensitive: comparing a CRLF text against
     * an LF text marks every line as changed and prepends a warning. The
     * Scriptcase IDE saves files with CRLF while CodeMirror returns LF, so
     * we normalize both sides to LF before computing the diff.
     */
    private function normalizeLineEndings(string $content): string
    {
        return str_replace(["\r\n", "\r"], "\n", $content);
    }
}
