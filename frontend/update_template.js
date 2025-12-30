import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestPath = path.resolve(__dirname, '../static/dist/.vite/manifest.json');
const templatesToUpdate = [
    path.resolve(__dirname, '../administrar/templates/react_app.html'),
    path.resolve(__dirname, '../administrar/templates/administrar/base.html')
];

try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    const mainEntry = manifest['index.html'];

    if (!mainEntry || !mainEntry.file) {
        console.error('Error: Could not find index.html entry in manifest.json');
        process.exit(1);
    }

    const mainFile = mainEntry.file;
    const cssFile = mainEntry.css ? mainEntry.css[0] : null;

    console.log(`New JS File: ${mainFile}`);
    if (cssFile) console.log(`New CSS File: ${cssFile}`);

    templatesToUpdate.forEach(templatePath => {
        if (!fs.existsSync(templatePath)) {
            console.warn(`Warning: Template not found at ${templatePath}`);
            return;
        }

        let templateContent = fs.readFileSync(templatePath, 'utf8');
        let updated = false;

        // Regex to match existing script tag
        const scriptRegex = /<script type="module" crossorigin src="\/static\/dist\/assets\/main-.*\.js"><\/script>/;
        const newScriptTag = `<script type="module" crossorigin src="/static/dist/${mainFile}"></script>`;

        if (templateContent.match(scriptRegex)) {
            templateContent = templateContent.replace(scriptRegex, newScriptTag);
            updated = true;
        }

        // Optional: Update CSS if needed
        if (cssFile) {
            const cssRegex = /<link rel="stylesheet" crossorigin href="\/static\/dist\/assets\/main-.*\.css">/;
            const newCssTag = `<link rel="stylesheet" crossorigin href="/static/dist/${cssFile}">`;
            if (templateContent.match(cssRegex)) {
                templateContent = templateContent.replace(cssRegex, newCssTag);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(templatePath, templateContent, 'utf8');
            console.log(`Successfully updated ${path.basename(templatePath)}`);
        } else {
            console.log(`No changes needed or tag not found in ${path.basename(templatePath)}`);
        }
    });

} catch (error) {
    console.error('Error updating templates:', error);
    process.exit(1);
}
