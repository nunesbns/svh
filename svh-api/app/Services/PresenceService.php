<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;

class PresenceService
{
    private const ACTIVE_USERS_KEY = "presence:active_users";
    private const TTL = 300; // 5 minutes

    public function heartbeat(array $data): void
    {
        $prj = $data['cod_prj'];
        $apl = $data['cod_apl'];
        $user = $data['user_sc_login'];
        $now = time();

        // 1. Check if user already has an active presence elsewhere and revoke it if changed
        $activeKey = "presence:active_user:{$user}";
        $oldActiveJson = Redis::get($activeKey);
        if ($oldActiveJson) {
            $oldActive = json_decode($oldActiveJson, true);
            $oldPrj = $oldActive['cod_prj'] ?? null;
            $oldApl = $oldActive['cod_apl'] ?? null;

            if ($oldPrj && $oldApl && ($oldPrj !== $prj || $oldApl !== $apl)) {
                $oldZsetKey = self::ACTIVE_USERS_KEY . ":{$oldPrj}:{$oldApl}";
                Redis::zrem($oldZsetKey, $user);

                $oldDetailsKey = "presence:details:{$oldPrj}:{$oldApl}:{$user}";
                Redis::del($oldDetailsKey);
            }
        }

        // 2. Set the last seen timestamp
        $data['last_seen'] = now()->toIso8601String();

        // 3. Register current active state (global per user)
        Redis::setex($activeKey, self::TTL, json_encode($data));

        // 4. Individual key for detailed data
        $key = "presence:details:{$prj}:{$apl}:{$user}";
        Redis::setex($key, self::TTL, json_encode($data));

        // 5. Add to application-level ZSET for conflict detection
        $zsetKey = self::ACTIVE_USERS_KEY . ":{$prj}:{$apl}";
        Redis::zadd($zsetKey, $now, $user);
        
        // Clean up old users from this application's ZSET
        Redis::zremrangebyscore($zsetKey, '-inf', $now - self::TTL);
        // Set expiry on the ZSET itself so it doesn't linger forever
        Redis::expire($zsetKey, self::TTL + 60);
    }

    public function isOnline(string $codPrj, string $codApl, string $scope, string $user): bool
    {
        $key = "presence:details:{$codPrj}:{$codApl}:{$user}";
        return (bool) Redis::exists($key);
    }

    public function getActiveUsers(string $codPrj, string $codApl): array
    {
        $zsetKey = self::ACTIVE_USERS_KEY . ":{$codPrj}:{$codApl}";
        $now = time();

        // Clean up before returning
        Redis::zremrangebyscore($zsetKey, '-inf', $now - self::TTL);

        // Get all users in this application
        $usernames = Redis::zrange($zsetKey, 0, -1);
        
        $users = [];
        foreach ($usernames as $username) {
            // Try to get detailed info if available
            $detailsKey = "presence:details:{$codPrj}:{$codApl}:{$username}";
            $details = json_decode(Redis::get($detailsKey) ?: 'null', true);
            
            $users[] = [
                'user' => $username,
                'scope' => $details['scope'] ?? 'unknown',
                'last_seen' => $details ? now()->parse($details['last_seen'] ?? now())->toISOString() : now()->toISOString(),
            ];
        }

        return $users;
    }
}
