<x-dynamic-component :component="$getEntryWrapperView()" :entry="$entry">
    <div style="background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 0.875rem; line-height: 1.25rem; border: 1px solid #334155;">
        @php
            $diff = $getDiff();
            $content = $getContent();
        @endphp

        @if($diff)
            <div style="margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.75rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem;">Unified Diff</div>
            <pre>@foreach(explode("\n", $diff) as $line)
@if(str_starts_with($line, '+'))<span style="color: #4ade80;">{{ $line }}</span>
@elseif(str_starts_with($line, '-'))<span style="color: #f87171;">{{ $line }}</span>
@elseif(str_starts_with($line, '@@'))<span style="color: #818cf8;">{{ $line }}</span>
@else{{ $line }}
@endif
@endforeach</pre>
        @elseif($content)
            <div style="margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.75rem; border-bottom: 1px solid #334155; padding-bottom: 0.5rem;">Full Snapshot Content</div>
            <pre>@foreach(explode("\n", $content) as $line)
{{ $line }}
@endforeach</pre>
        @else
            <div style="color: #94a3b8; font-style: italic;">(No content available)</div>
        @endif
    </div>
</x-dynamic-component>
