import {
  type PhyNode,
  type TaxonNode,
  type DivergenceNode,
  type BranchEdge,
  type SynonymEdge,
  type MRCAResult,
  type TaxonSearchFilter,
  type GraphStatistics,
  type GraphSerializedData,
  type DomainKingdom,
  type TaxonomicRank,
  type GeologicalEra,
  isTaxonNode,
  isDivergenceNode
} from './types.ts';

export class PhyGraphStore {
  private nodes: Map<string, PhyNode> = new Map();
  private edges: Map<string, BranchEdge> = new Map();
  private synonyms: Map<string, SynonymEdge[]> = new Map();

  // Adjacency indices
  private childrenMap: Map<string, string[]> = new Map();
  private parentMap: Map<string, string> = new Map();
  private domainIndex: Map<DomainKingdom, Set<string>> = new Map();
  private rankIndex: Map<TaxonomicRank, Set<string>> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // token -> Set of nodeIds

  private rootId: string = 'div_luca';

  constructor() {
    this.resetIndices();
  }

  private resetIndices(): void {
    this.nodes.clear();
    this.edges.clear();
    this.synonyms.clear();
    this.childrenMap.clear();
    this.parentMap.clear();
    this.domainIndex.clear();
    this.rankIndex.clear();
    this.searchIndex.clear();

    const kingdoms: DomainKingdom[] = [
      'Metazoa',
      'Viridiplantae',
      'Fungi',
      'Protista',
      'Bacteria',
      'Archaea'
    ];
    for (const k of kingdoms) {
      this.domainIndex.set(k, new Set());
    }
  }

  public setRootId(id: string): void {
    this.rootId = id;
  }

  public getRootId(): string {
    return this.rootId;
  }

  public addNode(node: PhyNode): void {
    this.nodes.set(node.id, node);

    // Index by domain/kingdom
    if (node.kingdom) {
      let set = this.domainIndex.get(node.kingdom);
      if (!set) {
        set = new Set();
        this.domainIndex.set(node.kingdom, set);
      }
      set.add(node.id);
    }

    // Index by rank
    if (isTaxonNode(node)) {
      let rSet = this.rankIndex.get(node.rank);
      if (!rSet) {
        rSet = new Set();
        this.rankIndex.set(node.rank, rSet);
      }
      rSet.add(node.id);
    }

    // Index search tokens
    this.indexSearchTokens(node);
  }

  private indexSearchTokens(node: PhyNode): void {
    const tokens = new Set<string>();

    const addText = (text?: string) => {
      if (!text) return;
      const words = text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
      for (const w of words) {
        if (w.length >= 2) {
          tokens.add(w);
          // also add prefixes for fast prefix matching
          for (let i = 2; i <= Math.min(w.length, 6); i++) {
            tokens.add(w.slice(0, i));
          }
        }
      }
    };

    if (isTaxonNode(node)) {
      addText(node.scientific_name);
      addText(node.common_name);
      addText(node.rank);
      addText(node.kingdom);
      addText(node.description);
    } else if (isDivergenceNode(node)) {
      addText(node.name);
      addText(node.common_name);
      addText(node.evolutionary_milestone);
      addText(node.geological_era);
    }

    for (const token of tokens) {
      let set = this.searchIndex.get(token);
      if (!set) {
        set = new Set();
        this.searchIndex.set(token, set);
      }
      set.add(node.id);
    }
  }

  public addEdge(edge: BranchEdge): void {
    this.edges.set(edge.id, edge);

    // Update parent-child adjacency
    let children = this.childrenMap.get(edge.source_id);
    if (!children) {
      children = [];
      this.childrenMap.set(edge.source_id, children);
    }
    if (!children.includes(edge.target_id)) {
      children.push(edge.target_id);
    }

    this.parentMap.set(edge.target_id, edge.source_id);
  }

  public addSynonym(synonym: SynonymEdge): void {
    let list = this.synonyms.get(synonym.source_id);
    if (!list) {
      list = [];
      this.synonyms.set(synonym.source_id, list);
    }
    list.push(synonym);

    // Index synonym name in search
    const words = synonym.synonym_name.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
    for (const w of words) {
      if (w.length >= 2) {
        let set = this.searchIndex.get(w);
        if (!set) {
          set = new Set();
          this.searchIndex.set(w, set);
        }
        set.add(synonym.source_id);
      }
    }
  }

