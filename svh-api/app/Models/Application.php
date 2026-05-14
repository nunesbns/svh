<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'project_id',
        'cod_prj',
        'cod_apl',
        'display_name',
        'first_seen_at',
    ];

    protected $casts = [
        'first_seen_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function snapshots(): HasMany
    {
        return $this->hasMany(HistorySnapshot::class);
    }
}
