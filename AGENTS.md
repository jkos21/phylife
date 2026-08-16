# PhyLife Agent & Knowledge Graph Guidelines

## 1. Canonical Metadata Format
- The single source of truth for persisted graph metadata is `public/data/phylife_kg.jsonld`.
- Do not create redundant JSON, TTL, or GraphML duplicate files across the repository.
- `public/data/phylife_kg.jsonld` conforms to W3C JSON-LD standards (with Darwin Core `dwc:`, RDF `rdf:`, and `schema:` vocabularies) and is fetched directly by `GraphDataLoader` at `/data/phylife_kg.jsonld`.

## 2. Clean Starts Over Migrations
- Embedded SQLite databases must be regenerated deterministically from code via `npm run graph:seed`.
- Prefer clean starts over database migrations: `seedKnowledgeGraphDatabase({ cleanStart: true })` drops old tables and reconstructs schema and indexes cleanly.
- Never commit binary database files or journals (`*.sqlite`, `*.sqlite-wal`, `*.sqlite-shm`, `*.db`) to source control.

## 3. Node.js Script Types & Imports
- In a Vite setup with `moduleResolution: "bundler"`, Node.js scripts in `scripts/` must use explicit named imports from `node:fs` and `node:path` (e.g. `import { existsSync, statSync } from 'node:fs'`).
- Always run `npm test` and `npm run build` (`tsc && vite build`) to verify both TypeScript types and Vite bundling integrity before finishing tasks.
