
# Templating System
1. Template Files:
- `templates/header.html` contains the shared header
- `templates/footer.html` contains the shared footer

2. Page Structure:
- Pages use <!-- HEADER --> and <!-- FOOTER --> placeholders
- The templating script replaces these with the actual content

3. Build Process:
- `tsc` compiles all TypeScript files, including our templating script
- `node dist/js/build.js` runs our compiled templating script
- `npm run copy-static` copies the static assets

4. Development:
- Edit shared components in the templates directory
- Use the placeholders in your HTML files
- Run the build command to generate the final files

To create a new page:
1. Create a new HTML file in the pages directory
2. Include the <!-- HEADER --> and <!-- FOOTER --> placeholders
3. Add your page-specific content
4. Run the build command

The templating system will:
   - Process all HTML files in the project
   - Replace the placeholders with the shared components
   - Maintain the directory structure in the dist folder
   - Keep all assets and paths working correctly