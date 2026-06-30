<x-dynamic-component :component="$getEntryWrapperView()" :entry="$entry">
    <div 
        x-data="{
            diffString: {{ json_encode($getDiff()) }},
            initDiff() {
                if (!this.diffString) return;
                
                if (typeof Diff2HtmlUI === 'undefined') {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css';
                    document.head.appendChild(link);
                    
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js';
                    script.onload = () => this.renderDiff();
                    document.head.appendChild(script);
                } else {
                    this.renderDiff();
                }
            },
            renderDiff() {
                const target = this.$refs.diffElement;
                const isDark = document.documentElement.classList.contains('dark');
                const config = {
                    drawFileList: false,
                    matching: 'lines',
                    outputFormat: 'side-by-side',
                    synchronisedScroll: true,
                    colorScheme: isDark ? 'dark' : 'light'
                };
                const ui = new Diff2HtmlUI(target, this.diffString, config);
                ui.draw();
                
                // Watch for dark mode changes in Filament
                const observer = new MutationObserver(() => {
                    const currentlyDark = document.documentElement.classList.contains('dark');
                    if (currentlyDark !== isDark) {
                        target.innerHTML = '';
                        config.colorScheme = currentlyDark ? 'dark' : 'light';
                        new Diff2HtmlUI(target, this.diffString, config).draw();
                    }
                });
                observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            }
        }"
        x-init="initDiff()"
    >
        @php
            $diff = $getDiff();
            $content = $getContent();
        @endphp

        @if($diff)
            <div x-ref="diffElement" class="diff-wrapper"></div>
            <style>
                .diff-wrapper .d2h-file-header { display: none; }
                .diff-wrapper .d2h-wrapper { font-size: 0.875rem; border-color: inherit; }
                .fi-ta-content { overflow: visible !important; }
                
                /* Fix sticky line numbers transparency */
                .diff-wrapper .d2h-code-side-linenumber {
                    background-color: #f9fafb;
                    z-index: 5;
                }
                
                /* Extra CSS fixes for dark mode in case Diff2Html doesn't catch all elements */
                .dark .d2h-wrapper {
                    --d2h-bg-color: #1e293b;
                    --d2h-empty-placeholder-bg-color: #0f172a;
                }
                .dark .diff-wrapper .d2h-code-side-linenumber {
                    background-color: #0f172a;
                }
                .dark .d2h-code-side-emptyplaceholder { background-color: #0f172a; border-color: #334155; }
            </style>
        @else
            <div class="text-gray-500 dark:text-gray-400 italic">{{ __('No code changes') }}</div>
        @endif
    </div>
</x-dynamic-component>
