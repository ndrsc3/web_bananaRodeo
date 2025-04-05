import * as fs from 'fs';
import * as path from 'path';
//ToDo::import links from '../config/links.json' assert { type: 'json' };

interface TemplateComponents {
    header: string;
    footer: string;
    chatMarquee: string;
}

interface Links {
    [key: string]: string;
}

// Read template files fresh each time
const getTemplates = (workspaceRoot: string): TemplateComponents => {
    const templatesDir = path.join(workspaceRoot, 'packages/client/public/templates');
    return {
        header: fs.readFileSync(path.join(templatesDir, 'header.html'), 'utf8'),
        footer: fs.readFileSync(path.join(templatesDir, 'footer.html'), 'utf8'),
        chatMarquee: fs.readFileSync(path.join(templatesDir, 'chat-marquee.html'), 'utf8')
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
        
        // Process template components
        content = content.replace(/^(\s*)<!-- HEADER -->/m, (match, indent) => {
            const headerContent = indentContent(components.header, indent.length);
            return `${indent}<header class="header">\n${headerContent}\n${indent}</header>`;
        });
        
        content = content.replace(/^(\s*)<!-- FOOTER -->/m, (match, indent) => {
            const footerContent = indentContent(components.footer, indent.length);
            return `${indent}<footer class="footer">\n${footerContent}\n${indent}</footer>`;
        });

        content = content.replace(/^(\s*)<!-- CHAT-MARQUEE -->/m, (match, indent) => {
            const chatMarqueeContent = indentContent(components.chatMarquee, indent.length);
            return chatMarqueeContent;
        });

        // ToDo::Process link variables
        // content = content.replace(/<!-- VAR:([A-Z_]+) -->/g, (match, variable) => {
        //     const value = (links as Links)[variable];
        //     if (!value && isDev) {
        //         console.warn(`Link variable ${variable} not found`);
        //         return match;
        //     }
        //     return value || match;
        // });
        
        return content;
    }
};

export default templates; 