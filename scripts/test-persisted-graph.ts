declare const process: any;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { validateGraphIntegrity } from '../src/backend/graphDiskStore.ts';
import { GraphDataLoader } from '../src/services/GraphDataLoader.ts';
import type { PersistedKnowledgeGraphDocument } from '../src/backend/graphDiskStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('  PhyLife: Persisted Back-End Knowledge Graph Test Suite');
  console.log('================================================================\n');

  const publicJsonPath = path.join(rootDir, 'public', 'data', 'phylogeny_graph.json');

  // Test 1: Disk file existence
  console.log('🔷 Test Group 1: Disk File Verification');
  assert(fs.existsSync(publicJsonPath), 'Persisted Knowledge Graph JSON exists', publicJsonPath);

  const rawPublic = fs.readFileSync(publicJsonPath, 'utf-8');
  const doc: PersistedKnowledgeGraphDocument = JSON.parse(rawPublic);

  // Test 2: Schema & Metadata validation
  console.log('\n🔷 Test Group 2: Document Schema & Metadata');
  assert(doc.version.includes('persisted-kg'), 'Version indicates persisted KG', doc.version);
  assert(doc.root_id === 'div_luca', 'Root node is LUCA', doc.root_id);
  assert(doc.metadata !== undefined, 'Metadata block is present');
  assert(doc.metadata.schemaVersion === '2.0.0', 'Schema version is 2.0.0');
  assert(doc.metadata.sources.length >= 5, 'Includes 5+ authoritative scientific sources');
  assert(doc.taxa.length >= 40, 'Contains 40+ taxa', `Count: ${doc.taxa.length}`);
  assert(doc.divergences.length >= 20, 'Contains 20+ divergence nodes', `Count: ${doc.divergences.length}`);
  assert(doc.edges.length >= 60, 'Contains 60+ branch edges', `Count: ${doc.edges.length}`);

  // Test 3: Graph Integrity
  console.log('\n🔷 Test Group 3: Topological Integrity');
  const validation = validateGraphIntegrity(doc);
  assert(validation.isValid, 'Graph integrity check passes with zero errors');
  assert(validation.errors.length === 0, 'Zero orphan edges or dangling parents');

  // Test 4: In-Memory GraphStore Ingestion & Querying
  console.log('\n🔷 Test Group 4: Graph Engine Hydration & MRCA Traversals');
  const store = new PhyGraphStore();
  store.importJSON({
    version: doc.version,
    timestamp: doc.timestamp,
    root_id: doc.root_id,
    taxa: doc.taxa,
    divergences: doc.divergences,
    edges: doc.edges,
    synonyms: doc.synonyms
  });

  const stats = store.getStatistics();
  assert(stats.totalNodes === doc.taxa.length + doc.divergences.length, 'Total nodes match doc');
  assert(stats.oldestDivergenceMya >= 4000, 'Oldest divergence is >= 4000 Ma (Hadean LUCA)');

  // MRCA query on persisted graph
  const mrcaHumanLion = store.findMRCA('tax_homo_sapiens', 'tax_panthera_leo');
  assert(mrcaHumanLion !== null, 'Human vs Lion MRCA computed');
  assert(mrcaHumanLion?.divergence_mya === 95, 'Human vs Lion divergence is 95 Ma');

  const mrcaHumanEcoli = store.findMRCA('tax_homo_sapiens', 'tax_escherichia_coli');
  assert(mrcaHumanEcoli !== null, 'Human vs E. coli MRCA computed');
  assert(mrcaHumanEcoli?.mrca_node.id === 'div_luca', 'Human vs E. coli MRCA is LUCA');

  // Test 5: GraphDataLoader Fallback & Hydration
  console.log('\n🔷 Test Group 5: GraphDataLoader Fallback');
  const loader = new GraphDataLoader();
  const fallbackStore = new PhyGraphStore();
  const status = await loader.loadInitialGraph(fallbackStore);
  assert(status !== null, 'DataLoader returns status');
  assert(status.nodeCount > 0, 'DataLoader populated nodes into store');

  console.log('\n================================================================');
  console.log(`🎉 PERSISTED GRAPH TEST SUITE: ${failedTests === 0 ? '100% PASS' : 'FAILED'}`);
  console.log(`Total Assertions: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
