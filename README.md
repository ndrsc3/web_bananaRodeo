# Banana Rodeo

A website for The Banana Rodeo Science Fair

![Banana Rodeo](screenshot.png)

## 🌟 Features

- **Feature 1**: 
- **Feature 2**:

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Deployment**: Vercel


## 🔍 Code Structure

```
website_bananaRodeo/
├── index.html              # Home page
├── pages/                  # All other pages
│   ├── about.html
│   ├── bananifesto.html
│   ├── contact.html
│   ├── merch.html
│   ├── events/
│   │   ├── index.html     # Main events page
│   │   ├── science-fair.html
│   │   └── competitions.html
│   └── get-involved/
│       ├── index.html     # Main get-involved page
│       ├── volunteer.html
│       ├── how-to-art.html
│       ├── sponsors.html
│       └── vendors.html
├── css/                    # Your existing CSS structure
├── assets/                 # Your images, videos, etc.
├── src/                    # TypeScript source files
│   └── js/
│       └── main.ts
├── dist/                   # Compiled files (generated)
├── package.json
└── vercel.json
└── sitemap.xml             # Sitemap for better indexing
└── robots.txt              # Robots.txt for better indexing
```

## 📦 Templating System
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

## 👤 Author

Niko Millias
- Twitter: [@ndrsc3](https://twitter.com/ndrsc3)
- GitHub: [@ndrsc3](https://github.com/ndrsc3)

## 🙏 Acknowledgments

- Inspired by my friends
- Thanks to all contributors and early adopters
- Thank you web1.0 for the inspiration

---

Made with ❤️ for The Great Big Banana in The Sky