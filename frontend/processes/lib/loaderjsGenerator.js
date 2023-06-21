import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function generateLoaderJs(filename) {
    // read contents of loader.js as string
    const loaderJs = fs.readFileSync(`${__dirname}/loader.js`, {encoding: 'utf-8'});
    // replace the correct placeholder with the actual filename
    const loaderJsReplaced = loaderJs.replace('{{filename}}', filename);
    // write script to the dist folder as loader.js
    fs.appendFileSync(path.resolve('./dist/loader.js'), loaderJsReplaced, {encoding: 'utf-8'});
}
