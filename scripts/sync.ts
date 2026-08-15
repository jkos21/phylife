declare const process: any;
import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { pipelineRunner } from '../src/pipeline/pipelineRunner.ts';

async function main() {
  console.log('====================================================');
  console.log('  PhyLife Graph Pipeline: Sync & Reconcile CLI');
  console.log('====================================================\n');

  const store = new PhyGraphStore();
  pipelineRunner.onProgress(progress => {
    if (progress.logs.length > 0) {
      const last = progress.logs[progress.logs.length - 1];
      console.log(`[${last.timestamp}] [${last.level.toUpperCase()}] [${last.step}] ${last.message}`);
    }
  });

  const success = await pipelineRunner.runSync(store, {
    source: 'bundled_seed',
    includeMedia: true,
    enrichWFO: true,
    enrichMycoBank: true,
    enrichGBIF: false,
    enrichTimeTree: true
  });

  if (success) {
    const stats = store.getStatistics();
    console.log('\n--- Graph Statistics ---');
    console.log(`Total Nodes: ${stats.totalNodes}`);
    console.log(`  Taxa: ${stats.totalTaxonNodes}`);
    console.log(`  Divergence Milestones: ${stats.totalDivergenceNodes}`);
    console.log(`Total Edges: ${stats.totalEdges}`);
    console.log(`Domain Breakdown:`, stats.domainCounts);
    console.log(`Oldest Divergence: ${stats.oldestDivergenceMya} Ma (Hadean LUCA)`);
    console.log('\nPipeline synchronization finished successfully.');
  } else {
    console.error('Pipeline synchronization failed.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CLI error:', err);
  process.exit(1);
});
