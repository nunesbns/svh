<?php

namespace App\Filament\Resources\ApiKeyResource\Pages;

use App\Filament\Resources\ApiKeyResource;
use App\Models\ApiKey;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateApiKey extends CreateRecord
{
    protected static string $resource = ApiKeyResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $secret = ApiKey::generateSecret();
        $data['prefix'] = ApiKey::getPrefix($secret);
        $data['hash'] = ApiKey::getHash($secret);

        $this->record_secret = $secret;

        return $data;
    }

    protected function afterCreate(): void
    {
        if ($this->record_secret) {
            \Filament\Notifications\Notification::make()
                ->title('API Key Created')
                ->success()
                ->persistent()
                ->body(new \Illuminate\Support\HtmlString("
                    <p class='mb-4'>Please copy your secret key now. You will <b>not</b> be able to see it again:</p>
                    <div class='flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                        <code class='text-sm font-mono break-all p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700'>{$this->record_secret}</code>
                        <button 
                            type='button'
                            onclick=\"navigator.clipboard.writeText('{$this->record_secret}').then(() => { this.innerText = 'Copied!'; this.classList.remove('bg-primary-600'); this.classList.add('bg-success-600'); setTimeout(() => { this.innerText = 'Copy Secret Key'; this.classList.add('bg-primary-600'); this.classList.remove('bg-success-600'); }, 2000); })\"
                            class='w-full inline-flex justify-center items-center px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-500 focus:outline-none shadow-sm transition-colors'
                        >
                            Copy Secret Key
                        </button>
                    </div>
                "))
                ->send();
        }
    }

    private ?string $record_secret = null;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
