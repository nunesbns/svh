<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorySnapshot extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'history_snapshots';

    protected $fillable = [
        'project_id',
        'application_id',
        'type',
        'scope',
        'user_sc_login',
        'content_blob',
        'hash_sha256',
        'captured_at',
        'metadata',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
        'metadata' => 'array',
        'content_blob' => 'string',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
