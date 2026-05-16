<?php

namespace App\Filament\Resources\ApiKeyResource\Pages;

use App\Filament\Resources\ApiKeyResource;
use App\Models\ApiKey;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateApiKey extends CreateRecord
{
    protected static string $resource = ApiKeyResource::class;

    protected static bool $canCreateAnother = false;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $secret = ApiKey::generateSecret();
        $data['prefix'] = ApiKey::getPrefix($secret);
        $data['hash'] = ApiKey::getHash($secret);

        session()->flash('generated_secret', $secret);

        return $data;
    }

    protected function getCreatedNotification(): ?Notification
    {
        return Notification::make()
            ->title('API key created')
            ->body('Copy the secret from the banner on the list page — it will not be shown again.')
            ->success();
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
