import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildRenderer() {
  try {
    await build({
      root: resolve(__dirname, 'renderer'),
      configFile: resolve(__dirname, 'renderer/vite.config.js'),
    });
    console.log('Renderer build completed successfully!');
  } catch (error) {
    console.error('Renderer build failed:', error);
    process.exit(1);
  }
}

buildRenderer(); 