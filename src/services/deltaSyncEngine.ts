import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import type { PhyNode, TaxonNode, DivergenceNode, BranchEdge } from '../graph/types.ts';
import { isTaxonNode, isDivergenceNode } from '../graph/types.ts';

export interface DeltaPatch {
  patchId: string;
  version: string;
  releaseDate: string;
  description: string;
  taxaAdded: TaxonNode[];
  taxaUpdated: Partial<TaxonNode>[];
  divergencesAdded: DivergenceNode[];
  divergencesUpdated: Partial<DivergenceNode>[];
  edgesAdded: BranchEdge[];
}

export interface DeltaSyncSummary {
  currentVersion: string;
  lastSyncTimestamp: string;
  totalRecentChanges: number;
  newTaxaCount: number;
  modifiedNodesCount: number;
  recentItems: {
    id: string;
    name: string;
    type: 'taxon' | 'clade';
    status: 'new' | 'modified';
    discoveryNote?: string;
    updatedAt: string;
  }[];
}

const STORAGE_VERSION_KEY = 'phylife_dataset_version';
const STORAGE_SYNC_TIME_KEY = 'phylife_last_sync_time';

export class DeltaSyncEngine {
  private currentVersion = '1.2.0-curated-skeleton';
  private lastSyncTime: string = new Date().toISOString();

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(STORAGE_VERSION_KEY);
        const t = localStorage.getItem(STORAGE_SYNC_TIME_KEY);
        if (v) this.currentVersion = v;
        if (t) this.lastSyncTime = t;
      }
    } catch {
      // Fallback
    }
  }

  public getVersion(): string {
    return this.currentVersion;
  }

  public getLastSyncTime(): string {
    return this.lastSyncTime;
  }

  /**
   * Applies a delta patch onto the local graph store.
   */
  public applyDeltaPatch(store: PhyGraphStore, patch: DeltaPatch): { appliedTaxa: number; appliedDivergences: number; appliedEdges: number } {
    let appliedTaxa = 0;
    let appliedDivergences = 0;
    let appliedEdges = 0;

    const now = new Date().toISOString();

    // 1. Apply new taxa
    for (const taxon of patch.taxaAdded) {
      const enrichedTaxon: TaxonNode = {
        ...taxon,
        delta_status: 'new',
        is_recently_updated: true,
        updated_at: now
      };
      store.addNode(enrichedTaxon);
      appliedTaxa++;
    }

    // 2. Apply updated taxa
    for (const update of patch.taxaUpdated) {
      if (!update.id) continue;
      const existing = store.getNode(update.id);
      if (existing && isTaxonNode(existing)) {
        const merged: TaxonNode = {
          ...existing,
          ...update,
          delta_status: 'modified',
          is_recently_updated: true,
          updated_at: now
        };
        store.addNode(merged);
        appliedTaxa++;
      }
    }

    // 3. Apply new divergences
    for (const div of patch.divergencesAdded) {
      const enrichedDiv: DivergenceNode = {
        ...div,
        delta_status: 'new',
        is_recently_updated: true,
        updated_at: now
      };
      store.addNode(enrichedDiv);
      appliedDivergences++;
    }

    // 4. Apply updated divergences
    for (const update of patch.divergencesUpdated) {
      if (!update.id) continue;
      const existing = store.getNode(update.id);
      if (existing && isDivergenceNode(existing)) {
        const merged: DivergenceNode = {
          ...existing,
          ...update,
          delta_status: 'modified',
          is_recently_updated: true,
          updated_at: now
        };
        store.addNode(merged);
        appliedDivergences++;
      }
    }

    // 5. Apply new edges
    for (const edge of patch.edgesAdded) {
      store.addEdge(edge);
      appliedEdges++;
    }

    this.currentVersion = patch.version;
    this.lastSyncTime = now;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_VERSION_KEY, this.currentVersion);
        localStorage.setItem(STORAGE_SYNC_TIME_KEY, this.lastSyncTime);
      }
    } catch {
      // Ignore
    }

    return { appliedTaxa, appliedDivergences, appliedEdges };
  }

  /**
   * Retrieves all nodes in the graph that have been flagged as recently updated.
   */
  public getRecentChangesSummary(store: PhyGraphStore): DeltaSyncSummary {
    const allNodes = store.getAllNodes();
    const recentNodes: PhyNode[] = allNodes.filter(
      n => n.is_recently_updated || n.delta_status === 'new' || n.delta_status === 'modified'
    );

    let newCount = 0;
    let modCount = 0;

    const recentItems = recentNodes.map(node => {
      const isTaxon = isTaxonNode(node);
      const name = isTaxon ? (node.common_name ? `${node.scientific_name} (${node.common_name})` : node.scientific_name) : node.name;
      const status = node.delta_status || 'new';

      if (status === 'new') newCount++;
      else modCount++;

      return {
        id: node.id,
        name,
        type: isTaxon ? ('taxon' as const) : ('clade' as const),
        status: status === 'modified' ? ('modified' as const) : ('new' as const),
        discoveryNote: node.recent_discovery_note || (isTaxon ? (node as TaxonNode).description : (node as DivergenceNode).evolutionary_milestone),
        updatedAt: node.updated_at || this.lastSyncTime
      };
    });

    return {
      currentVersion: this.currentVersion,
      lastSyncTimestamp: this.lastSyncTime,
      totalRecentChanges: recentNodes.length,
      newTaxaCount: newCount,
      modifiedNodesCount: modCount,
      recentItems
    };
  }

  /**
   * Generates a sample live scientific delta patch (e.g. 2026 paleogenomics and taxonomic revisions)
   * to demonstrate incremental delta loading without pulling the whole tree.
   */
  public getCurated2026DeltaPatch(): DeltaPatch {
    return {
      patchId: 'delta_patch_2026_08',
      version: '1.3.0-rev2026',
      releaseDate: '2026-08-15',
      description: '2026 Phylogenomic Revisions: Recalibrated Spinosaurus aquatic biome, Asgard archaea branching, and Denisovan lineage markers.',
      taxaAdded: [
        {
          id: 'tax_homo_denisova',
          scientific_name: 'Homo sp. Denisova',
          common_name: 'Denisovan Hominin',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: true,
          extinction_era: 'Late Pleistocene (~30,000 BP)',
          temporal_range: '300,000 - 30,000 BP',
          thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          description: 'Archaic human subspecies identified via high-coverage Denisova Cave dental and phalangeal ancient DNA, interbreeding with Neanderthals and modern sapiens.',
          traits: ['EPAS1 high-altitude adaptation allele', 'Robust molar morphology', 'Introgression with modern Melenesians and Tibetans'],
          parent_id: 'clade_homo_split',
          recent_discovery_note: '2026 Ancient Proteomics: New high-altitude jawbone fragment confirmed in Tibetan plateau.',
          delta_status: 'new',
          is_recently_updated: true
        },
        {
          id: 'tax_lokiarchaeum',
          scientific_name: 'Lokiarchaeum ossiferum',
          common_name: 'Asgard Archaea (Loki)',
          rank: 'species',
          kingdom: 'Archaea',
          extinct: false,
          temporal_range: 'Deep Ocean Hydrothermal Vents',
          thumbnail_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
          description: 'Cultured Asgard archaeon with actin-like cytoskeleton, dynamic membrane protrusions, and direct sister relationship to LECA (Eukaryotes).',
          traits: ['Protruding membrane tentacles', 'Actin cytoskeleton homologs', 'Ribosomal protein EUK-signatures'],
          parent_id: 'div_archaea_eukarya',
          recent_discovery_note: '2026 Cryo-ET imaging: Confirmed direct physical contact mechanism with bacterial endosymbionts.',
          delta_status: 'new',
          is_recently_updated: true
        }
      ],
      taxaUpdated: [
        {
          id: 'tax_tyrannosaurus',
          recent_discovery_note: '2026 Biomechanical Density Study: Cranial kinetic modeling confirms bone-cracking bite force calibration.',
          is_recently_updated: true,
          delta_status: 'modified'
        },
        {
          id: 'tax_neanderthal',
          recent_discovery_note: '2026 Ancient Genomics: High-coverage chromosome reconstruction confirms shared lineage with Denisovans.',
          is_recently_updated: true,
          delta_status: 'modified'
        }
      ],
      divergencesAdded: [],
      divergencesUpdated: [
        {
          id: 'div_archaea_eukarya',
          evolutionary_milestone: 'Asgardarchaeota branching: Eukaryogenesis proto-cytoskeleton and engulfment mechanism confirmed via 2026 phylogenomic synthesis.',
          is_recently_updated: true,
          delta_status: 'modified'
        }
      ],
      edgesAdded: [
        {
          id: 'edge_homo_denisova',
          source_id: 'clade_homo_split',
          target_id: 'tax_homo_denisova',
          branch_length_mya: 0.6,
          confidence_score: 0.98
        },
        {
          id: 'edge_lokiarchaeum',
          source_id: 'div_archaea_eukarya',
          target_id: 'tax_lokiarchaeum',
          branch_length_mya: 2700,
          confidence_score: 0.95
        }
      ]
    };
  }
}

export const deltaSyncEngine = new DeltaSyncEngine();
