declare const process: any;
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { pipelineRunner } from '../src/pipeline/pipelineRunner.ts';
import { createPersistedGraphDocument, validateGraphIntegrity } from '../src/backend/graphDiskStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetPublicDir = path.join(rootDir, 'public', 'data');

async function refreshGraph() {

  console.log('====================================================');
  console.log('  PhyLife: Manual Knowledge Graph Refresh & Sync');
  console.log('====================================================\n');

  const store = new PhyGraphStore();

  pipelineRunner.onProgress(progress => {
    if (progress.logs.length > 0) {
      const last = progress.logs[progress.logs.length - 1];
      console.log(`[${last.timestamp}] [${last.level.toUpperCase()}] [${last.step}] ${last.message}`);
    }
  });

  console.log('⏳ Running 6-step ETL reconciliation pipeline...');
  const success = await pipelineRunner.runSync(store, {
    source: 'bundled_seed',
    includeMedia: true,
    enrichWFO: true,
    enrichMycoBank: true,
    enrichGBIF: false,
    enrichTimeTree: true
  });

  if (!success) {
    console.error('❌ Pipeline synchronization failed.');
    process.exit(1);
  }

  const exported = store.exportJSON();
  const taxa = exported.taxa;
  const divergences = exported.divergences;
  const edges = exported.edges;
  const synonyms = exported.synonyms || [];

  const timestamp = new Date().toISOString();
  const version = `1.3.0-persisted-kg-${timestamp.split('T')[0]}`;

  const graphDoc = createPersistedGraphDocument(taxa, divergences, edges, synonyms, version, timestamp);
  const validation = validateGraphIntegrity(graphDoc);

  if (!validation.isValid) {
    console.error('❌ Validation of refreshed graph failed:');
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const publicFile = path.join(targetPublicDir, 'phylife_kg.jsonld');
  const sqliteFile = path.join(rootDir, 'data', 'phylife_kg.sqlite');

  // Ensure directories exist
  fs.mkdirSync(targetPublicDir, { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'data'), { recursive: true });

  const serialized = JSON.stringify(graphDoc, null, 2);
  fs.writeFileSync(publicFile, serialized, 'utf-8');

  // Update SQLite DB
  const { SQLiteKnowledgeGraph } = await import('../src/backend/sqliteGraphEngine.ts');
  const sqliteKG = new SQLiteKnowledgeGraph(sqliteFile);
  sqliteKG.persistGraph(graphDoc);
  const stats = sqliteKG.getStats();
  sqliteKG.close();

  console.log('\n====================================================');
  console.log('🎉 REFRESH & DISK PERSISTENCE SUCCESSFUL');
  console.log('====================================================');
  console.log(`- Dataset Version: ${graphDoc.version}`);
  console.log(`- Total Nodes: ${graphDoc.metadata.metrics.totalNodes}`);
  console.log(`- Total Edges: ${graphDoc.metadata.metrics.totalEdges}`);
  console.log(`- Taxa Count: ${graphDoc.metadata.metrics.totalTaxa}`);
  console.log(`- Divergences: ${graphDoc.metadata.metrics.totalDivergences}`);
  console.log(`- JSON-LD File: ${publicFile}`);
  console.log(`- SQLite Database: ${sqliteFile} (${stats.totalTriples} RDF triples)`);
}


refreshGraph().catch(err => {
  console.error('Fatal error during graph refresh:', err);
  process.exit(1);
});
