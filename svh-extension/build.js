const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watch = process.argv.includes('--watch');

const entries = [
  { entry: 'src/background.ts', out: 'dist/background.js' },
  { entry: 'src/content/injector.ts', out: 'dist/content/injector.js' },
  { entry: 'src/options/options.ts', out: 'dist/options.js' },
  { entry: 'src/popup/popup.ts', out: 'dist/popup.js' },
  { entry: 'src/content/sidebar/sidebar.tsx', out: 'dist/sidebar.js' },
];

async function build() {
  for (const { entry, out } of entries) {
    const ctx = await esbuild.context({
      entryPoints: [entry],
      bundle: true,
      outfile: out,
      platform: 'browser',
      target: 'chrome120',
      format: 'iife',
      tsconfig: 'tsconfig.json',
    });

    if (watch) {
      await ctx.watch();
      console.log(`Watching ${entry}...`);
    } else {
      await ctx.rebuild();
      console.log(`Built ${entry} -> ${out}`);
      await ctx.dispose();
    }
  }

  // Copy static assets
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  fs.copyFileSync('src/options/options.html', 'dist/options.html');
  fs.copyFileSync('src/popup/popup.html', 'dist/popup.html');

  // Copy inject folder
  if (!fs.existsSync('dist/inject')) {
    fs.mkdirSync('dist/inject', { recursive: true });
  }
  fs.copyFileSync('inject/fetch-patch.js', 'dist/inject/fetch-patch.js');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