  public getNode(id: string): PhyNode | undefined {
    return this.nodes.get(id);
  }

  public getTaxon(id: string): TaxonNode | undefined {
    const node = this.nodes.get(id);
    return node && isTaxonNode(node) ? node : undefined;
  }

  public getDivergence(id: string): DivergenceNode | undefined {
    const node = this.nodes.get(id);
    return node && isDivergenceNode(node) ? node : undefined;
  }

  public getChildrenIds(id: string): string[] {
    return this.childrenMap.get(id) || [];
  }

  public getChildren(id: string): PhyNode[] {
    const ids = this.getChildrenIds(id);
    return ids.map(childId => this.nodes.get(childId)!).filter(Boolean);
  }

  public getParentId(id: string): string | undefined {
    return this.parentMap.get(id);
  }

  public getParent(id: string): PhyNode | undefined {
    const parentId = this.parentMap.get(id);
    return parentId ? this.nodes.get(parentId) : undefined;
  }

  public getEdge(sourceId: string, targetId: string): BranchEdge | undefined {
    for (const edge of this.edges.values()) {
      if (edge.source_id === sourceId && edge.target_id === targetId) {
        return edge;
      }
    }
    return undefined;
  }

  public getAllNodes(): PhyNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllTaxa(): TaxonNode[] {
    return Array.from(this.nodes.values()).filter(isTaxonNode);
  }

  public getAllDivergences(): DivergenceNode[] {
    return Array.from(this.nodes.values()).filter(isDivergenceNode);
  }

  public getAllEdges(): BranchEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Retrieves full lineage path from Root (LUCA) to the given node.
   */
  public getLineage(id: string): PhyNode[] {
    const lineage: PhyNode[] = [];
    let currentId: string | undefined = id;

    const visited = new Set<string>();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = this.nodes.get(currentId);
      if (node) {
        lineage.unshift(node);
      }
      currentId = this.parentMap.get(currentId);
    }

