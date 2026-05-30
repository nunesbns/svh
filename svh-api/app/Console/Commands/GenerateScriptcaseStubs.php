<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GenerateScriptcaseStubs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scriptcase:generate-stubs 
                            {--url= : A URL da documentação do Scriptcase (padrão oficial pt_br)}
                            {--file= : O caminho de um arquivo local contendo o HTML da documentação}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera e atualiza arquivos de stubs PHP tipados para todas as macros do Scriptcase a partir de sua documentação';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $defaultUrl = 'https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/';
        $url = $this->option('url') ?: $defaultUrl;
        $filePath = $this->option('file');

        $html = '';

        if ($filePath) {
            if (!file_exists($filePath)) {
                $this->error("Arquivo especificado não encontrado: {$filePath}");
                return Command::FAILURE;
            }
            $this->info("Lendo a documentação do arquivo local: {$filePath}");
            $html = file_get_contents($filePath);
        } else {
            $this->info("Baixando a documentação da URL: {$url}");
            try {
                $response = Http::timeout(30)->get($url);
                if (!$response->successful()) {
                    $this->error("Erro ao baixar documentação: Código HTTP " . $response->status());
                    return Command::FAILURE;
                }
                $html = $response->body();
            } catch (\Exception $e) {
                $this->error("Erro ao conectar à URL: " . $e->getMessage());
                return Command::FAILURE;
            }
        }

        $this->info("Processando HTML e extraindo macros...");

        // Encontra todas as tags TR com id row_sc_...
        preg_match_all('/<tr id="row_(sc_[a-zA-Z0-9_]+)"[^>]*>(.*?)<\/tr>/is', $html, $trMatches, PREG_SET_ORDER);

        if (empty($trMatches)) {
            $this->error("Nenhuma macro foi encontrada no HTML fornecido.");
            return Command::FAILURE;
        }

        $outputPath = base_path('stubs/scriptcase-stubs.php');
        $outputDir = dirname($outputPath);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0777, true);
        }

        $stubs = "<?php\n\n";
        $stubs .= "/**\n";
        $stubs .= " * --------------------------------------------------------------------------\n";
        $stubs .= " * SCRIPTCASE MACROS PHPSTAN STUBS\n";
        $stubs .= " * --------------------------------------------------------------------------\n";
        $stubs .= " * Este arquivo define todas as macros do Scriptcase para fins de analise\n";
        $stubs .= " * estatica (PHPStan) e autocomplete na IDE.\n";
        $stubs .= " * Gerado automaticamente via artisan command.\n";
        $stubs .= " */\n\n";

        $macroCount = 0;
        $seenMacros = [];

        foreach ($trMatches as $tr) {
            $macroName = $tr[1];
            $trContent = $tr[2];

            if (isset($seenMacros[$macroName])) {
                continue;
            }
            $seenMacros[$macroName] = true;

            // Extrai a assinatura textual
            $signatureText = '';
            if (preg_match('/<div align="left">\s*<a[^>]*>[^<]+<\/a>\s*(.*?)\s*<\/div>/is', $trContent, $sigMatches)) {
                $signatureText = trim(html_entity_decode($sigMatches[1]));
            }

            // Extrai a descricao
            $description = '';
            preg_match_all('/<td class="macros"[^>]*>(.*?)<\/td>/is', $trContent, $tdMatches);
            if (isset($tdMatches[1][1])) {
                $description = trim(strip_tags(html_entity_decode($tdMatches[1][1])));
                $description = preg_replace('/\s+/', ' ', $description);
            }

            // Mapeamento de parametros
            $paramsMeta = [];
            $rawSig = $signatureText;
            
            if (str_starts_with($rawSig, '(') && str_ends_with($rawSig, ')')) {
                $rawSig = substr($rawSig, 1, -1);
            }
            $rawSig = trim($rawSig);

            if ($rawSig !== '') {
                $parts = preg_split('/,\s*/', $rawSig);
                foreach ($parts as $index => $part) {
                    $part = trim($part);
                    if (empty($part)) continue;

                    $isRef = false;
                    $isVariadic = false;
                    $type = 'mixed';
                    $default = null;

                    if (str_contains($part, '{Meu_Campo}') || str_contains($part, '{Campo}') || str_contains($part, 'campo')) {
                        $varName = 'field';
                        $type = 'mixed';
                    } elseif ($part === 'on/off' || $part === "'on' ou 'off'" || $part === 'on ou off' || str_contains($part, 'status')) {
                        $varName = 'status';
                        $type = 'string';
                    } elseif (str_contains($part, 'dataset')) {
                        $varName = 'dataset';
                        $isRef = true;
                        $type = 'array|false';
                    } elseif (str_contains($part, '...')) {
                        $varName = 'args';
                        $isVariadic = true;
                        $type = 'mixed';
                    } else {
                        $cleanPart = str_replace(['"', "'", '$', '[', ']', '(', ')', '='], '', $part);
                        $cleanPart = preg_replace('/[^a-zA-Z0-9_]/', '_', $cleanPart);
                        $cleanPart = strtolower(trim($cleanPart, '_'));
                        
                        if (empty($cleanPart) || is_numeric(substr($cleanPart, 0, 1))) {
                            $varName = 'param' . ($index + 1);
                        } else {
                            $varName = $cleanPart;
                        }
                    }

                    // Inferir tipo a partir do nome do parametro
                    $lowerPart = strtolower($part);
                    if ($type === 'mixed') {
                        if (str_contains($lowerPart, 'sql') || str_contains($lowerPart, 'comando') || str_contains($lowerPart, 'string') || str_contains($lowerPart, 'texto') || str_contains($lowerPart, 'mensagem') || str_contains($lowerPart, 'message') || str_contains($lowerPart, 'msg')) {
                            $type = 'string';
                        } elseif (str_contains($lowerPart, 'conex') || str_contains($lowerPart, 'connection') || str_contains($lowerPart, 'server') || str_contains($lowerPart, 'user') || str_contains($lowerPart, 'pwd') || str_contains($lowerPart, 'pass') || str_contains($lowerPart, 'url') || str_contains($lowerPart, 'apl') || str_contains($lowerPart, 'destino') || str_contains($lowerPart, 'target')) {
                            $type = 'string';
                        } elseif (str_contains($lowerPart, 'arr_') || str_contains($lowerPart, 'array') || str_contains($lowerPart, 'options')) {
                            $type = 'array';
                        } elseif (str_contains($lowerPart, 'true_false') || str_contains($lowerPart, 'true/false') || str_contains($lowerPart, 'boolean')) {
                            $type = 'bool';
                        } elseif (str_contains($lowerPart, 'cor') || str_contains($lowerPart, 'color')) {
                            $type = 'string';
                        }
                    }

                    // Evita variaveis duplicadas na assinatura
                    $suffix = 1;
                    $testVar = $varName;
                    while (in_array($testVar, array_column($paramsMeta, 'name'))) {
                        $testVar = $varName . ($suffix++);
                    }

                    $paramsMeta[] = [
                        'name' => $testVar,
                        'type' => $type,
                        'isRef' => $isRef,
                        'isVariadic' => $isVariadic,
                        'default' => $default
                    ];
                }
            }

            // Trata macros especificas conhecidas que possuem assinaturas complexas
            if ($macroName === 'sc_lookup' || $macroName === 'sc_select') {
                $paramsMeta = [
                    ['name' => 'dataset', 'type' => 'array|false', 'isRef' => true, 'isVariadic' => false],
                    ['name' => 'sql', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                    ['name' => 'connection', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                ];
            } elseif ($macroName === 'sc_exec_sql') {
                $paramsMeta = [
                    ['name' => 'sql', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                    ['name' => 'connection', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                ];
            } elseif ($macroName === 'sc_field_display' || $macroName === 'sc_field_readonly') {
                $paramsMeta = [
                    ['name' => 'field', 'type' => 'mixed', 'isRef' => false, 'isVariadic' => false],
                    ['name' => 'status', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                ];
            } elseif ($macroName === 'sc_field_color') {
                $paramsMeta = [
                    ['name' => 'field', 'type' => 'mixed', 'isRef' => false, 'isVariadic' => false],
                    ['name' => 'color', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                ];
            } elseif ($macroName === 'sc_alert') {
                $paramsMeta = [
                    ['name' => 'message', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                ];
            } elseif ($macroName === 'sc_redir') {
                $paramsMeta = [
                    ['name' => 'apl', 'type' => 'string', 'isRef' => false, 'isVariadic' => false],
                    ['name' => 'params', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                    ['name' => 'target', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                    ['name' => 'error', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                    ['name' => 'target_dest', 'type' => 'string', 'isRef' => false, 'isVariadic' => false, 'default' => "''"],
                ];
            }

            // Escreve a Docstring e a assinatura da funcao no stub
            $stubs .= "/**\n";
            if (!empty($description)) {
                $stubs .= " * " . wordwrap($description, 75, "\n * ") . "\n *\n";
            }

            foreach ($paramsMeta as $meta) {
                $stubs .= " * @param {$meta['type']} " . ($meta['isRef'] ? '&' : '') . ($meta['isVariadic'] ? '...' : '') . " \$" . $meta['name'] . "\n";
            }

            $stubs .= " * @link https://www.scriptcase.com.br/docs/pt_br/v9/manual/14-macros/02-macros/#$macroName\n";
            $stubs .= " */\n";

            $formattedParams = [];
            foreach ($paramsMeta as $meta) {
                $pStr = '';
                
                if ($meta['type'] !== 'mixed' && !str_contains($meta['type'], '|')) {
                    $pStr .= $meta['type'] . ' ';
                }

                if ($meta['isRef']) {
                    $pStr .= '&';
                }
                if ($meta['isVariadic']) {
                    $pStr .= '...';
                }
                
                $pStr .= '$' . $meta['name'];
                
                if (isset($meta['default'])) {
                    $pStr .= ' = ' . $meta['default'];
                }
                
                $formattedParams[] = $pStr;
            }

            $paramsStr = implode(', ', $formattedParams);
            $stubs .= "function $macroName($paramsStr) {}\n\n";

            $macroCount++;
        }

        file_put_contents($outputPath, $stubs);

        $this->info("Concluido com sucesso! {$macroCount} macros do Scriptcase mapeadas em: {$outputPath}");
        return Command::SUCCESS;
    }
}
