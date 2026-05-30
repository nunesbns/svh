<?php

namespace Tests\Feature;

use Tests\TestCase;

class PHPValidationControllerTest extends TestCase
{
    protected function tearDown(): void
    {
        $overwritePath = base_path('pint-overwrite.json');
        if (file_exists($overwritePath)) {
            @unlink($overwritePath);
        }
        parent::tearDown();
    }

    public function test_format_code_uses_default_pint_config(): void
    {
        $code = "<?php\n\$a = [1,2,3];\n";
        
        $response = $this->withoutMiddleware()
            ->postJson('/api/v1/format-php', [
                'content' => $code
            ]);

        $response->assertStatus(200);
        
        // Ensure returning structure or formatted content
        $result = $response->json();
        
        // Laravel preset adds spaces in arrays: [1, 2, 3]
        $this->assertStringContainsString('1, 2, 3', $result['content'] ?? '');
    }

    public function test_format_code_uses_overwrite_config(): void
    {
        // Create an overwrite config setting the preset to 'empty' (which applies no formatting by default)
        $overwriteConfig = [
            'preset' => 'empty'
        ];

        file_put_contents(base_path('pint-overwrite.json'), json_encode($overwriteConfig));

        $code = "<?php\n\$a = [1,2,3];\n";

        $response = $this->withoutMiddleware()
            ->postJson('/api/v1/format-php', [
                'content' => $code
            ]);

        $response->assertStatus(200);
        $result = $response->json();

        // Empty preset should NOT format array spaces
        $this->assertStringContainsString('[1,2,3]', $result['content'] ?? '');
    }
}
