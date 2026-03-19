import { defineConfig, Plugin } from 'vite';
import { readFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';

function htmlTemplatePlugin(): Plugin {
    const templates: Record<string, string> = {};

    return {
        name: 'html-template-inject',
        buildStart() {
            const dir = resolve(__dirname, 'public/templates');
            templates['<!-- HEADER -->'] = readFileSync(`${dir}/header.html`, 'utf-8');
            templates['<!-- FOOTER -->'] = readFileSync(`${dir}/footer.html`, 'utf-8');
            templates['<!-- CHAT-MARQUEE -->'] = readFileSync(`${dir}/chat-marquee.html`, 'utf-8');
        },
        transformIndexHtml(html) {
            for (const [marker, fragment] of Object.entries(templates)) {
                const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                html = html.replace(new RegExp(`([ \\t]*)${escaped}`, 'g'), (_, indent) =>
                    fragment
                        .split('\n')
                        .map((line) => indent + line)
                        .join('\n')
                );
            }
            return html;
        },
    };
}

function getPageInputs(): Record<string, string> {
    const pagesDir = resolve(__dirname, 'pages');
    return Object.fromEntries(
        readdirSync(pagesDir)
            .filter((f) => f.endsWith('.html'))
            .map((f) => [`pages/${basename(f, '.html')}`, resolve(pagesDir, f)])
    );
}

export default defineConfig({
    plugins: [htmlTemplatePlugin()],
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                ...getPageInputs(),
            },
        },
    },
});
