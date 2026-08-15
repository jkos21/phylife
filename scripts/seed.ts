import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { SEED_DATA } from '../src/pipeline/seedData.ts';

async function main() {
  console.log('Seeding PhyLife Local Graph Store with bundled dataset...');
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
  console.log(`Successfully seeded ${stats.totalNodes} nodes (${stats.totalTaxonNodes} taxa, ${stats.totalDivergenceNodes} divergence clades) and ${stats.totalEdges} edges.`);
}

main().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
