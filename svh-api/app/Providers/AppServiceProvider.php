<?php

namespace App\Providers;

use App\Filament\Resources\ApiKeyResource\Pages\ListApiKeys;
use Filament\Support\Facades\FilamentView;
use Filament\View\PanelsRenderHook;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Renders a one-time secret banner above the ApiKeys table whenever
        // a new key was just created. The secret is flashed to the session
        // by the CreateAction in ListApiKeys.
        FilamentView::registerRenderHook(
            PanelsRenderHook::RESOURCE_PAGES_LIST_RECORDS_TABLE_BEFORE,
            fn (): ?Htmlable => session('generated_secret')
                ? new HtmlString(view('filament.api-key-secret-banner', [
                    'secret' => session('generated_secret'),
                ])->render())
                : null,
            scopes: ListApiKeys::class,
        );
    }
}
