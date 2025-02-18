import * as fs from 'fs';
import * as path from 'path';

interface TemplateComponents {
    header: string;
    footer: string;
}

// Get the source directory for templates
const getSourceDir = () => {
    const buildDir = path.join(__dirname, '../../../../..');
    return path.join(buildDir, 'packages/client/public');
};

// Read template components
const components: TemplateComponents = {
    header: fs.readFileSync(path.join(getSourceDir(), 'templates/header.html'), 'utf8'),
    footer: fs.readFileSync(path.join(getSourceDir(), 'templates/footer.html'), 'utf8')
};

// Process all HTML files
function processTemplates(): void {
    // Process index.html
    processFile(path.join(getSourceDir(), 'index.html'), 'index.html');
    
    // Process pages directory
    const pagesDir = path.join(getSourceDir(), 'pages');
    processDirectory(pagesDir);
}

function processDirectory(dir: string): void {
    fs.readdirSync(dir).forEach((file: string) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Create the same directory structure in dist
            const relativePath = path.relative(path.join(__dirname, '../../../..'), fullPath);
            const distPath = path.join(__dirname, '../../../../.vercel/output/static', relativePath);
            if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath, { recursive: true });
            }
            processDirectory(fullPath);
        } else if (path.extname(file) === '.html') {
            const relativePath = path.relative(path.join(__dirname, '../../../..'), fullPath);
            processFile(fullPath, relativePath);
        }
    });
}

function indentContent(content: string, indentLevel: number): string {
    const indent = ' '.repeat(indentLevel);
    return content.split('\n').map(line => 
        line.trim() ? indent + line : line
    ).join('\n');
}

function processFile(filePath: string, relativePath: string): void {
    console.log(`Processing ${relativePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace template placeholders with properly indented content
    content = content.replace(/^(\s*)<!-- HEADER -->/m, (match, indent) => {
        const headerContent = indentContent(components.header, indent.length);
        return `${indent}<header class="header">\n${headerContent}\n${indent}</header>`;
    });
    
    content = content.replace(/^(\s*)<!-- FOOTER -->/m, (match, indent) => {
        return `${indent}${indentContent(components.footer, indent.length)}`;
    });
    
    // Write processed file to dist
    const distPath = path.join(__dirname, '../../../../.vercel/output/static', relativePath);
    const distDir = path.dirname(distPath);
    
    // Ensure directory exists
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.writeFileSync(distPath, content);
    console.log(`Created ${relativePath}`);
}

export interface TemplatesModule {
    buildTemplates: () => void;
    processTemplate: (content: string, isDev?: boolean) => string;
}

const templates: TemplatesModule = {
    buildTemplates: function(): void {
        processTemplates();
    },
    processTemplate: function(content: string, isDev = false): string {
        content = content.replace(/^(\s*)<!-- HEADER -->/m, (match, indent) => {
            const headerContent = indentContent(components.header, indent.length);
            return `${indent}<header class="header">\n${headerContent}\n${indent}</header>`;
        });
        
        content = content.replace(/^(\s*)<!-- FOOTER -->/m, (match, indent) => {
            return `${indent}${indentContent(components.footer, indent.length)}`;
        });
        
        return content;
    }
};

export default templates; 