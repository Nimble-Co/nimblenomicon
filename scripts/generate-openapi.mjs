import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'src', 'data');
const outDir = path.join(root, 'public');
const outFile = path.join(outDir, 'openapi.yaml');

const slugs = fs
	.readdirSync(dataDir)
	.filter((name) => name.endsWith('.json'))
	.map((name) => name.replace(/\.json$/i, ''))
	.sort((a, b) => a.localeCompare(b));

const enumLines = slugs.map((s) => `        - ${s}`).join('\n');

const yaml = `openapi: 3.0.3
info:
  title: Nimblenomicon Data API
  version: 1.0.0
  description: |
    Static JSON API for Nimble RPG reference data (same content as src/data/*.json files).
    Each collection endpoint returns a JSON array.
    When the site is deployed with a path prefix (for example GitHub project pages), prefix these paths with that base URL.
    Discovery is at GET /api/collections (not GET /api) so static file output can place each collection at /api/{collection} without a path collision.
servers:
  - url: /
    description: Relative to the deployed site root (include the repository path segment for GitHub project pages when applicable).
paths:
  /api/collections:
    get:
      summary: List available collections
      operationId: listCollections
      responses:
        '200':
          description: Sorted list of collection identifiers
          content:
            application/json:
              schema:
                type: object
                required:
                  - collections
                properties:
                  collections:
                    type: array
                    items:
                      type: string
  /api/{collection}:
    get:
      summary: Get a data collection
      operationId: getCollection
      parameters:
        - name: collection
          in: path
          required: true
          schema:
            type: string
            enum:
${enumLines}
      responses:
        '200':
          description: JSON array of records for the requested collection
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  additionalProperties: true
        '404':
          description: Unknown collection
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, yaml, 'utf8');
