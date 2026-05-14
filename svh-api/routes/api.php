<?php

use App\Http\Controllers\Api\v1\DiffController;
use App\Http\Controllers\Api\v1\HistoryController;
use App\Http\Controllers\Api\v1\PresenceController;
use App\Http\Controllers\Api\v1\RestoreController;
use App\Http\Controllers\Api\v1\SnapshotController;
use App\Http\Middleware\ApiKeyGuard;
use App\Http\Middleware\ForceHttps;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware([ForceHttps::class, ApiKeyGuard::class])
    ->group(function () {
        Route::post('/snapshots', [SnapshotController::class, 'store']);
        Route::get('/snapshots/{id}', [SnapshotController::class, 'show']);
        Route::post('/presence', [PresenceController::class, 'store']);
        Route::get('/history', [HistoryController::class, 'index']);
        Route::get('/diff/{a}/{b}', [DiffController::class, 'show']);
        Route::post('/restore', [RestoreController::class, 'store']);
    });

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/metrics', function () {
    return response()->json([
        'snapshots_rate' => 0,
        'dedupe_rate' => 0,
        'devs_online' => 0,
    ]);
});
