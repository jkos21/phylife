declare const process: any;

import { PhyGraphStore } from '../src/graph/PhyGraphStore.ts';
import { SEED_DATA } from '../src/pipeline/seedData.ts';
import { otolClient } from '../src/pipeline/otolClient.ts';
import { timeTreeClient } from '../src/pipeline/timeTreeClient.ts';
import { domainEnricher } from '../src/pipeline/domainEnricher.ts';
import { mediaFetcher } from '../src/pipeline/mediaFetcher.ts';
import { deltaSyncEngine } from '../src/services/deltaSyncEngine.ts';
import { cladeExpansionService } from '../src/services/cladeExpansionService.ts';
import { userPreferences } from '../src/services/userPreferences.ts';
import { pipelineRunner } from '../src/pipeline/pipelineRunner.ts';

let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

async function runBackendIntegrationTestSuite() {
  console.log('================================================================');
  console.log('  🧬 PhyLife: Backend & External Integration Test Suite');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // SUITE 1: Open Tree of Life (OToL API v3) Integration
  // -------------------------------------------------------------
  console.log('📌 [Suite 1/8] Open Tree of Life (OToL TNRS & Subtree API)...');
  try {
    const matches = await otolClient.matchNames(['Homo sapiens', 'Panthera leo', 'Ginkgo biloba']);
    assert(Array.isArray(matches) && matches.length === 3, 'OToL TNRS returns matched taxa');
    assert(matches[0].matched_name === 'Homo sapiens', 'First match is Homo sapiens');
    assert(typeof matches[0].ott_id === 'number', 'Match contains numeric OTT ID');
  } catch (err: any) {
    assert(false, 'OToL Client failed', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 2: TimeTree Chronogram Calibration & Geological Eras
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 2/8] TimeTree Chronogram & Chronostratigraphy Engine...');
  const humanLionPair = await timeTreeClient.getPairwiseDivergence('Homo sapiens', 'Panthera leo');
  assert(humanLionPair.divergence_mya === 95.0, 'Human–Lion divergence is calibrated to 95.0 Ma');
  assert(humanLionPair.geological_era === 'Mesozoic', '95.0 Ma is classified as Mesozoic');

  const humanChimpPair = await timeTreeClient.getPairwiseDivergence('Homo sapiens', 'Pan troglodytes');
  assert(humanChimpPair.divergence_mya === 6.8, 'CHLCA divergence is calibrated to 6.8 Ma');
  assert(humanChimpPair.geological_era === 'Cenozoic', '6.8 Ma is classified as Cenozoic');

  assert(timeTreeClient.getGeologicalEra(4200) === 'Hadean', '4200 Ma -> Hadean');
  assert(timeTreeClient.getGeologicalEra(3000) === 'Archean', '3000 Ma -> Archean');
  assert(timeTreeClient.getGeologicalEra(1200) === 'Proterozoic', '1200 Ma -> Proterozoic');
  assert(timeTreeClient.getGeologicalEra(350) === 'Paleozoic', '350 Ma -> Paleozoic');
  assert(timeTreeClient.getGeologicalEra(150) === 'Mesozoic', '150 Ma -> Mesozoic');
  assert(timeTreeClient.getGeologicalEra(10) === 'Cenozoic', '10 Ma -> Cenozoic');

  // -------------------------------------------------------------
  // SUITE 3: Domain Metadata Reconciliation (WFO / MycoBank / GBIF)
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 3/8] Domain Taxonomy Enrichers (WFO, MycoBank, GBIF)...');
  const wfoMatch = await domainEnricher.enrichWFO('Arabidopsis thaliana');
  assert(wfoMatch !== null && wfoMatch.wfo_id.startsWith('wfo-'), 'WFO identifier resolved for Arabidopsis');

  const mycoMatch = await domainEnricher.enrichMycoBank('Amanita muscaria');
  assert(mycoMatch !== null && mycoMatch.mycobank_id.startsWith('MB'), 'MycoBank identifier resolved for Amanita');

  const gbifMatch = await domainEnricher.enrichGBIF('Panthera leo');
  assert(gbifMatch !== null && typeof gbifMatch.usageKey === 'number', 'GBIF Backbone key resolved for Panthera leo');

  // -------------------------------------------------------------
  // SUITE 4: Media Fetcher & Creator Prioritization Engine
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 4/8] Public Media Fetcher & Creator Personalization...');
  userPreferences.toggleCreator('pbs_eons'); // Ensure PBS Eons is prioritized
  const mediaPkg = await mediaFetcher.fetchCompleteMediaPackage({
    id: 'tax_panthera_leo',
    scientific_name: 'Panthera leo',
    common_name: 'African Lion',
    rank: 'species',
    kingdom: 'Metazoa',
    extinct: false
  });

  assert(mediaPkg.scientificName === 'Panthera leo', 'Media package loaded for Panthera leo');
  assert(mediaPkg.images.length > 0, 'Media package contains thumbnail images');
  assert(mediaPkg.videos.length >= 3, 'Media package generated educational video list');
  assert(mediaPkg.podcasts.length >= 2, 'Media package generated podcast list');
  assert(mediaPkg.videos[0].isCreatorMatch === true, 'Prioritized creator video ranks at the top (PBS Eons / BBC)');

  // -------------------------------------------------------------
  // SUITE 5: Delta Sync & Freshness Patching Engine
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 5/8] Delta Sync Engine & Scientific Freshness...');
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

  const beforeSummary = deltaSyncEngine.getRecentChangesSummary(store);
  const patch = deltaSyncEngine.getCurated2026DeltaPatch();
  const patchResult = deltaSyncEngine.applyDeltaPatch(store, patch);

  assert(patchResult.appliedTaxa >= 2, `Applied ${patchResult.appliedTaxa} delta taxa`);
  assert(store.getNode('tax_homo_denisova') !== undefined, 'Denisovan hominin node injected via delta patch');
  assert(store.getNode('tax_lokiarchaeum') !== undefined, 'Lokiarchaeum Asgard archaeon node injected via delta patch');

  const afterSummary = deltaSyncEngine.getRecentChangesSummary(store);
  assert(afterSummary.newTaxaCount >= beforeSummary.newTaxaCount + 2, 'Recent changes summary reflects newly added taxa');

  // -------------------------------------------------------------
  // SUITE 6: On-Demand Clade Expansion Engine
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 6/8] On-Demand Clade Zoom & Subtree Grafting...');
  const expandResult = cladeExpansionService.expandClade(store, 'div_dinosauria_aves');
  assert(expandResult.nodesAddedCount >= 2, `Clade expansion grafted ${expandResult.nodesAddedCount} dinosaur sister taxa`);
  assert(store.getNode('tax_therizinosaurus') !== undefined, 'Therizinosaurus grafted into local store');
  assert(store.getNode('tax_pachycephalosaurus') !== undefined, 'Pachycephalosaurus grafted into local store');


  // -------------------------------------------------------------
  // SUITE 7: PhyGraphStore & $O(depth)$ MRCA Pathfinding
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 7/8] PhyGraphStore MRCA, Lineage & Graph Export...');
  const humanFungusMRCA = store.findMRCA('tax_homo_sapiens', 'tax_amanita_muscaria');
  assert(humanFungusMRCA !== null, 'MRCA found between Human and Fly Agaric');
  assert(humanFungusMRCA?.mrca_node.id === 'div_opisthokonta', 'Human–Fungi MRCA is Opisthokonta (1500 Ma)');
  assert(humanFungusMRCA?.full_path.length! > 3, 'Full MRCA divergence path contains intermediate ancestral clades');

  const newickStr = store.exportNewick();
  assert(newickStr.startsWith('(') && newickStr.endsWith(';'), 'Newick tree format exported successfully');

  const graphMLStr = store.exportGraphML();
  assert(graphMLStr.includes('<graphml') && graphMLStr.includes('</graphml>'), 'GraphML format exported successfully');

  // -------------------------------------------------------------
  // SUITE 8: 6-Step Atomic ETL Pipeline Synchronization
  // -------------------------------------------------------------
  console.log('\n📌 [Suite 8/8] 6-Step Atomic ETL Pipeline Execution...');
  let pipelineStepsExecuted = 0;
  pipelineRunner.onProgress(p => {
    if (p.stepIndex > pipelineStepsExecuted) {
      pipelineStepsExecuted = p.stepIndex;
    }
  });

  const syncSuccess = await pipelineRunner.runSync(store, {
    source: 'bundled_seed',
    includeMedia: false,
    enrichWFO: false,
    enrichMycoBank: false,
    enrichGBIF: false,
    enrichTimeTree: true
  });

  assert(syncSuccess === true, '6-step ETL pipeline completed successfully');
  assert(pipelineStepsExecuted === 6, 'All 6 atomic ETL steps executed in sequence');

  // -------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  🎯 Integration Test Results: ${passedAssertions}/${totalAssertions} Passed (${((passedAssertions/totalAssertions)*100).toFixed(1)}%)`);
  console.log('================================================================\n');

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runBackendIntegrationTestSuite().catch(err => {
  console.error('Fatal Integration Test Error:', err);
  process.exit(1);
});
