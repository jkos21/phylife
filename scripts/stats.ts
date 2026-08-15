declare const process: any;
import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { SEED_DATA } from '../src/pipeline/seedData.ts';

async function main() {
  const store = new PhyGraphStore();
  store.importJSON({
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    root_id: 'div_luca',
    taxa: SEED_DATA.taxa,
    divergences: SEED_DATA.divergences,
    edges: SEED_DATA.edges,
    synonyms: SEED_DATA.synonyms
  });

  const stats = store.getStatistics();
  console.log('\n=== PhyLife Local Graph Database Summary ===');
  console.log(`Root Node: ${stats.rootId}`);
  console.log(`Total Nodes: ${stats.totalNodes}`);
  console.log(`  - Taxon Nodes: ${stats.totalTaxonNodes}`);
  console.log(`  - Divergence Milestone Nodes: ${stats.totalDivergenceNodes}`);
  console.log(`  - Extinct Species: ${stats.extinctCount}`);
  console.log(`Total Edges: ${stats.totalEdges}`);
  console.log(`Oldest Divergence Age: ${stats.oldestDivergenceMya} Ma (Hadean LUCA)`);
  console.log('\nKingdom Distribution:');
  for (const [k, count] of Object.entries(stats.domainCounts)) {
    console.log(`  - ${k.padEnd(14)}: ${count} taxa`);
  }

  console.log('\nTesting MRCA Queries:');
  const humanLionMRCA = store.findMRCA('tax_homo_sapiens', 'tax_panthera_leo');
  if (humanLionMRCA) {
    console.log(`- Human & Lion MRCA: ${humanLionMRCA.mrca_node.id} (${humanLionMRCA.divergence_mya} Ma, ${humanLionMRCA.geological_era})`);
  }

  const humanFungusMRCA = store.findMRCA('tax_homo_sapiens', 'tax_amanita_muscaria');
  if (humanFungusMRCA) {
    console.log(`- Human & Fly Agaric MRCA: ${humanFungusMRCA.mrca_node.id} (${humanFungusMRCA.divergence_mya} Ma, ${humanFungusMRCA.geological_era})`);
  }

  const humanPlantMRCA = store.findMRCA('tax_homo_sapiens', 'tax_arabidopsis');
  if (humanPlantMRCA) {
    console.log(`- Human & Arabidopsis MRCA: ${humanPlantMRCA.mrca_node.id} (${humanPlantMRCA.divergence_mya} Ma, ${humanPlantMRCA.geological_era})`);
  }

  const humanEColiMRCA = store.findMRCA('tax_homo_sapiens', 'tax_escherichia_coli');
  if (humanEColiMRCA) {
    console.log(`- Human & E. coli MRCA: ${humanEColiMRCA.mrca_node.id} (${humanEColiMRCA.divergence_mya} Ma, ${humanEColiMRCA.geological_era})`);
  }
}

main().catch(err => {
  console.error('Stats error:', err);
  process.exit(1);
});
