<?php

namespace App\Filament\Resources\ApiKeyResource\Pages;

use App\Filament\Resources\ApiKeyResource;
use App\Models\ApiKey;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListApiKeys extends ListRecords
{
    protected static string $resource = ApiKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->mutateFormDataUsing(function (array $data): array {
                    $secret = ApiKey::generateSecret();
                    $data['prefix'] = ApiKey::getPrefix($secret);
                    $data['hash'] = ApiKey::getHash($secret);

                    session()->flash('generated_secret', $secret);

                    return $data;
                })
                ->successNotification(
                    Notification::make()
                        ->title('API key created')
                        ->body('Copy the secret from the banner above — it will not be shown again.')
                        ->success(),
                )
                ->successRedirectUrl(fn () => static::getResource()::getUrl('index'))
                ->createAnother(false),
        ];
    }
}
