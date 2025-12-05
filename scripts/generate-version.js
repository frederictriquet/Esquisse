#!/usr/bin/env node

/**
 * Generate version.json file with build timestamp
 * This is called during the build process
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildTimestamp = process.env.VITE_BUILD_TIMESTAMP || new Date().toISOString();

const versionData = {
	buildTimestamp,
	generatedAt: new Date().toISOString()
};

const outputPath = resolve(__dirname, '../static/version.json');

try {
	writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
	console.log(`✓ Generated version.json with timestamp: ${buildTimestamp}`);
} catch (error) {
	console.error('Failed to generate version.json:', error);
	process.exit(1);
}
