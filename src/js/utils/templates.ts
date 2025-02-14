import * as fs from 'fs';
import * as path from 'path';

interface TemplateComponents {
    header: string;
    footer: string;
}

// Read template components
const components: TemplateComponents = {
    header: fs.readFileSync(path.join(__dirname, '../../../templates/header.html'), 'utf8'),
    footer: fs.readFileSync(path.join(__dirname, '../../../templates/footer.html'), 'utf8')
};

// Process all HTML files
function processTemplates(): void {
    // Process index.html
    processFile(path.join(__dirname, '../../../index.html'), 'index.html');
    
    // Process pages directory
    const pagesDir = path.join(__dirname, '../../../pages');
    processDirectory(pagesDir);
}

function processDirectory(dir: string): void {
    fs.readdirSync(dir).forEach((file: string) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Create the same directory structure in dist
            const relativePath = path.relative(path.join(__dirname, '../../..'), fullPath);
            const distPath = path.join(__dirname, '../../../dist', relativePath);
            if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath, { recursive: true });
            }
            processDirectory(fullPath);
        } else if (path.extname(file) === '.html') {
            const relativePath = path.relative(path.join(__dirname, '../../..'), fullPath);
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
    const distPath = path.join(__dirname, '../../../dist', relativePath);
    const distDir = path.dirname(distPath);
    
    // Ensure directory exists
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.writeFileSync(distPath, content);
    console.log(`Created ${relativePath}`);
}

// Export with proper TypeScript type
export interface TemplatesModule {
    buildTemplates: () => void;
}

const templates: TemplatesModule = {
    buildTemplates: function(): void {
        processTemplates();
    }
};

module.exports = templates; 