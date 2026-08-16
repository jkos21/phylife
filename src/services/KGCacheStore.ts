import type { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import type { TaxonNode, DivergenceNode, BranchEdge, AuditLogEntry, KGCacheEntry } from '../graph/types.ts';

const STORAGE_CACHE_PREFIX = 'phylife_kg_cache_';
const STORAGE_DYNAMIC_DELTA_KEY = 'phylife_dynamic_grafted_delta';
const STORAGE_AUDIT_LOG_KEY = 'phylife_kg_audit_log';

export interface DynamicGraftedDelta {
  version: string;
  updatedAt: string;
  taxa: TaxonNode[];
  divergences: DivergenceNode[];
  edges: BranchEdge[];
}

export class KGCacheStore {
  private memoryCache: Map<string, KGCacheEntry> = new Map();

  constructor() {
    this.hydrateMemoryCache();
  }

  private hydrateMemoryCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_CACHE_PREFIX)) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const entry: KGCacheEntry = JSON.parse(raw);
              this.memoryCache.set(entry.key, entry);
            }
          }
        }
      }
    } catch {
      // Memory fallback
    }
  }

  /**
   * Retrieves an item from the cache (e.g. external taxon, search query, or children list).
   */
  public get(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check expiration if set
    if (entry.expires_at) {
      if (new Date(entry.expires_at).getTime() < Date.now()) {
        this.memoryCache.delete(key);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(`${STORAGE_CACHE_PREFIX}${key}`);
          }
        } catch {}
        return null;
      }
    }

    return entry.node || (entry as any).data;
  }

  /**
   * Caches an item with source metadata and optional TTL (in hours).
   */
  public set(key: string, data: any, source: string, ttlHours: number = 72): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString();

    const entry: KGCacheEntry = {
      key,
      node: typeof data === 'object' && 'scientific_name' in data ? data : undefined,
      source,
      cached_at: now.toISOString(),
      expires_at: expiresAt
    };

    (entry as any).data = data;

    this.memoryCache.set(key, entry);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${STORAGE_CACHE_PREFIX}${key}`, JSON.stringify(entry));
      }
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  /**
   * Persists newly grafted taxa, divergences, and edges into the browser's dynamic delta registry.
   */
  public persistDynamicDelta(newTaxa: TaxonNode[], newDivergences: DivergenceNode[], newEdges: BranchEdge[]): void {
    const existing = this.getDynamicDelta();

    const taxaMap = new Map<string, TaxonNode>();
    for (const t of existing.taxa) taxaMap.set(t.id, t);
    for (const t of newTaxa) taxaMap.set(t.id, t);

    const divMap = new Map<string, DivergenceNode>();
    for (const d of existing.divergences) divMap.set(d.id, d);
    for (const d of newDivergences) divMap.set(d.id, d);

    const edgeMap = new Map<string, BranchEdge>();
    for (const e of existing.edges) edgeMap.set(e.id, e);
    for (const e of newEdges) edgeMap.set(e.id, e);

    const delta: DynamicGraftedDelta = {
      version: '1.0.0-dynamic',
      updatedAt: new Date().toISOString(),
      taxa: Array.from(taxaMap.values()),
      divergences: Array.from(divMap.values()),
      edges: Array.from(edgeMap.values())
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_DYNAMIC_DELTA_KEY, JSON.stringify(delta));
      }
    } catch (err) {
      console.warn('Could not persist dynamic delta to localStorage:', err);
    }
  }

  /**
   * Retrieves all previously grafted dynamic delta nodes and edges.
   */
  public getDynamicDelta(): DynamicGraftedDelta {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_DYNAMIC_DELTA_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch {}
    return {
      version: '1.0.0-dynamic',
      updatedAt: new Date().toISOString(),
      taxa: [],
      divergences: [],
      edges: []
    };
  }

  /**
   * Re-hydrates dynamically grafted taxa and edges into the PhyGraphStore on bootstrap.
   */
  public loadPersistedDeltas(store: PhyGraphStore): { restoredNodes: number; restoredEdges: number } {
    const delta = this.getDynamicDelta();
    let restoredNodes = 0;
    let restoredEdges = 0;

    for (const div of delta.divergences) {
      if (!store.getNode(div.id)) {
        store.addNode(div);
        restoredNodes++;
      }
    }

    for (const tax of delta.taxa) {
      if (!store.getNode(tax.id)) {
        store.addNode(tax);
        restoredNodes++;
      }
    }

    for (const edge of delta.edges) {
      if (!store.getEdge(edge.source_id, edge.target_id)) {
        store.addEdge(edge);
        restoredEdges++;
      }
    }

    return { restoredNodes, restoredEdges };
  }

  /**
   * Appends an audit log transaction to persisted audit storage.
   */
  public appendAuditLog(entry: AuditLogEntry): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_AUDIT_LOG_KEY);
        const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
        logs.push(entry);
        // Keep latest 200 audit entries
        const trimmed = logs.slice(-200);
        localStorage.setItem(STORAGE_AUDIT_LOG_KEY, JSON.stringify(trimmed));
      }
    } catch {}
  }

  /**
   * Retrieves all persisted audit log entries.
   */
  public getAuditLogs(): AuditLogEntry[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_AUDIT_LOG_KEY);
        return raw ? JSON.parse(raw) : [];
      }
    } catch {}
    return [];
  }

  /**
   * Clears all dynamic cache and reset to base dataset.
   */
  public clearAll(): void {
    this.memoryCache.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith(STORAGE_CACHE_PREFIX) || key === STORAGE_DYNAMIC_DELTA_KEY || key === STORAGE_AUDIT_LOG_KEY)) {
            keysToRemove.push(key);
          }
        }
        for (const k of keysToRemove) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }
}

export const kgCacheStore = new KGCacheStore();
