import { PhyNode, GeologicalEra, DomainKingdom } from '../graph/types.ts';

export type LayoutMode = 'radial' | 'dendrogram';

export interface RenderNode {
  id: string;
  rawNode: PhyNode;
  x: number;
  y: number;
  radius: number;
  angle?: number; // radians (for radial layout)
  distanceFromRoot?: number;
  depth: number;
  lodLevel: number; // 0: domain/kingdom, 1: class/order, 2: family/genus, 3: species
  color: string;
  label: string;
  subLabel?: string;
  isLeaf: boolean;
  isHighlighted: boolean;
  isMRCAPath: boolean;
  isMRCANode: boolean;
  isExtinct: boolean;
  isRecentlyUpdated?: boolean;
  deltaStatus?: 'new' | 'modified' | 'synced';
  thumbnailUrl?: string;
  divergenceMya?: number;
  geologicalEra?: GeologicalEra;
  kingdom?: DomainKingdom;
}

export interface RenderEdge {
  id: string;
  source: RenderNode;
  target: RenderNode;
  branchLengthMya: number;
  isMRCAPath: boolean;
  color: string;
  // Control points for drawing
  pathPoints: { x: number; y: number }[];
}

export interface GeologicalRing {
  era: GeologicalEra;
  startMya: number;
  endMya: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  label: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
  isAnimating: boolean;
}

export interface RendererOptions {
  layoutMode: LayoutMode;
  showLabels: boolean;
  showGeologicalRings: boolean;
  showExtinctBadges: boolean;
  showThumbnails: boolean;
  highlightRecentDeltas?: boolean;
  timeCutoffMya?: number; // If set, only render branches active at or before this time
  activeMRCAIds?: Set<string>;
  hoveredNodeId?: string | null;
  selectedNodeId?: string | null;
}
