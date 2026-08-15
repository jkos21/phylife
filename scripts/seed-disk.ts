declare const process: any;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialPersistedGraph, validateGraphIntegrity } from '../src/backend/graphDiskStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetPublicDir = path.join(rootDir, 'public', 'data');
const targetBackendDir = path.join(rootDir, 'data');
const publicFile = path.join(targetPublicDir, 'phylogeny_graph.json');
const backendFile = path.join(targetBackendDir, 'phylogeny_graph.json');

async function seedDisk() {
  console.log('====================================================');
  console.log('  PhyLife: Persisting Knowledge Graph to Disk');
  console.log('====================================================\n');

  const graphDoc = getInitialPersistedGraph();
  const validation = validateGraphIntegrity(graphDoc);

  if (!validation.isValid) {
    console.error('❌ Graph integrity validation failed:');
    for (const err of validation.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log('✅ Graph integrity check passed.');
  console.log(`- Version: ${graphDoc.version}`);
  console.log(`- Total Nodes: ${graphDoc.metadata.metrics.totalNodes} (${graphDoc.metadata.metrics.totalTaxa} taxa, ${graphDoc.metadata.metrics.totalDivergences} divergence nodes)`);
  console.log(`- Total Edges: ${graphDoc.metadata.metrics.totalEdges}`);
  console.log(`- Domains:`, graphDoc.metadata.metrics.domainBreakdown);

  // Ensure directories exist
  fs.mkdirSync(targetPublicDir, { recursive: true });
  fs.mkdirSync(targetBackendDir, { recursive: true });

  const serialized = JSON.stringify(graphDoc, null, 2);
  fs.writeFileSync(publicFile, serialized, 'utf-8');
  fs.writeFileSync(backendFile, serialized, 'utf-8');

  console.log(`\n💾 Successfully persisted graph to:`);
  console.log(`  -> ${publicFile} (${(Buffer.byteLength(serialized) / 1024).toFixed(1)} KB)`);
  console.log(`  -> ${backendFile} (${(Buffer.byteLength(serialized) / 1024).toFixed(1)} KB)`);
}

seedDisk().catch(err => {
  console.error('Fatal error seeding disk:', err);
  process.exit(1);
});
