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
    const isBackground = entry.includes('background.ts');
    const ctx = await esbuild.context({
      entryPoints: [entry],
      bundle: true,
      outfile: out,
      platform: 'browser',
      target: 'chrome100',
      format: isBackground ? 'esm' : 'iife',
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

  // Copy images folder
  if (fs.existsSync('images')) {
    if (!fs.existsSync('dist/images')) {
      fs.mkdirSync('dist/images', { recursive: true });
    }
    const imageFiles = fs.readdirSync('images');
    for (const file of imageFiles) {
      fs.copyFileSync(path.join('images', file), path.join('dist/images', file));
      console.log(`Copied icon asset: ${file}`);
    }
  }

  // Copy inject folder (main-world scripts that aren't bundled by esbuild)
  if (!fs.existsSync('dist/inject')) {
    fs.mkdirSync('dist/inject', { recursive: true });
  }
  for (const file of fs.readdirSync('inject')) {
    if (!file.endsWith('.js')) continue;
    fs.copyFileSync(path.join('inject', file), path.join('dist/inject', file));
    console.log(`Copied inject script: ${file}`);
  }

  // Copy vendor folder
  if (fs.existsSync('src/vendor')) {
    if (!fs.existsSync('dist/vendor')) {
      fs.mkdirSync('dist/vendor', { recursive: true });
    }
    const vendorFiles = fs.readdirSync('src/vendor');
    for (const file of vendorFiles) {
      fs.copyFileSync(path.join('src/vendor', file), path.join('dist/vendor', file));
      console.log(`Copied vendor asset: ${file}`);
    }
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
