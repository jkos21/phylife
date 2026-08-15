export type TaxonomicRank =
  | 'domain'
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies'
  | 'clade';

export type DomainKingdom =
  | 'Metazoa'
  | 'Viridiplantae'
  | 'Fungi'
  | 'Protista'
  | 'Bacteria'
  | 'Archaea';

export type GeologicalEra =
  | 'Hadean'
  | 'Archean'
  | 'Proterozoic'
  | 'Paleozoic'
  | 'Mesozoic'
  | 'Cenozoic';

export interface VideoMediaItem {
  id: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  thumbnailUrl: string;
  duration?: string;
  url: string;
  isCreatorMatch?: boolean;
  platform: 'YouTube' | 'Vimeo' | 'WikimediaVideo';
}

export interface PodcastMediaItem {
  id: string;
  title: string;
  showName: string;
  host: string;
  episodeNumber?: string;
  audioUrl?: string;
  webUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  isCreatorMatch?: boolean;
}

export interface TaxonMediaPackage {
  scientificName: string;
  images: {
    thumbnailUrl: string;
    originalUrl?: string;
    caption?: string;
    author?: string;
    license?: string;
    source: string;
  }[];
  videos: VideoMediaItem[];
  podcasts: PodcastMediaItem[];
  wikipediaUrl?: string;
  wikispeciesUrl?: string;
}

export interface TaxonNode {
  id: string; // e.g. "ott_93302" or "taxon_homo_sapiens"
  scientific_name: string;
  common_name?: string;
  rank: TaxonomicRank;
  kingdom: DomainKingdom;
  extinct: boolean;
  extinction_era?: string;
  thumbnail_url?: string;
  description?: string;
  source_study_ids?: string[];
  ott_id?: string;
  gbif_key?: string;
  wfo_id?: string;
  mycobank_id?: string;
  temporal_range?: string; // e.g., "300,000 BP - Present" or "68 - 66 Ma"
  habitat?: string;
  traits?: string[];
  parent_id?: string;
  // Delta & Freshness tracking
  delta_status?: 'new' | 'modified' | 'synced';
  is_recently_updated?: boolean;
  updated_at?: string;
  recent_discovery_note?: string;
  // On-demand clade expansion
  is_expanded?: boolean;
  can_expand?: boolean;
  sibling_clade_ids?: string[];
  // Cached rich media
  media_package?: TaxonMediaPackage;
}

export interface DivergenceNode {
  id: string; // e.g. "clade_carnivora_intermediates" or "div_luca"
  name: string;
  common_name?: string;
  divergence_mya: number; // Million years ago (from TimeTree)
  confidence_interval?: [number, number]; // [min_mya, max_mya]
  geological_era: GeologicalEra;
  evolutionary_milestone?: string;
  kingdom?: DomainKingdom;
  parent_id?: string;
  // Delta & Freshness tracking
  delta_status?: 'new' | 'modified' | 'synced';
  is_recently_updated?: boolean;
  updated_at?: string;
  recent_discovery_note?: string;
  // On-demand clade expansion
  is_expanded?: boolean;
  can_expand?: boolean;
}

export type PhyNode = TaxonNode | DivergenceNode;

export function isTaxonNode(node: PhyNode): node is TaxonNode {
  return 'scientific_name' in node;
}

export function isDivergenceNode(node: PhyNode): node is DivergenceNode {
  return 'divergence_mya' in node && !('scientific_name' in node);
}

export interface BranchEdge {
  id: string;
  source_id: string;
  target_id: string;
  branch_length_mya: number;
  confidence_score?: number; // 0.0 - 1.0
}

export interface SynonymEdge {
  id: string;
  source_id: string;
  target_id: string;
  synonym_name: string;
  source: 'OToL' | 'WFO' | 'MycoBank' | 'GBIF';
}

export interface MRCAResult {
  taxon_a: TaxonNode;
  taxon_b: TaxonNode;
  mrca_node: PhyNode;
  divergence_mya: number;
  confidence_interval?: [number, number];
  geological_era: GeologicalEra;
  evolutionary_milestone?: string;
  path_a: string[]; // Node IDs from taxon_a up to MRCA
  path_b: string[]; // Node IDs from taxon_b up to MRCA
  full_path: string[]; // Node IDs from taxon_a -> MRCA -> taxon_b
  shared_lineage_names: string[];
  divergence_delta_mya: number; // Age difference from present
}

export interface TaxonSearchFilter {
  query?: string;
  kingdoms?: DomainKingdom[];
  ranks?: TaxonomicRank[];
  extinctOnly?: boolean;
  extantOnly?: boolean;
  maxDivergenceMya?: number;
  minDivergenceMya?: number;
}

export interface GraphStatistics {
  totalNodes: number;
  totalTaxonNodes: number;
  totalDivergenceNodes: number;
  totalEdges: number;
  domainCounts: Record<DomainKingdom, number>;
  rankCounts: Partial<Record<TaxonomicRank, number>>;
  extinctCount: number;
  oldestDivergenceMya: number;
  rootId: string;
}

export interface GraphSerializedData {
  version: string;
  timestamp: string;
  root_id: string;
  taxa: TaxonNode[];
  divergences: DivergenceNode[];
  edges: BranchEdge[];
  synonyms?: SynonymEdge[];
}
