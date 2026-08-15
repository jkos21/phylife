import type { GraphSerializedData, TaxonNode, DivergenceNode, BranchEdge, SynonymEdge } from '../graph/types.ts';
import { SEED_DATA } from '../pipeline/seedData.ts';

export interface PersistedGraphMetadata {
  version: string;
  schemaVersion: string;
  generatedAt: string;
  description: string;
  sources: {
    name: string;
    description: string;
    url?: string;
  }[];
  metrics: {
    totalNodes: number;
    totalTaxa: number;
    totalDivergences: number;
    totalEdges: number;
    totalSynonyms: number;
    domainBreakdown: Record<string, number>;
  };
}

export interface PersistedKnowledgeGraphDocument extends GraphSerializedData {
  metadata: PersistedGraphMetadata;
}

/**
 * Builds a standardized persisted knowledge graph document from raw nodes and edges.
 */
export function createPersistedGraphDocument(
  taxa: TaxonNode[],
  divergences: DivergenceNode[],
  edges: BranchEdge[],
  synonyms: SynonymEdge[] = [],
  version: string = '1.3.0-persisted-kg'
): PersistedKnowledgeGraphDocument {
  const domainBreakdown: Record<string, number> = {};
  for (const t of taxa) {
    domainBreakdown[t.kingdom] = (domainBreakdown[t.kingdom] || 0) + 1;
  }

  const metadata: PersistedGraphMetadata = {
    version,
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    description: 'PhyLife Canonical Phylogenetic Knowledge Graph persisted snapshot.',
    sources: [
      { name: 'Open Tree of Life (OToL v3)', description: 'Synthetic tree topology and OTT identifiers' },
      { name: 'TimeTree 5', description: 'Chronogram divergence ages and 95% confidence intervals' },
      { name: 'World Flora Online (WFO)', description: 'Plant taxonomy and nomenclature' },
      { name: 'MycoBank & Index Fungorum', description: 'Fungal kingdom classification' },
      { name: 'GBIF Backbone Taxonomy', description: 'Taxonomic hierarchy and vernacular names' },
      { name: 'Wikimedia Commons & Wikispecies', description: 'Media assets and morphological descriptions' }
    ],
    metrics: {
      totalNodes: taxa.length + divergences.length,
      totalTaxa: taxa.length,
      totalDivergences: divergences.length,
      totalEdges: edges.length,
      totalSynonyms: synonyms.length,
      domainBreakdown
    }
  };

  return {
    version,
    timestamp: metadata.generatedAt,
    root_id: 'div_luca',
    taxa,
    divergences,
    edges,
    synonyms,
    metadata
  };
}

/**
 * Validates the topological integrity of a persisted graph document.
 */
export function validateGraphIntegrity(doc: PersistedKnowledgeGraphDocument): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!doc.root_id) {
    errors.push('Missing root_id in graph document.');
  }

  const nodeIds = new Set<string>();
  for (const div of doc.divergences) {
    if (nodeIds.has(div.id)) {
      errors.push(`Duplicate divergence node ID: ${div.id}`);
    }
    nodeIds.add(div.id);
  }

  for (const taxon of doc.taxa) {
    if (nodeIds.has(taxon.id)) {
      errors.push(`Duplicate taxon node ID: ${taxon.id}`);
    }
    nodeIds.add(taxon.id);
  }

  if (!nodeIds.has(doc.root_id)) {
    errors.push(`Root node ID "${doc.root_id}" not found in nodes collection.`);
  }

  // Validate edges
  for (const edge of doc.edges) {
    if (!nodeIds.has(edge.source_id)) {
      errors.push(`Edge ${edge.id} references non-existent source: ${edge.source_id}`);
    }
    if (!nodeIds.has(edge.target_id)) {
      errors.push(`Edge ${edge.id} references non-existent target: ${edge.target_id}`);
    }
    if (typeof edge.branch_length_mya !== 'number' || edge.branch_length_mya < 0) {
      errors.push(`Edge ${edge.id} has invalid branch length: ${edge.branch_length_mya}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates the default persisted graph document from SEED_DATA.
 */
export function getInitialPersistedGraph(): PersistedKnowledgeGraphDocument {
  return createPersistedGraphDocument(
    SEED_DATA.taxa,
    SEED_DATA.divergences,
    SEED_DATA.edges,
    SEED_DATA.synonyms,
    '1.3.0-persisted-kg'
  );
}