    return lineage;
  }

  /**
   * Computes the Most Recent Common Ancestor (MRCA) between two taxa.
   */
  public findMRCA(taxonIdA: string, taxonIdB: string): MRCAResult | null {
    const nodeA = this.nodes.get(taxonIdA);
    const nodeB = this.nodes.get(taxonIdB);

    if (!nodeA || !nodeB || !isTaxonNode(nodeA) || !isTaxonNode(nodeB)) {
      return null;
    }

    if (taxonIdA === taxonIdB) {
      return {
        taxon_a: nodeA,
        taxon_b: nodeB,
        mrca_node: nodeA,
        divergence_mya: 0,
        confidence_interval: [0, 0],
        geological_era: 'Cenozoic',
        evolutionary_milestone: 'Identical taxon',
        path_a: [taxonIdA],
        path_b: [taxonIdB],
        full_path: [taxonIdA],
        shared_lineage_names: [nodeA.common_name || nodeA.scientific_name],
        divergence_delta_mya: 0
      };
    }

    // Build ancestors set for A with distance from leaf
    const pathAIds: string[] = [];
    let currA: string | undefined = taxonIdA;
    const visitedA = new Set<string>();
    while (currA && !visitedA.has(currA)) {
      visitedA.add(currA);
      pathAIds.push(currA);
      currA = this.parentMap.get(currA);
    }

    // Traverse ancestors of B until intersection
    const pathBIds: string[] = [];
    let currB: string | undefined = taxonIdB;
    let mrcaId: string | null = null;
    const visitedB = new Set<string>();

    while (currB && !visitedB.has(currB)) {
      visitedB.add(currB);
      pathBIds.push(currB);
      if (visitedA.has(currB)) {
        mrcaId = currB;
        break;
      }
      currB = this.parentMap.get(currB);
    }

    if (!mrcaId) {
      // Fallback to root if connected
      mrcaId = this.rootId;
    }

    const mrcaNode = this.nodes.get(mrcaId);
    if (!mrcaNode) return null;

    // Slice pathA up to mrcaId
    const mrcaIndexA = pathAIds.indexOf(mrcaId);
    const sliceA = mrcaIndexA >= 0 ? pathAIds.slice(0, mrcaIndexA + 1) : pathAIds;

    // Slice pathB up to mrcaId
    const mrcaIndexB = pathBIds.indexOf(mrcaId);
    const sliceB = mrcaIndexB >= 0 ? pathBIds.slice(0, mrcaIndexB + 1) : pathBIds;

    // Full path: A -> MRCA -> B
    const fullPath = [...sliceA, ...sliceB.slice(0, -1).reverse()];

    // Determine divergence age & era
    let divergenceMya = 0;
    let confidenceInterval: [number, number] | undefined = undefined;
    let geologicalEra: GeologicalEra = 'Cenozoic';
    let milestone = 'Common ancestor divergence';

    if (isDivergenceNode(mrcaNode)) {
      divergenceMya = mrcaNode.divergence_mya;
      confidenceInterval = mrcaNode.confidence_interval;
      geologicalEra = mrcaNode.geological_era;
      milestone = mrcaNode.evolutionary_milestone || mrcaNode.name;
    } else {
      // Calculate estimated divergence from edge lengths or lineage
      const lineage = this.getLineage(mrcaId);
      for (const anc of lineage) {
        if (isDivergenceNode(anc)) {
          divergenceMya = Math.max(divergenceMya, anc.divergence_mya);
          geologicalEra = anc.geological_era;
          milestone = anc.evolutionary_milestone || anc.name;
        }
      }
    }

    // Shared lineage from root down to MRCA
    const sharedLineage = this.getLineage(mrcaId);
    const sharedNames = sharedLineage.map(n =>
      isTaxonNode(n) ? (n.common_name || n.scientific_name) : (n.common_name || n.name)
    );

    return {
      taxon_a: nodeA,
      taxon_b: nodeB,
      mrca_node: mrcaNode,
      divergence_mya: divergenceMya,
      confidence_interval: confidenceInterval,
      geological_era: geologicalEra,
      evolutionary_milestone: milestone,
      path_a: sliceA,
      path_b: sliceB,
      full_path: fullPath,
      shared_lineage_names: sharedNames,
      divergence_delta_mya: divergenceMya
    };
  }

  /**
   * Search taxa and divergence nodes with filters.
   */
  public search(filter: TaxonSearchFilter): PhyNode[] {
    let candidateIds: Set<string> | null = null;

    if (filter.query && filter.query.trim().length > 0) {
      const qTokens = filter.query.toLowerCase().trim().split(/\s+/);
      const matches: Set<string>[] = [];

      for (const token of qTokens) {
        const tokenMatches = new Set<string>();
        // Check direct index
        const direct = this.searchIndex.get(token);
        if (direct) {
          direct.forEach(id => tokenMatches.add(id));
        }

        // Check prefix keys in searchIndex
        for (const [key, nodeIds] of this.searchIndex.entries()) {
          if (key.startsWith(token) || token.startsWith(key)) {
            nodeIds.forEach(id => tokenMatches.add(id));
          }
        }
        matches.push(tokenMatches);
      }

      if (matches.length > 0) {
        // Intersection of token matches
        candidateIds = new Set(matches[0]);
        for (let i = 1; i < matches.length; i++) {
          const current = matches[i];
          candidateIds = new Set(Array.from(candidateIds).filter(id => current.has(id)));
        }
      }
    }

    const pool = candidateIds
      ? Array.from(candidateIds).map(id => this.nodes.get(id)!).filter(Boolean)
      : Array.from(this.nodes.values());

    return pool.filter(node => {
      // Kingdom / Domain filter
      if (filter.kingdoms && filter.kingdoms.length > 0) {
        if (!node.kingdom || !filter.kingdoms.includes(node.kingdom)) {
          return false;
        }
      }

      // Rank filter
      if (filter.ranks && filter.ranks.length > 0) {
        if (!isTaxonNode(node) || !filter.ranks.includes(node.rank)) {
          return false;
        }
      }

      // Extinction filter
      if (filter.extinctOnly) {
        if (!isTaxonNode(node) || !node.extinct) return false;
      }
      if (filter.extantOnly) {
        if (isTaxonNode(node) && node.extinct) return false;
      }

      // Divergence time filters
      if (filter.maxDivergenceMya !== undefined) {
        if (isDivergenceNode(node) && node.divergence_mya > filter.maxDivergenceMya) {
          return false;
        }
      }
      if (filter.minDivergenceMya !== undefined) {
        if (isDivergenceNode(node) && node.divergence_mya < filter.minDivergenceMya) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Retrieves summary statistics of the graph database.
   */
  public getStatistics(): GraphStatistics {
    const domainCounts: Record<DomainKingdom, number> = {
      Metazoa: 0,
      Viridiplantae: 0,
      Fungi: 0,
      Protista: 0,
      Bacteria: 0,
      Archaea: 0
    };

    const rankCounts: Partial<Record<TaxonomicRank, number>> = {};
    let extinctCount = 0;
    let oldestDivergenceMya = 0;
    let taxonCount = 0;
    let divergenceCount = 0;

    for (const node of this.nodes.values()) {
      if (node.kingdom && domainCounts[node.kingdom] !== undefined) {
        domainCounts[node.kingdom]++;
      }

      if (isTaxonNode(node)) {
        taxonCount++;
        rankCounts[node.rank] = (rankCounts[node.rank] || 0) + 1;
        if (node.extinct) extinctCount++;
      } else if (isDivergenceNode(node)) {
        divergenceCount++;
        if (node.divergence_mya > oldestDivergenceMya) {
          oldestDivergenceMya = node.divergence_mya;
        }
      }
    }

    return {
      totalNodes: this.nodes.size,
      totalTaxonNodes: taxonCount,
      totalDivergenceNodes: divergenceCount,
      totalEdges: this.edges.size,
      domainCounts,
      rankCounts,
      extinctCount,
      oldestDivergenceMya,
      rootId: this.rootId
    };
  }

  /**
   * Serializes graph into standard JSON representation.
   */
  public exportJSON(): GraphSerializedData {
    const taxa: TaxonNode[] = [];
    const divergences: DivergenceNode[] = [];
    const synonyms: SynonymEdge[] = [];

    for (const node of this.nodes.values()) {
      if (isTaxonNode(node)) taxa.push(node);
      else divergences.push(node);
    }

    for (const synList of this.synonyms.values()) {
      synonyms.push(...synList);
    }

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      root_id: this.rootId,
      taxa,
      divergences,
      edges: Array.from(this.edges.values()),
      synonyms
    };
  }

  /**
   * Imports graph data from serialized JSON.
   */
  public importJSON(data: GraphSerializedData): void {
    this.resetIndices();
    this.rootId = data.root_id || 'div_luca';

    for (const node of data.divergences) {
      this.addNode(node);
    }
    for (const node of data.taxa) {
      this.addNode(node);
    }
    for (const edge of data.edges) {
      this.addEdge(edge);
    }
    if (data.synonyms) {
      for (const syn of data.synonyms) {
        this.addSynonym(syn);
      }
    }
  }

  /**
   * Exports graph topology to standard phylogenetic Newick string format.
   */
  public exportNewick(startNodeId: string = this.rootId): string {
    const buildSubtree = (nodeId: string): string => {
      const node = this.nodes.get(nodeId);
      if (!node) return '';

      const children = this.getChildrenIds(nodeId);
      const name = isTaxonNode(node) ? node.scientific_name.replace(/\s+/g, '_') : node.name.replace(/\s+/g, '_');
      const parentId = this.parentMap.get(nodeId);
      const edge = parentId ? this.getEdge(parentId, nodeId) : undefined;
      const branchLength = edge ? edge.branch_length_mya.toFixed(2) : '1.0';

      if (children.length === 0) {
        return `${name}:${branchLength}`;
      }

      const childTrees = children.map(c => buildSubtree(c)).filter(Boolean).join(',');
      return `(${childTrees})${name}:${branchLength}`;
    };

    return `${buildSubtree(startNodeId)};`;
  }
}

// Global singleton instance
export const graphStore = new PhyGraphStore();
