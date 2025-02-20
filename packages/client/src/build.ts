import templates from './core/templates.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get workspace root directory
const getWorkspaceRoot = () => {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    // Go up four levels: dist/js -> dist -> client -> packages -> root
    const rootDir = path.resolve(currentDir, '../../../..');
    return rootDir;
};

// Ensure output directories exist
const staticDir = path.join(getWorkspaceRoot(), 'packages/client/dist');
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
}

// Copy static assets
const copyAssets = (isDev = false) => {
    const publicDir = path.join(getWorkspaceRoot(), 'packages/client/public');
    const excludeDirs = ['js']; // Directories to exclude from copying
    
    // Copy all contents from public directory to static directory
    if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir);
        files.forEach(file => {
            const srcPath = path.join(publicDir, file);
            const destPath = path.join(staticDir, file);
            
            // Skip excluded directories
            if (excludeDirs.includes(file)) {
                return;
            }

            try {
                if (fs.statSync(srcPath).isDirectory()) {
                    if (!fs.existsSync(destPath)) {
                        fs.mkdirSync(destPath, { recursive: true });
                    }
                    fs.cpSync(srcPath, destPath, { recursive: true });
                } else {
                    // In dev mode, only copy if file has changed
                    if (!isDev || !fs.existsSync(destPath) || 
                        fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
                        fs.copyFileSync(srcPath, destPath);
                        if (isDev) console.log(`Updated: ${file}`);
                    }
                }
            } catch (error) {
                console.error(`Error copying ${file}:`, error);
            }
        });
    } else {
        console.error('Public directory not found:', publicDir);
    }
};

// Process HTML files
const processHtmlFiles = (isDev = false) => {
    const processFile = (filePath: string) => {
        try {
            // Read from source directory
            const content = fs.readFileSync(filePath, 'utf-8');
            const processed = templates.processTemplate(content, getWorkspaceRoot(), isDev);
            
            // Get the relative path from the public directory
            const publicDir = path.join(getWorkspaceRoot(), 'packages/client/public');
            const relativePath = path.relative(publicDir, filePath);
            
            // Write to output directory
            const outputPath = path.join(staticDir, relativePath);
            const outputDir = path.dirname(outputPath);
            
            // Ensure output directory exists
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            fs.writeFileSync(outputPath, processed);
            if (isDev) console.log(`Processed: ${relativePath}`);
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    };

    const walkDir = (dir: string) => {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    walkDir(filePath);
                } else if (file.endsWith('.html')) {
                    processFile(filePath);
                }
            });
        } catch (error) {
            console.error(`Error walking directory ${dir}:`, error);
        }
    };

    walkDir(path.join(getWorkspaceRoot(), 'packages/client/public'));
};

// Build process
async function build() {
    const isDev = process.env.NODE_ENV === 'development';
    
    try {
        if (!isDev) console.log('Starting build process...');
        
        // Copy static assets
        if (!isDev) console.log('Copying static assets...');
        copyAssets(isDev);
        
        // Process templates
        if (!isDev) console.log('Processing HTML templates...');
        processHtmlFiles(isDev);
        
        if (!isDev) console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// If running directly (not imported as a module)
const isMainModule = () => {
    try {
        return import.meta.url.startsWith('file:') && 
               import.meta.url === new URL(process.argv[1], 'file:').href;
    } catch {
        return false;
    }
};

if (isMainModule()) {
    build();
}

export { build }; 