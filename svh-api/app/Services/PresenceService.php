<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;

class PresenceService
{
    public function heartbeat(array $data): void
    {
        $key = "presence:{$data['cod_prj']}:{$data['cod_apl']}:{$data['scope']}:{$data['user_sc_login']}";
        Redis::setex($key, 300, json_encode($data));
    }

    public function isOnline(string $codPrj, string $codApl, string $scope, string $user): bool
    {
        $key = "presence:{$codPrj}:{$codApl}:{$scope}:{$user}";
        return (bool) Redis::exists($key);
    }
}
