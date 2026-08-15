import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { isTaxonNode, isDivergenceNode } from '../graph/types.ts';
import type { RenderNode, RenderEdge, GeologicalRing, RendererOptions } from './types.ts';
import { DOMAIN_COLORS, GEOLOGICAL_ERAS_TIMELINE } from './layoutRadial.ts';

export function computeDendrogramLayout(
  store: PhyGraphStore,
  options: RendererOptions,
  treeWidth: number = 1400,
  leafSpacing: number = 38
): {
  nodes: RenderNode[];
  edges: RenderEdge[];
  rings: GeologicalRing[];
} {
  const rootId = store.getRootId();
  const rootNode = store.getNode(rootId);
  if (!rootNode) {
    return { nodes: [], edges: [], rings: [] };
  }

  // 1. Collect all leaves
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

  countLeaves(rootId);

  const leafYMap = new Map<string, number>();
  leafIds.forEach((id, index) => {
    leafYMap.set(id, index * leafSpacing - (leafIds.length * leafSpacing) / 2);
  });

  const myaToX = (mya: number): number => {
    const clamped = Math.max(0, Math.min(4200, mya));
    const normalized = 1 - Math.sqrt(clamped / 4200);
    return -treeWidth / 2 + normalized * treeWidth;
  };

  const renderNodesMap = new Map<string, RenderNode>();
  const renderEdges: RenderEdge[] = [];

  const traverse = (nodeId: string, depth: number): { x: number; y: number } => {
    const node = store.getNode(nodeId)!;
    const children = store.getChildrenIds(nodeId);
    const isLeaf = children.length === 0;

    let mya = 0;
    if (isDivergenceNode(node)) {
      mya = node.divergence_mya;
    }

    const x = myaToX(mya);
    let y: number;

    if (isLeaf) {
      y = leafYMap.get(nodeId) || 0;
    } else {
      let ySum = 0;
      for (const childId of children) {
        const childPos = traverse(childId, depth + 1);
        ySum += childPos.y;
      }
      y = ySum / children.length;
    }

    let color = '#94a3b8';
    if (node.kingdom && DOMAIN_COLORS[node.kingdom]) {
      color = DOMAIN_COLORS[node.kingdom];
    }

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
      thumbnailUrl: isTaxonNode(node) ? node.thumbnail_url : undefined,
      divergenceMya: isDivergenceNode(node) ? node.divergence_mya : 0,
      geologicalEra: isDivergenceNode(node) ? node.geological_era : 'Cenozoic',
      kingdom: node.kingdom
    };

    renderNodesMap.set(nodeId, rNode);
    return { x, y };
  };

  traverse(rootId, 0);

  // Build orthogonal branches
  for (const edge of store.getAllEdges()) {
    const src = renderNodesMap.get(edge.source_id);
    const tgt = renderNodesMap.get(edge.target_id);

    if (src && tgt) {
      const isMRCAEdge = options.activeMRCAIds
        ? (options.activeMRCAIds.has(src.id) && options.activeMRCAIds.has(tgt.id))
        : false;

      // Orthogonal step points: (src.x, src.y) -> (src.x, tgt.y) -> (tgt.x, tgt.y)
      renderEdges.push({
        id: edge.id,
        source: src,
        target: tgt,
        branchLengthMya: edge.branch_length_mya,
        isMRCAPath: isMRCAEdge,
        color: isMRCAEdge ? '#f43f5e' : src.color,
        pathPoints: [
          { x: src.x, y: src.y },
          { x: src.x, y: tgt.y },
          { x: tgt.x, y: tgt.y }
        ]
      });
    }
  }

  // Linear Geological Era bands
  const rings: GeologicalRing[] = GEOLOGICAL_ERAS_TIMELINE.map(eraInfo => {
    const startX = myaToX(eraInfo.startMya);
    const endX = myaToX(eraInfo.endMya);
    return {
      era: eraInfo.era,
      startMya: eraInfo.startMya,
      endMya: eraInfo.endMya,
      innerRadius: Math.min(startX, endX),
      outerRadius: Math.max(startX, endX),
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
