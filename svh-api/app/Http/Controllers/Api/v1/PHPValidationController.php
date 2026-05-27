<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PHPValidationController extends Controller
{
    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $result = $this->lintCode($validated['content']);

        return response()->json($result);
    }

    public function formatCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $originalCode = $validated['content'];

        // 1. Run lint check first to prevent formatting broken code
        $lintResult = $this->lintCode($originalCode);
        if (!$lintResult['valid']) {
            return response()->json([
                'valid' => false,
                'error' => $lintResult['error'],
                'line' => $lintResult['line'],
            ]);
        }

        // 2. Preprocess formatting logic
        $hasOpen = (bool)preg_match('/^(\s*)<\?(php)?/i', $originalCode);
        $hasClose = (bool)preg_match('/\?' . '>(\s*)$/', $originalCode);

        // Translate placeholders
        $code = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '$__sc_fld_$1', $originalCode);
        $code = preg_replace('/(?<![a-zA-Z0-9_\]\)\$])\[([a-zA-Z_][a-zA-Z0-9_]*)\]/', '$__sc_glb_$1', $code);

        // Strip tags (preserving newlines)
        $code = preg_replace('/^(\s*)<\?(php)?/i', '$1', $code);
        $code = preg_replace('/\?' . '>(\s*)$/', '$1', $code);

        // Always prepend opening tag for Pint
        $code = "<?php\n" . $code;

        // Write to temp file
        $tempFile = sys_get_temp_dir() . '/svh_format_' . uniqid() . '.php';
        file_put_contents($tempFile, $code);

        // Run Pint
        $pintPath = base_path('vendor/bin/pint');
        $command = escapeshellcmd($pintPath) . ' ' . escapeshellarg($tempFile) . ' --preset psr12';

        $descriptorspec = [
            0 => ["pipe", "r"], // stdin
            1 => ["pipe", "w"], // stdout
            2 => ["pipe", "w"]  // stderr
        ];

        $process = proc_open($command, $descriptorspec, $pipes);
        if (is_resource($process)) {
            fclose($pipes[0]);
            $stdout = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[2]);
            proc_close($process);
        }

        // Read formatted code
        $formatted = file_get_contents($tempFile);
        @unlink($tempFile);

        // Strip prepended opening tag
        $formatted = preg_replace('/^<\?php\n/i', '', $formatted);

        // Restore placeholders
        $formatted = preg_replace('/\$__sc_fld_([a-zA-Z0-9_]+)/', '{$1}', $formatted);
        $formatted = preg_replace('/\$__sc_glb_([a-zA-Z0-9_]+)/', '[$1]', $formatted);

        // Restore tags
        if ($hasOpen) {
            $formatted = '<?php' . "\n" . ltrim($formatted);
        } else {
            $formatted = ltrim($formatted);
        }
        if ($hasClose) {
            $formatted = rtrim($formatted) . "\n" . '?' . '>';
        }

        return response()->json([
            'valid' => true,
            'content' => $formatted,
        ]);
    }

    private function lintCode(string $code): array
    {
        // Preprocess Scriptcase fields: {field} -> $sc_field_field
        $code = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '$sc_field_$1', $code);

        // Preprocess Scriptcase globals: [global] -> $sc_global_global (using negative lookbehind)
        $code = preg_replace('/(?<![a-zA-Z0-9_\]\)\$])\[([a-zA-Z_][a-zA-Z0-9_]*)\]/', '$sc_global_$1', $code);

        // Strip opening php tag (<?php or <?) at the start, preserving leading newlines/whitespace
        $code = preg_replace('/^(\s*)<\?(php)?/i', '$1', $code);

        // Strip closing php tag ('?' followed by '>') at the end, preserving trailing newlines/whitespace.
        // We concatenate the characters to prevent the PHP parser from seeing it as a close tag.
        $code = preg_replace('/\?' . '>(\s*)$/', '$1', $code);

        // Always prepend opening tag to ensure standard syntax validation as PHP
        $code = "<?php\n" . $code;

        $descriptorspec = [
            0 => ["pipe", "r"], // stdin
            1 => ["pipe", "w"], // stdout
            2 => ["pipe", "w"]  // stderr
        ];

        $process = proc_open('php -l', $descriptorspec, $pipes);

        $errorMsg = null;
        $line = null;
        $isValid = false;

        if (is_resource($process)) {
            fwrite($pipes[0], $code);
            fclose($pipes[0]);

            $stdout = stream_get_contents($pipes[1]);
            fclose($pipes[1]);

            $stderr = stream_get_contents($pipes[2]);
            fclose($pipes[2]);

            $returnValue = proc_close($process);

            if ($returnValue === 0) {
                $isValid = true;
            } else {
                $output = $stdout ?: $stderr;
                // Parse line number and parse error description.
                if (preg_match('/Parse error:\s+(.+) in .*? on line (\d+)/i', $output, $matches)) {
                    $errorMsg = trim($matches[1]);
                    $rawLine = (int)$matches[2];
                    $line = max(1, $rawLine - 1);
                } else {
                    $errorMsg = trim($output) ?: 'Erro de sintaxe desconhecido.';
                }
            }
        }

        return [
            'valid' => $isValid,
            'error' => $errorMsg,
            'line' => $line,
        ];
    }
}
