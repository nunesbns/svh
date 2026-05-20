<?php

namespace Tests\Feature;

use App\Services\PresenceService;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class PresenceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Only flush presence-related keys to avoid clearing other cache data
        $keys = Redis::keys('presence:*');
        if (!empty($keys)) {
            foreach ($keys as $key) {
                // Remove Redis prefix if it is automatically prepended by the driver
                $cleanKey = preg_replace('/^' . config('database.redis.options.prefix') . '/', '', $key);
                Redis::del($cleanKey);
            }
        }
    }

    public function test_user_only_has_one_active_activity(): void
    {
        $service = app(PresenceService::class);

        // Heartbeat to App A
        $service->heartbeat([
            'cod_prj' => 'prj1',
            'cod_apl' => 'appA',
            'user_sc_login' => 'dev1',
            'scope' => 'events/onInit',
        ]);

        // Verify dev1 is active in App A
        $activeA = $service->getActiveUsers('prj1', 'appA');
        $this->assertCount(1, $activeA);
        $this->assertEquals('dev1', $activeA[0]['user']);

        // Heartbeat to App B (different application)
        $service->heartbeat([
            'cod_prj' => 'prj1',
            'cod_apl' => 'appB',
            'user_sc_login' => 'dev1',
            'scope' => 'events/onLoad',
        ]);

        // Verify dev1 is no longer active in App A
        $activeA = $service->getActiveUsers('prj1', 'appA');
        $this->assertCount(0, $activeA);

        // Verify dev1 is active in App B
        $activeB = $service->getActiveUsers('prj1', 'appB');
        $this->assertCount(1, $activeB);
        $this->assertEquals('dev1', $activeB[0]['user']);
    }
}
