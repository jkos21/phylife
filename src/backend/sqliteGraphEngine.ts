// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { getInitialPersistedGraph, validateGraphIntegrity, type PersistedKnowledgeGraphDocument } from './graphDiskStore.ts';


export interface SQLiteKGStats {
  totalNodes: number;
  totalEdges: number;
  totalTriples: number;
  totalAuditEntries: number;
  dbPath: string;
  fileSizeBytes: number;
}

export class SQLiteKnowledgeGraph {
  private db: any;
  private dbPath: string;


  constructor(dbPath: string) {
    this.dbPath = dbPath;
    const parentDir = dirname(dbPath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  public getPath(): string {
    return this.dbPath;
  }

  /**
   * Drops all existing tables and reinitializes fresh schema from scratch.
   * Preferred over migrations for a clean, deterministic start.
   */
  public cleanStartSchema(): void {
    this.db.exec(`
      DROP TABLE IF EXISTS kg_cache;
      DROP TABLE IF EXISTS kg_audit_log;
      DROP TABLE IF EXISTS kg_triples;
      DROP TABLE IF EXISTS kg_edges;
      DROP TABLE IF EXISTS kg_nodes;
    `);
    this.initSchema();
  }

  public initSchema(): void {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;


      CREATE TABLE IF NOT EXISTS kg_nodes (
        id TEXT PRIMARY KEY,
        node_type TEXT NOT NULL, -- 'taxon' | 'divergence'
        name TEXT NOT NULL,
        scientific_name TEXT,
        common_name TEXT,
        rank TEXT,
        kingdom TEXT,
        extinct INTEGER DEFAULT 0, -- 0 | 1
        divergence_mya REAL,
        geological_era TEXT,
        description TEXT,
        temporal_range TEXT,
        parent_id TEXT,
        properties_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_nodes_type ON kg_nodes(node_type);
      CREATE INDEX IF NOT EXISTS idx_nodes_kingdom ON kg_nodes(kingdom);
      CREATE INDEX IF NOT EXISTS idx_nodes_parent ON kg_nodes(parent_id);
      CREATE INDEX IF NOT EXISTS idx_nodes_scientific ON kg_nodes(scientific_name);

      CREATE TABLE IF NOT EXISTS kg_edges (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL, -- 'phylogenetic_branch' | 'synonym'
        branch_length_mya REAL,
        confidence_score REAL,
        properties_json TEXT,
        FOREIGN KEY (source_id) REFERENCES kg_nodes(id),
        FOREIGN KEY (target_id) REFERENCES kg_nodes(id)
      );

      CREATE INDEX IF NOT EXISTS idx_edges_source ON kg_edges(source_id);
      CREATE INDEX IF NOT EXISTS idx_edges_target ON kg_edges(target_id);
      CREATE INDEX IF NOT EXISTS idx_edges_rel ON kg_edges(relationship_type);

      -- RDF Knowledge Graph Triples Table (Subject-Predicate-Object with Provenance)
      CREATE TABLE IF NOT EXISTS kg_triples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id TEXT NOT NULL,
        predicate TEXT NOT NULL,
        object_value TEXT NOT NULL,
        is_literal INTEGER DEFAULT 1,
        provenance_source TEXT,
        FOREIGN KEY (subject_id) REFERENCES kg_nodes(id)
      );

      CREATE INDEX IF NOT EXISTS idx_triples_spo ON kg_triples(subject_id, predicate);
      CREATE INDEX IF NOT EXISTS idx_triples_pred ON kg_triples(predicate);

      -- Audit Trail for Knowledge Graph provenance and reproducibility
      CREATE TABLE IF NOT EXISTS kg_audit_log (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT,
        metadata_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_audit_target ON kg_audit_log(target_id);
      CREATE INDEX IF NOT EXISTS idx_audit_time ON kg_audit_log(timestamp);

      -- Live Search & External Enrichment Cache
      CREATE TABLE IF NOT EXISTS kg_cache (
        cache_key TEXT PRIMARY KEY,
        entity_id TEXT,
        source TEXT NOT NULL,
        data_json TEXT NOT NULL,
        cached_at TEXT NOT NULL,
        expires_at TEXT
      );
    `);
  }

  public persistGraph(doc: PersistedKnowledgeGraphDocument): void {
    const now = new Date().toISOString();

    const insertNode = this.db.prepare(`
      INSERT OR REPLACE INTO kg_nodes (
        id, node_type, name, scientific_name, common_name, rank,
        kingdom, extinct, divergence_mya, geological_era, description,
        temporal_range, parent_id, properties_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEdge = this.db.prepare(`
      INSERT OR REPLACE INTO kg_edges (
        id, source_id, target_id, relationship_type,
        branch_length_mya, confidence_score, properties_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTriple = this.db.prepare(`
      INSERT INTO kg_triples (
        subject_id, predicate, object_value, is_literal, provenance_source
      ) VALUES (?, ?, ?, ?, ?)
    `);

    // Clean existing tables for fresh batch persistence
    this.db.exec('DELETE FROM kg_triples; DELETE FROM kg_edges; DELETE FROM kg_nodes;');

    const parentMap = new Map<string, string>();
    for (const edge of doc.edges) {
      parentMap.set(edge.target_id, edge.source_id);
    }

    // 1. Insert Divergence Nodes
    for (const div of doc.divergences) {
      const parentId = div.parent_id || parentMap.get(div.id) || null;
      insertNode.run(
        div.id,
        'divergence',
        div.name,
        null,
        div.common_name || div.evolutionary_milestone || null,
        'divergence',
        div.kingdom || null,
        0,
        div.divergence_mya,
        div.geological_era || null,
        div.evolutionary_milestone || null,
        `${div.divergence_mya} Ma`,
        parentId,
        JSON.stringify(div),
        now,
        now
      );

      // Triples
      insertTriple.run(div.id, 'rdf:type', 'phylife:DivergenceNode', 0, 'OToL_v3');
      insertTriple.run(div.id, 'phylife:divergenceMya', String(div.divergence_mya), 1, 'TimeTree_5');
      if (div.geological_era) {
        insertTriple.run(div.id, 'phylife:geologicalEra', div.geological_era, 1, 'ICS_Chart');
      }
      if (parentId) {
        insertTriple.run(div.id, 'phylife:parent', parentId, 0, 'OToL_SyntheticTree');
      }
    }

    // 2. Insert Taxon Nodes
    for (const taxon of doc.taxa) {
      const parentId = taxon.parent_id || parentMap.get(taxon.id) || null;
      insertNode.run(
        taxon.id,
        'taxon',
        taxon.scientific_name,
        taxon.scientific_name,
        taxon.common_name || null,
        taxon.rank,
        taxon.kingdom,
        taxon.extinct ? 1 : 0,
        null,
        null,
        taxon.description || null,
        taxon.temporal_range || null,
        parentId,
        JSON.stringify(taxon),
        now,
        now
      );

      // Triples
      insertTriple.run(taxon.id, 'rdf:type', 'phylife:TaxonNode', 0, 'NCBI_Taxonomy');
      insertTriple.run(taxon.id, 'dwc:scientificName', taxon.scientific_name, 1, 'GBIF');
      insertTriple.run(taxon.id, 'dwc:taxonRank', taxon.rank, 1, 'GBIF');
      insertTriple.run(taxon.id, 'dwc:kingdom', taxon.kingdom, 1, 'GBIF');
      insertTriple.run(taxon.id, 'phylife:isExtinct', taxon.extinct ? 'true' : 'false', 1, 'PaleobiologyDatabase');
      if (parentId) {
        insertTriple.run(taxon.id, 'phylife:parent', parentId, 0, 'OToL_SyntheticTree');
      }

      if (taxon.common_name) {
        insertTriple.run(taxon.id, 'dwc:vernacularName', taxon.common_name, 1, 'Wikispecies');
      }
      if (taxon.traits) {
        for (const trait of taxon.traits) {
          insertTriple.run(taxon.id, 'phylife:hasTrait', trait, 1, 'MorphoBank');
        }
      }
    }

    // 3. Insert Edges
    for (const edge of doc.edges) {
      insertEdge.run(
        edge.id,
        edge.source_id,
        edge.target_id,
        'phylogenetic_branch',
        edge.branch_length_mya,
        edge.confidence_score || 1.0,
        JSON.stringify(edge)
      );

      insertTriple.run(edge.target_id, 'phylife:divergedFrom', edge.source_id, 0, 'OToL_SyntheticTree');
    }

    // 4. Insert Audit Log
    if (doc.audit_log && doc.audit_log.length > 0) {
      const insertAudit = this.db.prepare(`
        INSERT OR REPLACE INTO kg_audit_log (
          id, timestamp, action, target_id, actor, details, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const log of doc.audit_log) {
        insertAudit.run(
          log.id,
          log.timestamp,
          log.action,
          log.target_id,
          log.actor,
          log.details || null,
          log.metadata ? JSON.stringify(log.metadata) : null
        );
      }
    }
  }

  public getStats(): SQLiteKGStats {
    const nodeCountRow: any = this.db.prepare('SELECT COUNT(*) as count FROM kg_nodes').get();
    const edgeCountRow: any = this.db.prepare('SELECT COUNT(*) as count FROM kg_edges').get();
    const tripleCountRow: any = this.db.prepare('SELECT COUNT(*) as count FROM kg_triples').get();
    const auditCountRow: any = this.db.prepare('SELECT COUNT(*) as count FROM kg_audit_log').get();

    let fileSizeBytes = 0;
    if (existsSync(this.dbPath)) {
      fileSizeBytes = statSync(this.dbPath).size;
    }


    return {
      totalNodes: nodeCountRow?.count || 0,
      totalEdges: edgeCountRow?.count || 0,
      totalTriples: tripleCountRow?.count || 0,
      totalAuditEntries: auditCountRow?.count || 0,
      dbPath: this.dbPath,
      fileSizeBytes
    };
  }

  public close(): void {
    this.db.close();
  }
}

/**
 * Exports W3C standard Knowledge Graph formats (JSON-LD, Turtle, GraphML).
 */
export function exportGraphToJSONLD(doc: PersistedKnowledgeGraphDocument): object {
  return {
    '@context': {
      '@vocab': 'https://phylife.org/ontology#',
      'dwc': 'http://rs.tdwg.org/dwc/terms/',
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'schema': 'http://schema.org/',
      'taxa': '@graph'
    },
    '@id': 'https://phylife.org/kg/tree-of-life',
    'schema:name': 'PhyLife Tree of Life Knowledge Graph',
    'schema:version': doc.version,
    'schema:datePublished': doc.timestamp,
    '@graph': [
      ...doc.divergences.map(div => ({
        '@id': `phylife:${div.id}`,
        '@type': 'DivergenceNode',
        'name': div.name,
        'divergenceMya': div.divergence_mya,
        'geologicalEra': div.geological_era,
        'evolutionaryMilestone': div.evolutionary_milestone,
        'parent': div.parent_id ? `phylife:${div.parent_id}` : undefined
      })),
      ...doc.taxa.map(tax => ({
        '@id': `phylife:${tax.id}`,
        '@type': 'TaxonNode',
        'dwc:scientificName': tax.scientific_name,
        'dwc:vernacularName': tax.common_name,
        'dwc:taxonRank': tax.rank,
        'dwc:kingdom': tax.kingdom,
        'extinct': tax.extinct,
        'temporalRange': tax.temporal_range,
        'traits': tax.traits,
        'parent': tax.parent_id ? `phylife:${tax.parent_id}` : undefined
      }))
    ]
  };
}

export function exportGraphToTurtle(doc: PersistedKnowledgeGraphDocument): string {
  const lines: string[] = [
    '@prefix phylife: <https://phylife.org/ontology#> .',
    '@prefix dwc: <http://rs.tdwg.org/dwc/terms/> .',
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
    ''
  ];

  for (const div of doc.divergences) {
    lines.push(`phylife:${div.id} a phylife:DivergenceNode ;`);
    lines.push(`    rdfs:label "${div.name.replace(/"/g, '\\"')}" ;`);
    lines.push(`    phylife:divergenceMya ${div.divergence_mya} ;`);
    if (div.geological_era) lines.push(`    phylife:geologicalEra "${div.geological_era}" ;`);
    if (div.parent_id) lines.push(`    phylife:parent phylife:${div.parent_id} ;`);
    lines.push('    .\n');
  }

  for (const tax of doc.taxa) {
    lines.push(`phylife:${tax.id} a phylife:TaxonNode ;`);
    lines.push(`    dwc:scientificName "${tax.scientific_name.replace(/"/g, '\\"')}" ;`);
    if (tax.common_name) lines.push(`    dwc:vernacularName "${tax.common_name.replace(/"/g, '\\"')}" ;`);
    lines.push(`    dwc:taxonRank "${tax.rank}" ;`);
    lines.push(`    dwc:kingdom "${tax.kingdom}" ;`);
    lines.push(`    phylife:isExtinct ${tax.extinct ? 'true' : 'false'} ;`);
    if (tax.parent_id) lines.push(`    phylife:parent phylife:${tax.parent_id} ;`);
    lines.push('    .\n');
  }

  return lines.join('\n');
}

export interface SeedKnowledgeGraphOptions {
  cleanStart?: boolean;
  dbPath?: string;
  dataDir?: string;
  publicDir?: string;
}

export interface SeedKnowledgeGraphResult {
  graphDoc: PersistedKnowledgeGraphDocument;
  sqliteStats: SQLiteKGStats;
  jsonldPath: string;
}


/**
 * Top-level clean-start seeding function.
 * Wipes/drops old tables and deterministically generates fresh SQLite DB and the single canonical JSON-LD metadata file.
 * Prefer clean starts over database migrations. Eliminates redundant duplicate storage.
 */
export function seedKnowledgeGraphDatabase(options: SeedKnowledgeGraphOptions = {}): SeedKnowledgeGraphResult {
  const cleanStart = options.cleanStart !== false; // default true
  const dataDir = options.dataDir || resolve(process.cwd(), 'data');
  const publicDir = options.publicDir || resolve(process.cwd(), 'public', 'data');
  const dbPath = options.dbPath || join(dataDir, 'phylife_kg.sqlite');
  const jsonldPath = join(publicDir, 'phylife_kg.jsonld');

  mkdirSync(dataDir, { recursive: true });
  mkdirSync(publicDir, { recursive: true });

  const graphDoc = getInitialPersistedGraph();
  const validation = validateGraphIntegrity(graphDoc);
  if (!validation.isValid) {
    throw new Error(`Graph integrity check failed: ${validation.errors.join('; ')}`);
  }

  // Remove redundant legacy files if they exist
  const redundantFiles = [
    join(publicDir, 'phylogeny_graph.json'),
    join(dataDir, 'phylife_kg.jsonld'),
    join(dataDir, 'phylife_kg.ttl'),
    join(dataDir, 'phylife_kg.graphml')
  ];
  for (const oldFile of redundantFiles) {
    if (existsSync(oldFile)) {
      try { unlinkSync(oldFile); } catch {}
    }
  }

  // If clean start requested, remove old binary DB files
  if (cleanStart && existsSync(dbPath)) {
    try {
      unlinkSync(dbPath);
      const wal = `${dbPath}-wal`;
      const shm = `${dbPath}-shm`;
      if (existsSync(wal)) unlinkSync(wal);
      if (existsSync(shm)) unlinkSync(shm);
    } catch {
      // Fallback: will drop tables inside SQLite
    }
  }

  // 1. Seed SQLite Database
  const sqliteKG = new SQLiteKnowledgeGraph(dbPath);
  if (cleanStart) {
    sqliteKG.cleanStartSchema();
  }
  sqliteKG.persistGraph(graphDoc);
  const sqliteStats = sqliteKG.getStats();
  sqliteKG.close();

  // 2. Persist Single Canonical W3C JSON-LD Knowledge Graph Document
  const serialized = JSON.stringify(graphDoc, null, 2);
  writeFileSync(jsonldPath, serialized, 'utf-8');

  return {
    graphDoc,
    sqliteStats,
    jsonldPath
  };
}



