import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { isTaxonNode, isDivergenceNode, type DomainKingdom, type GeologicalEra } from '../graph/types.ts';
import type { RenderNode, RenderEdge, GeologicalRing, RendererOptions } from './types.ts';

export const DOMAIN_COLORS: Record<DomainKingdom, string> = {
  Metazoa: '#f59e0b',
  Viridiplantae: '#10b981',
  Fungi: '#a855f7',
  Protista: '#06b6d4',
  Bacteria: '#f43f5e',
  Archaea: '#3b82f6'
};

export const GEOLOGICAL_ERAS_TIMELINE: { era: GeologicalEra; startMya: number; endMya: number; color: string; label: string }[] = [
  { era: 'Hadean', startMya: 4600, endMya: 4000, color: 'rgba(239, 68, 68, 0.08)', label: 'Hadean (4.6 - 4.0 Ga)' },
  { era: 'Archean', startMya: 4000, endMya: 2500, color: 'rgba(245, 158, 11, 0.08)', label: 'Archean (4.0 - 2.5 Ga)' },
  { era: 'Proterozoic', startMya: 2500, endMya: 541, color: 'rgba(59, 130, 246, 0.08)', label: 'Proterozoic (2.5 Ga - 541 Ma)' },
  { era: 'Paleozoic', startMya: 541, endMya: 252, color: 'rgba(16, 185, 129, 0.08)', label: 'Paleozoic (541 - 252 Ma)' },
  { era: 'Mesozoic', startMya: 252, endMya: 66, color: 'rgba(168, 85, 247, 0.08)', label: 'Mesozoic (252 - 66 Ma)' },
  { era: 'Cenozoic', startMya: 66, endMya: 0, color: 'rgba(6, 182, 212, 0.08)', label: 'Cenozoic (66 Ma - Present)' }
];

export function myaToRadius(mya: number, maxRadius: number = 750): number {
  const clamped = Math.max(0, Math.min(4200, mya));
  const normalized = 1 - Math.sqrt(clamped / 4200);
  return 40 + normalized * (maxRadius - 40);
}

