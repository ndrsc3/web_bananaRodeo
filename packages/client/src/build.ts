import templates from './core/templates';
import * as fs from 'fs';
import * as path from 'path';

// Ensure output directories exist
const staticDir = path.join(__dirname, '../../../.vercel/output/static');
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
}

// Copy static assets
const copyAssets = () => {
    const assets = [
        { src: 'css', dest: 'css' },
        { src: 'assets', dest: 'assets' },
        { src: 'pages', dest: 'pages' },
        { src: 'index.html', dest: 'index.html' },
        { src: 'robots.txt', dest: 'robots.txt' },
        { src: 'sitemap.xml', dest: 'sitemap.xml' }
    ];

    assets.forEach(({ src, dest }) => {
        const srcPath = path.join(__dirname, '../../../', src);
        const destPath = path.join(staticDir, dest);
        
        if (fs.existsSync(srcPath)) {
            if (fs.statSync(srcPath).isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                fs.cpSync(srcPath, destPath, { recursive: true });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
            console.log(`Copied ${src} to ${dest}`);
        }
    });
};

// Process HTML files
const processHtmlFiles = () => {
    const processFile = (filePath: string) => {
        const content = fs.readFileSync(filePath, 'utf-8');
        const processed = templates.processTemplate(content);
        fs.writeFileSync(filePath, processed);
    };

    const walkDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.html')) {
                processFile(filePath);
            }
        });
    };

    walkDir(staticDir);
};

// Build process
async function build() {
    try {
        console.log('Starting build process...');
        
        // Copy static assets
        console.log('Copying static assets...');
        copyAssets();
        
        // Process templates
        console.log('Processing HTML templates...');
        processHtmlFiles();
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 