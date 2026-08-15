declare const process: any;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { pipelineRunner } from '../src/pipeline/pipelineRunner.ts';
import { createPersistedGraphDocument, validateGraphIntegrity } from '../src/backend/graphDiskStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetPublicDir = path.join(rootDir, 'public', 'data');
const targetBackendDir = path.join(rootDir, 'data');
const publicFile = path.join(targetPublicDir, 'phylogeny_graph.json');
const backendFile = path.join(targetBackendDir, 'phylogeny_graph.json');

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

  const graphDoc = createPersistedGraphDocument(taxa, divergences, edges, synonyms, version);
  const validation = validateGraphIntegrity(graphDoc);

  if (!validation.isValid) {
    console.error('❌ Validation of refreshed graph failed:');
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  // Ensure directories exist
  fs.mkdirSync(targetPublicDir, { recursive: true });
  fs.mkdirSync(targetBackendDir, { recursive: true });

  const serialized = JSON.stringify(graphDoc, null, 2);
  fs.writeFileSync(publicFile, serialized, 'utf-8');
  fs.writeFileSync(backendFile, serialized, 'utf-8');

  console.log('\n====================================================');
  console.log('🎉 REFRESH & DISK PERSISTENCE SUCCESSFUL');
  console.log('====================================================');
  console.log(`- Dataset Version: ${graphDoc.version}`);
  console.log(`- Total Nodes: ${graphDoc.metadata.metrics.totalNodes}`);
  console.log(`- Total Edges: ${graphDoc.metadata.metrics.totalEdges}`);
  console.log(`- Taxa Count: ${graphDoc.metadata.metrics.totalTaxa}`);
  console.log(`- Divergences: ${graphDoc.metadata.metrics.totalDivergences}`);
  console.log(`- Output Files:`);
  console.log(`  -> ${publicFile}`);
  console.log(`  -> ${backendFile}`);
}

refreshGraph().catch(err => {
  console.error('Fatal error during graph refresh:', err);
  process.exit(1);
});
