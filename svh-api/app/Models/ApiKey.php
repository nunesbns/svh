<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'prefix',
        'hash',
        'scope',
        'last_used_at',
        'revoked_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public static function generateSecret(): string
    {
        return 'svh_' . \Illuminate\Support\Str::random(32);
    }

    public static function getPrefix(string $secret): string
    {
        return substr($secret, 0, 8);
    }

    public static function getHash(string $secret): string
    {
        return password_hash($secret, PASSWORD_ARGON2ID);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function markUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
