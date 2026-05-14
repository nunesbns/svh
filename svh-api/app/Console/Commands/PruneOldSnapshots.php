<?php

namespace App\Console\Commands;

use App\Models\HistorySnapshot;
use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneOldSnapshots extends Command
{
    protected $signature = 'svh:prune';

    protected $description = 'Prune old snapshots respecting retention and baseline';

    public function handle(): int
    {
        foreach (Project::all() as $project) {
            $this->pruneProject($project);
        }

        return 0;
    }

    private function pruneProject($project): void
    {
        $retentionDays = $project->retention_days;

        $sql = <<<SQL
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY application_id, scope
             ORDER BY captured_at ASC
           ) AS oldest_rank
    FROM history_snapshots
    WHERE project_id = ?
)
DELETE FROM history_snapshots
WHERE id IN (
    SELECT hs.id FROM history_snapshots hs
    WHERE hs.project_id = ?
      AND hs.created_at < now() - (? || ' days')::interval
      AND hs.id NOT IN (SELECT id FROM ranked WHERE oldest_rank <= 3)
);
SQL;

        $result = DB::delete($sql, [
            $project->id,
            $project->id,
            $retentionDays,
        ]);

        $this->info("Project {$project->cod_prj}: pruned {$result} snapshots");
    }
}
