@props(['secret'])

<div
    x-data="{
        secret: @js($secret),
        copied: false,
        async copy() {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(this.secret);
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = this.secret;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                this.copied = true;
                setTimeout(() => { this.copied = false; }, 2000);
            } catch (e) {
                console.error('Clipboard copy failed', e);
            }
        },
    }"
    class="rounded-xl border border-warning-300 bg-warning-50 p-4 shadow-sm dark:border-warning-500/30 dark:bg-warning-500/10"
>
    <div class="flex items-start gap-3">
        <x-filament::icon
            icon="heroicon-o-key"
            class="mt-0.5 h-5 w-5 flex-none text-warning-600 dark:text-warning-400"
        />

        <div class="flex-1 space-y-3">
            <div>
                <h3 class="text-sm font-semibold text-warning-800 dark:text-warning-200">
                    API key created — copy it now
                </h3>
                <p class="mt-1 text-sm text-warning-700 dark:text-warning-300">
                    This is the only time the full secret will be shown. Store it in a safe place.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <code
                    class="flex-1 min-w-0 break-all rounded-md border border-warning-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 dark:border-warning-500/30 dark:bg-gray-900 dark:text-gray-100"
                >{{ $secret }}</code>

                <button
                    type="button"
                    x-on:click="copy()"
                    :class="copied
                        ? 'bg-success-600 hover:bg-success-500 focus:ring-success-500'
                        : 'bg-primary-600 hover:bg-primary-500 focus:ring-primary-500'"
                    class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                    <template x-if="!copied">
                        <span class="inline-flex items-center gap-2">
                            <x-filament::icon
                                icon="heroicon-m-clipboard-document"
                                class="h-4 w-4"
                            />
                            Copy
                        </span>
                    </template>
                    <template x-if="copied">
                        <span class="inline-flex items-center gap-2">
                            <x-filament::icon
                                icon="heroicon-m-check"
                                class="h-4 w-4"
                            />
                            Copied
                        </span>
                    </template>
                </button>
            </div>
        </div>
    </div>
</div>
