<?php

namespace App\Infolists\Components;

use App\Models\HistorySnapshot;
use Filament\Infolists\Components\Entry;
use SebastianBergmann\Diff\Differ;
use SebastianBergmann\Diff\Output\UnifiedDiffOutputBuilder;

class DiffEntry extends Entry
{
    protected string $view = 'infolists.components.diff-entry';

    public function getDiff(): string
    {
        $current = $this->getRecord();
        
        if (! $current) return '';

        // Find previous snapshot
        $previous = HistorySnapshot::query()
            ->where('application_id', $current->application_id)
            ->where('scope', $current->scope)
            ->where('captured_at', '<', $current->captured_at)
            ->latest('captured_at')
            ->first();

        // Get content ensuring strings (accessors should handle it, but we double check)
        $currentContent = (string) $current->content_blob;

        if (! $previous) {
            return '';
        }

        $previousContent = (string) $previous->content_blob;

        try {
            $builder = new UnifiedDiffOutputBuilder("--- a/Original\n+++ b/Current\n", false);
            $differ = new Differ($builder);
            $diff = $differ->diff($previousContent, $currentContent);
            
            // Prepend a git-like header to ensure Diff2Html parses it properly
            return "diff --git a/Original b/Current\n" . $diff;
        } catch (\Exception $e) {
            return 'Diff Error: ' . $e->getMessage();
        }
    }

    public function getContent(): string
    {
        $record = $this->getRecord();
        return $record ? (string) $record->content_blob : '';
    }
}
