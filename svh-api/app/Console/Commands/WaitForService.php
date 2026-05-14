<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\Process\Process;

class WaitForService extends Command
{
    protected $signature = 'svh:wait-for {--service=} {--timeout=30}';

    protected $description = 'Wait for a service to be available';

    public function handle(): int
    {
        $service = $this->option('service');
        $timeout = (int) $this->option('timeout');
        $start = time();

        while (time() - $start < $timeout) {
            if ($this->check($service)) {
                $this->info("{$service} is ready");
                return 0;
            }
            sleep(1);
        }

        $this->error("{$service} not ready after {$timeout}s");
        return 1;
    }

    private function check(string $service): bool
    {
        return match ($service) {
            'db' => $this->checkDb(),
            'redis' => $this->checkRedis(),
            default => false,
        };
    }

    private function checkDb(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception) {
            return false;
        }
    }

    private function checkRedis(): bool
    {
        try {
            Redis::ping();
            return true;
        } catch (\Exception) {
            return false;
        }
    }
}
