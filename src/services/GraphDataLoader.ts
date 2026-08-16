import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { SEED_DATA } from '../pipeline/seedData.ts';
import type { PersistedKnowledgeGraphDocument } from '../backend/graphDiskStore.ts';

export interface GraphLoadStatus {
  source: 'persisted_disk' | 'in_memory_fallback';
  version: string;
  timestamp: string;
  nodeCount: number;
  edgeCount: number;
  error?: string;
}

export class GraphDataLoader {
  private static instance: GraphDataLoader;
  private currentStatus: GraphLoadStatus | null = null;
  private listeners: ((status: GraphLoadStatus) => void)[] = [];

  public static getInstance(): GraphDataLoader {
    if (!GraphDataLoader.instance) {
      GraphDataLoader.instance = new GraphDataLoader();
    }
    return GraphDataLoader.instance;
  }

  public getStatus(): GraphLoadStatus | null {
    return this.currentStatus;
  }

  public subscribe(listener: (status: GraphLoadStatus) => void): () => void {
    this.listeners.push(listener);
    if (this.currentStatus) {
      listener(this.currentStatus);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(status: GraphLoadStatus): void {
    this.currentStatus = status;
    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in GraphDataLoader listener:', err);
      }
    }
  }

  /**
   * Loads the initial knowledge graph into the given PhyGraphStore.
   * Attempts to fetch the persisted W3C Knowledge Graph snapshot at /data/phylife_kg.jsonld.
   * If unavailable, falls back to the curated bundled SEED_DATA.
   */
  public async loadInitialGraph(store: PhyGraphStore): Promise<GraphLoadStatus> {
    try {
      if (typeof fetch !== 'undefined' && typeof window !== 'undefined') {
        const response = await fetch('/data/phylife_kg.jsonld');
        if (response.ok) {
          const doc: PersistedKnowledgeGraphDocument = await response.json();
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
          const status: GraphLoadStatus = {
            source: 'persisted_disk',
            version: doc.version,
            timestamp: doc.timestamp,
            nodeCount: stats.totalNodes,
            edgeCount: stats.totalEdges
          };
          this.notify(status);
          return status;
        }
      }
    } catch (err) {
      console.warn('Could not fetch persisted knowledge graph from /data/phylife_kg.jsonld. Falling back to bundled seed data.', err);
    }


    // Fallback: Bundled SEED_DATA
    store.importJSON({
      version: '1.0.0-fallback',
      timestamp: new Date().toISOString(),
      root_id: 'div_luca',
      taxa: SEED_DATA.taxa,
      divergences: SEED_DATA.divergences,
      edges: SEED_DATA.edges,
      synonyms: SEED_DATA.synonyms
    });

    const stats = store.getStatistics();
    const status: GraphLoadStatus = {
      source: 'in_memory_fallback',
      version: '1.0.0-fallback',
      timestamp: new Date().toISOString(),
      nodeCount: stats.totalNodes,
      edgeCount: stats.totalEdges
    };
    this.notify(status);
    return status;
  }
}

export const graphDataLoader = GraphDataLoader.getInstance();
