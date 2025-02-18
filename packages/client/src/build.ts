import templates from './core/templates';
import * as fs from 'fs';
import * as path from 'path';

// Get workspace root directory
const getWorkspaceRoot = () => path.join(__dirname, '../../../../');

// Ensure output directories exist
const staticDir = path.join(getWorkspaceRoot(), '.vercel/output/static');
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
            const content = fs.readFileSync(filePath, 'utf-8');
            const processed = templates.processTemplate(content, isDev);
            fs.writeFileSync(filePath, processed);
            if (isDev) console.log(`Processed: ${path.basename(filePath)}`);
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

    walkDir(staticDir);
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
if (require.main === module) {
    build();
}

export { build }; 