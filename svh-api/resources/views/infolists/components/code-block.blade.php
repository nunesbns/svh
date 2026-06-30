<div 
    x-data="{
        copy() {
            window.navigator.clipboard.writeText($refs.codeBlock.textContent).then(() => {
                new FilamentNotification()
                    .title('{{ __('Code copied!') }}')
                    .success()
                    .send();
            });
        }
    }"
    class="relative rounded-lg bg-[#0d1117] w-full"
    style="background-color: #0d1117;"
>
    <button 
        @click="copy" 
        title="{{ __('Copy code') }}"
        type="button" 
        class="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        style="position: absolute; top: 0.5rem; right: 1rem; padding: 0.5rem; z-index: 20; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    </button>
    <div class="overflow-x-auto p-4 pt-10 text-sm leading-tight font-mono text-gray-300">
        <pre style="margin: 0;"><code x-ref="codeBlock" class="language-php" x-init="
            if (typeof hljs === 'undefined') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
                document.head.appendChild(link);
                
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
                script.onload = () => { hljs.highlightElement($el); };
                document.head.appendChild(script);
            } else {
                hljs.highlightElement($el);
            }
        ">{{ $getState() }}</code></pre>
    </div>
</div>
