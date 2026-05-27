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

        $code = $validated['content'];

        // Preprocess Scriptcase fields: {field} -> $sc_field_field
        $code = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '$sc_field_$1', $code);

        // Preprocess Scriptcase globals: [global] -> $sc_global_global (using negative lookbehind)
        $code = preg_replace('/(?<![a-zA-Z0-9_\]\)\$])\[([a-zA-Z_][a-zA-Z0-9_]*)\]/', '$sc_global_$1', $code);

        // Prepend <?php if not present (Scriptcase often excludes open tags)
        $prepended = false;
        if (!str_contains($code, '<?php') && !str_contains($code, '<?')) {
            $code = "<?php\n" . $code;
            $prepended = true;
        }

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
                // Output usually looks like:
                // "PHP Parse error:  syntax error, unexpected token "echo" in - on line 5"
                if (preg_match('/Parse error:\s+(.+) in .*? on line (\d+)/i', $output, $matches)) {
                    $errorMsg = trim($matches[1]);
                    $rawLine = (int)$matches[2];
                    $line = $prepended ? max(1, $rawLine - 1) : $rawLine;
                } else {
                    $errorMsg = trim($output) ?: 'Erro de sintaxe desconhecido.';
                }
            }
        } else {
            return response()->json(['error' => 'Não foi possível inicializar o validador de PHP.'], 500);
        }

        return response()->json([
            'valid' => $isValid,
            'error' => $errorMsg,
            'line' => $line,
        ]);
    }
}
