import * as fs from 'fs';
import * as path from 'path';

interface TemplateComponents {
    header: string;
    footer: string;
}

// Read template files fresh each time
const getTemplates = (workspaceRoot: string): TemplateComponents => {
    const templatesDir = path.join(workspaceRoot, 'packages/client/public/templates');
    return {
        header: fs.readFileSync(path.join(templatesDir, 'header.html'), 'utf8'),
        footer: fs.readFileSync(path.join(templatesDir, 'footer.html'), 'utf8')
    };
};

function indentContent(content: string, indentLevel: number): string {
    const indent = ' '.repeat(indentLevel);
    return content.split('\n').map(line => 
        line.trim() ? indent + line : line
    ).join('\n');
}

export interface TemplatesModule {
    processTemplate: (content: string, workspaceRoot: string, isDev?: boolean) => string;
}

const templates: TemplatesModule = {
    processTemplate: function(content: string, workspaceRoot: string, isDev = false): string {
        const components = getTemplates(workspaceRoot);
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