import { statSync } from 'node:fs';
import { seedKnowledgeGraphDatabase } from '../src/backend/sqliteGraphEngine.ts';



async function seedDisk() {
  console.log('====================================================');
  console.log('  PhyLife: Clean-Start Knowledge Graph Seeding');
  console.log('====================================================\n');

  const result = seedKnowledgeGraphDatabase({ cleanStart: true });
  const { graphDoc, sqliteStats, jsonldPath } = result;

  console.log('✅ Graph integrity check passed.');
  console.log(`- Version: ${graphDoc.version}`);
  console.log(`- Total Nodes: ${graphDoc.metadata.metrics.totalNodes} (${graphDoc.metadata.metrics.totalTaxa} taxa, ${graphDoc.metadata.metrics.totalDivergences} divergence nodes)`);
  console.log(`- Total Edges: ${graphDoc.metadata.metrics.totalEdges}`);
  console.log(`- Domains:`, graphDoc.metadata.metrics.domainBreakdown);

  console.log(`\n💾 Clean start successful (zero redundant storage):`);
  console.log(`  -> [W3C JSON-LD Metadata]  ${jsonldPath} (${(statSync(jsonldPath).size / 1024).toFixed(1)} KB)`);
  console.log(`  -> [Native SQLite KG DB]   ${sqliteStats.dbPath} (${(sqliteStats.fileSizeBytes / 1024).toFixed(1)} KB, ${sqliteStats.totalTriples} RDF triples, ${sqliteStats.totalNodes} nodes)`);
}



seedDisk().catch(err => {
  console.error('Fatal error seeding disk:', err);
  process.exit(1);
});

