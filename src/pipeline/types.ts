export type PipelineStep =
  | 'fetch_topology'
  | 'validate_subtrees'
  | 'enrich_domains'
  | 'merge_chronograms'
  | 'cache_media'
  | 'commit_graph';

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'error';

export interface PipelineLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  step: PipelineStep;
  message: string;
  details?: any;
}

export interface PipelineProgress {
  status: PipelineStatus;
  currentStep: PipelineStep;
  stepIndex: number;
  totalSteps: number;
  progressPercent: number;
  logs: PipelineLog[];
  startTime?: number;
  endTime?: number;
  nodesProcessed?: number;
  edgesProcessed?: number;
}

export interface IngestionOptions {
  source: 'bundled_seed' | 'live_otol_apis';
  includeMedia: boolean;
  enrichWFO: boolean;
  enrichMycoBank: boolean;
  enrichGBIF: boolean;
  enrichTimeTree: boolean;
  maxTaxaLimit?: number;
}