export function computeRadialLayout(
  store: PhyGraphStore,
  options: RendererOptions,
  maxRadius: number = 750
): {
  nodes: RenderNode[];
  edges: RenderEdge[];
  rings: GeologicalRing[];
} {
  const effectiveRootId = (options.focusedCladeId && store.getNode(options.focusedCladeId))
    ? options.focusedCladeId
    : store.getRootId();

  const rootNode = store.getNode(effectiveRootId);
  if (!rootNode) {
    return { nodes: [], edges: [], rings: [] };
  }

  // 1. Gather all leaves in post-order to assign angular spans
  const leafIds: string[] = [];
  const countLeaves = (nodeId: string): number => {
    const children = store.getChildrenIds(nodeId);
    if (children.length === 0) {
      leafIds.push(nodeId);
      return 1;
    }
    let sum = 0;
    for (const child of children) {
      sum += countLeaves(child);
    }
    return sum;
  };

  const totalLeaves = countLeaves(effectiveRootId);
  const angleStep = (Math.PI * 2) / Math.max(totalLeaves, 1);

  // Map leafId -> assigned angle
  const leafAngleMap = new Map<string, number>();
  leafIds.forEach((id, index) => {
    leafAngleMap.set(id, index * angleStep - Math.PI / 2);
  });


  // Function to map divergence time (Ma) to radial distance
  // Nonlinear scaling (square root) gives more breathing room to recent speciation events
  const rScale = (mya: number): number => myaToRadius(mya, maxRadius);

  const renderNodesMap = new Map<string, RenderNode>();
  const renderEdges: RenderEdge[] = [];

  // Recursive positioning
  const traverse = (nodeId: string, depth: number): { angle: number; r: number } => {
    const node = store.getNode(nodeId)!;
    const children = store.getChildrenIds(nodeId);
    const isLeaf = children.length === 0;

    let mya = 0;
    if (isDivergenceNode(node)) {
      mya = node.divergence_mya;
    } else if (isTaxonNode(node)) {
      mya = 0; // Leaf taxa are at present (0 Ma)
    }

    const r = rScale(mya);
    let angle: number;

    if (isLeaf) {
      angle = leafAngleMap.get(nodeId) || 0;
    } else {
      let angleSum = 0;
      for (const childId of children) {
        const childPos = traverse(childId, depth + 1);
        angleSum += childPos.angle;
      }
      angle = angleSum / children.length;
    }

    // Convert polar (r, angle) to Cartesian (x, y)
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);

    // Determine domain color
    let color = '#94a3b8';
    if (node.kingdom && DOMAIN_COLORS[node.kingdom]) {
      color = DOMAIN_COLORS[node.kingdom];
    }

    // Determine LoD level
    let lodLevel = 3;
    if (isDivergenceNode(node)) {
      if (node.divergence_mya >= 2000) lodLevel = 0;
      else if (node.divergence_mya >= 500) lodLevel = 1;
      else lodLevel = 2;
    } else if (isTaxonNode(node)) {
      if (node.rank === 'domain' || node.rank === 'kingdom') lodLevel = 0;
      else if (node.rank === 'phylum' || node.rank === 'class') lodLevel = 1;
      else if (node.rank === 'order' || node.rank === 'family') lodLevel = 2;
      else lodLevel = 3;
    }

    const isMRCAPath = options.activeMRCAIds ? options.activeMRCAIds.has(nodeId) : false;
    const isMRCANode = options.activeMRCAIds ? (options.activeMRCAIds.has(nodeId) && isDivergenceNode(node)) : false;
    const isExtinct = isTaxonNode(node) && node.extinct;

    let label = isTaxonNode(node) ? node.scientific_name : node.name;
    let subLabel = isTaxonNode(node) ? node.common_name : `${node.divergence_mya} Ma`;

    const rNode: RenderNode = {
      id: nodeId,
      rawNode: node,
      x,
      y,
      radius: isLeaf ? 5 : 4,
      angle,
      distanceFromRoot: r,
      depth,
      lodLevel,
      color,
      label,
      subLabel,
      isLeaf,
      isHighlighted: options.selectedNodeId === nodeId || options.hoveredNodeId === nodeId,
      isMRCAPath,
      isMRCANode,
      isExtinct,
      isRecentlyUpdated: !!node.is_recently_updated,
      deltaStatus: node.delta_status,
      thumbnailUrl: isTaxonNode(node) ? node.thumbnail_url : undefined,
      divergenceMya: isDivergenceNode(node) ? node.divergence_mya : 0,
      geologicalEra: isDivergenceNode(node) ? node.geological_era : 'Cenozoic',
      kingdom: node.kingdom
    };

    renderNodesMap.set(nodeId, rNode);
    return { angle, r };
  };

  traverse(effectiveRootId, 0);

  // 2. Build RenderEdges with curved arc control points
  for (const edge of store.getAllEdges()) {
    const src = renderNodesMap.get(edge.source_id);
    const tgt = renderNodesMap.get(edge.target_id);

    if (src && tgt) {
      const isMRCAEdge = options.activeMRCAIds
        ? (options.activeMRCAIds.has(src.id) && options.activeMRCAIds.has(tgt.id))
        : false;

      // Arc path: goes radially along parent angle, then curves along intermediate radius to child angle
      const midAngle = tgt.angle || 0;
      const midRadius = src.distanceFromRoot || 0;
      const cornerX = midRadius * Math.cos(midAngle);
      const cornerY = midRadius * Math.sin(midAngle);

      renderEdges.push({
        id: edge.id,
        source: src,
        target: tgt,
        branchLengthMya: edge.branch_length_mya,
        isMRCAPath: isMRCAEdge,
        color: isMRCAEdge ? '#f43f5e' : src.color,
        pathPoints: [
          { x: src.x, y: src.y },
          { x: cornerX, y: cornerY },
          { x: tgt.x, y: tgt.y }
        ]
      });
    }
  }

  // 3. Compute Geological Era rings
  const rings: GeologicalRing[] = GEOLOGICAL_ERAS_TIMELINE.map(eraInfo => {
    const innerR = rScale(eraInfo.startMya);
    const outerR = rScale(eraInfo.endMya);
    return {
      era: eraInfo.era,
      startMya: eraInfo.startMya,
      endMya: eraInfo.endMya,
      innerRadius: Math.min(innerR, outerR),
      outerRadius: Math.max(innerR, outerR),
      color: eraInfo.color,
      label: eraInfo.label
    };
  });

  return {
    nodes: Array.from(renderNodesMap.values()),
    edges: renderEdges,
    rings
  };
}
