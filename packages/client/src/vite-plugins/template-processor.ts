import { Plugin } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import { mkdirp } from 'mkdirp';

interface TemplateProcessorOptions {
  templatesDir: string;
  pagesDir: string;
}

export function templateProcessor(options: TemplateProcessorOptions): Plugin {
  const { templatesDir, pagesDir } = options;
  const templateCache = new Map<string, string>();

  async function copyDir(src: string, dest: string) {
    await mkdirp(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async function loadTemplate(templateName: string): Promise<string> {
    if (templateCache.has(templateName)) {
      return templateCache.get(templateName)!;
    }

    const templatePath = path.join(templatesDir, `${templateName}.html`);
    const content = await fs.readFile(templatePath, 'utf-8');
    templateCache.set(templateName, content);
    return content;
  }

  return {
    name: 'vite-plugin-template-processor',
    
    async transform(code: string, id: string) {
      // Only process HTML files in the pages directory
      if (!id.startsWith(pagesDir) || !id.endsWith('.html')) {
        return null;
      }

      let processedCode = code;

      // Process header template
      const headerTemplate = await loadTemplate('header');
      processedCode = processedCode.replace('<!-- HEADER -->', headerTemplate);

      // Process footer template
      const footerTemplate = await loadTemplate('footer');
      processedCode = processedCode.replace('<!-- FOOTER -->', footerTemplate);

      // Process chat marquee if present
      const chatMarqueeTemplate = await loadTemplate('chat-marquee');
      processedCode = processedCode.replace('<!-- CHAT-MARQUEE -->', chatMarqueeTemplate);

      // Update CSS paths to use the public directory
      processedCode = processedCode.replace(
        /<link[^>]*href=["']([^"']*\.css)["'][^>]*>/g,
        (match, cssPath) => {
          if (cssPath.startsWith('/')) {
            return match; // Already an absolute path
          }
          return match.replace(cssPath, `/styles/${cssPath}`);
        }
      );

      // Update script paths
      processedCode = processedCode.replace(
        /<script[^>]*src=["']\/src\/main\.js["'][^>]*>/g,
        '<script type="module" src="/src/main.ts"></script>'
      );

      return {
        code: processedCode,
        map: null
      };
    },

    configureServer(server) {
      // Clear template cache on template changes
      server.watcher.on('change', async (filePath) => {
        if (filePath.startsWith(templatesDir)) {
          const templateName = path.basename(filePath, '.html');
          templateCache.delete(templateName);
          
          // Trigger reload of all HTML files
          server.ws.send({ type: 'full-reload' });
        }
      });

      // Watch CSS files for changes
      server.watcher.add('**/public/styles/**/*.css');
    },

    // Copy necessary static assets
    async buildStart() {
      const publicDir = path.join(process.cwd(), 'public');
      const distDir = path.join(process.cwd(), 'dist');

      // Ensure dist directory exists
      await mkdirp(distDir);

      // Copy directories
      const dirsToCopy = ['styles', 'assets', 'templates'];
      for (const dir of dirsToCopy) {
        await copyDir(
          path.join(publicDir, dir),
          path.join(distDir, dir)
        );
      }

      // Copy root files
      const rootFiles = ['robots.txt', 'sitemap.xml'];
      for (const file of rootFiles) {
        await fs.copyFile(
          path.join(publicDir, file),
          path.join(distDir, file)
        );
      }

      // Create pages directory structure
      const pagesDir = path.join(publicDir, 'pages');
      const files = await fs.readdir(pagesDir);
      for (const file of files) {
        if (file.endsWith('.html')) {
          const pageName = file.replace('.html', '');
          const pageDir = path.join(distDir, 'pages', pageName);
          await mkdirp(pageDir);
          await fs.copyFile(
            path.join(pagesDir, file),
            path.join(pageDir, 'index.html')
          );
        }
      }
    }
  };
} 