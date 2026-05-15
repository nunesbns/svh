<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HistorySnapshot extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    protected $keyType = 'string';

    public $incrementing = false;

    protected $casts = [
        'metadata' => 'json',
        'captured_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    // Use a proper accessor method compatible with Laravel 12/11 style if needed, 
    // but the old style should work. Let's make it more robust.
    protected function getContentBlobAttribute($value)
    {
        if (is_resource($value)) {
            $content = stream_get_contents($value);
            return $content;
        }

        return $value;
    }
}
