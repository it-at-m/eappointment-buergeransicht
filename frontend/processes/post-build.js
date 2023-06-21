import { generateLoaderJs } from './lib/loaderjsGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// get the directory of the current module
const dirname = path.dirname(fileURLToPath(import.meta.url));

// construct the absolute path
const absolutePath = path.resolve(dirname, '../dist/asset-manifest.json');

// read and parse manifest.json
const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));

// read filename from manifest.json
const filename1 = manifest['chunk-vendors.js'];
const filename2 = manifest['app.js'];

// generate loaderJs with the app script's filename
generateLoaderJs(filename1);
generateLoaderJs(filename2);
