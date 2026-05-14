<?php

namespace App\Filament\Resources\ApiKeyResource\Pages;

use App\Filament\Resources\ApiKeyResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListApiKeys extends ListRecords
{
    protected static string $resource = ApiKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->mutateFormDataUsing(function (array $data): array {
                    $secret = \App\Models\ApiKey::generateSecret();
                    $data['prefix'] = \App\Models\ApiKey::getPrefix($secret);
                    $data['hash'] = \App\Models\ApiKey::getHash($secret);

                    session()->flash('generated_secret', $secret);

                    return $data;
                })
                ->after(function () {
                    $secret = session('generated_secret');
                    if ($secret) {
                        \Filament\Notifications\Notification::make()
                            ->title('API Key Created')
                            ->success()
                            ->persistent()
                            ->body(new \Illuminate\Support\HtmlString("
                                <p class='mb-4'>Please copy your secret key now. You will <b>not</b> be able to see it again:</p>
                                <div class='flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                                    <code class='text-sm font-mono break-all p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700'>{$secret}</code>
                                    <button 
                                        type='button'
                                        onclick=\"navigator.clipboard.writeText('{$secret}').then(() => { this.innerText = 'Copied!'; this.classList.remove('bg-primary-600'); this.classList.add('bg-success-600'); setTimeout(() => { this.innerText = 'Copy Secret Key'; this.classList.add('bg-primary-600'); this.classList.remove('bg-success-600'); }, 2000); })\"
                                        class='w-full inline-flex justify-center items-center px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-500 focus:outline-none shadow-sm transition-colors'
                                    >
                                        Copy Secret Key
                                    </button>
                                </div>
                            "))
                            ->send();
                    }
                }),
        ];
    }
}
