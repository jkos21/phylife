import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { pipelineRunner } from '../pipeline/pipelineRunner.ts';
import type { PipelineProgress } from '../pipeline/types.ts';

export class PipelineModal {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private onGraphUpdatedCallback?: () => void;
  private unsubscribeProgress?: () => void;

  constructor(store: PhyGraphStore, onGraphUpdated?: () => void) {
    this.store = store;
    this.onGraphUpdatedCallback = onGraphUpdated;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(): void {
    this.element.classList.add('active');
    this.render();

    // Subscribe to live pipeline progress
    this.unsubscribeProgress = pipelineRunner.onProgress(progress => {
      this.updateProgressUI(progress);
    });
  }

  public close(): void {
    this.element.classList.remove('active');
    if (this.unsubscribeProgress) {
      this.unsubscribeProgress();
      this.unsubscribeProgress = undefined;
    }
  }

  private updateProgressUI(progress: PipelineProgress): void {
    const fill = this.element.querySelector('.pipeline-progress-bar-fill') as HTMLElement;
    const statusText = this.element.querySelector('#pipeline-status-text');
    const logsWindow = this.element.querySelector('.terminal-window');
    const btnSync = this.element.querySelector('#btn-run-sync') as HTMLButtonElement;

    if (fill) fill.style.width = `${progress.progressPercent}%`;
    if (statusText) {
      statusText.textContent = `Step ${progress.stepIndex}/${progress.totalSteps}: ${progress.currentStep.replace(/_/g, ' ').toUpperCase()} (${progress.progressPercent}%)`;
    }

    if (btnSync) {
      btnSync.disabled = progress.status === 'running';
      btnSync.textContent = progress.status === 'running' ? 'Synchronizing Pipeline...' : 'Trigger Full ETL Pipeline Sync';
    }

    if (logsWindow) {
      logsWindow.innerHTML = progress.logs.map(log => `
        <div class="log-line log-${log.level}">
          <span style="color: #64748b;">[${log.timestamp}]</span>
          <span style="color: var(--accent-primary); font-weight: 600;">[${log.step}]</span>
          <span>${log.message}</span>
        </div>
      `).join('');
      logsWindow.scrollTop = logsWindow.scrollHeight;
    }

    if (progress.status === 'completed' && this.onGraphUpdatedCallback) {
      this.onGraphUpdatedCallback();
    }
  }

  private render(): void {
    const stats = this.store.getStatistics();

    this.element.innerHTML = `
      <div class="pipeline-modal">
        <div class="modal-header">
          <div class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary);">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Ingestion & Reconciliation Pipeline Console
          </div>
          <button class="drawer-close-btn" id="pipeline-close" style="position: static; width: 28px; height: 28px;">✕</button>
        </div>

        <div class="modal-body">
          <div class="source-ids-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="source-card">
              <div class="source-card-label">Total Graph Vertices</div>
              <div class="source-card-val">${stats.totalNodes} Nodes</div>
            </div>
            <div class="source-card">
              <div class="source-card-label">Taxa vs Clades</div>
              <div class="source-card-val">${stats.totalTaxonNodes} / ${stats.totalDivergenceNodes}</div>
            </div>
            <div class="source-card">
              <div class="source-card-label">Branch Edges</div>
              <div class="source-card-val">${stats.totalEdges} Edges</div>
            </div>
            <div class="source-card">
              <div class="source-card-label">Extinct Species</div>
              <div class="source-card-val" style="color: #f87171;">${stats.extinctCount} Recorded</div>
            </div>
          </div>

          <div>
            <div class="section-label">Pipeline Execution Status</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span id="pipeline-status-text" style="font-family: var(--font-mono); color: var(--accent-primary);">Idle / Ready</span>
            </div>
            <div class="pipeline-progress-bar-bg">
              <div class="pipeline-progress-bar-fill" style="width: 0%;"></div>
            </div>
          </div>

          <div>
            <div class="section-label">Live Ingestion & Reconciliation Logs</div>
            <div class="terminal-window">
              <div class="log-line log-info">
                <span>[${new Date().toLocaleTimeString()}] Pipeline operator initialized. Ready to sync Open Tree of Life, TimeTree, WFO, MycoBank, and GBIF.</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn-primary" id="btn-run-sync" style="flex: 1; justify-content: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              Trigger Full ETL Pipeline Sync
            </button>

            <button class="btn-toggle" id="btn-export-json" style="padding: 8px 14px;">
              Export JSON
            </button>

            <button class="btn-toggle" id="btn-export-newick" style="padding: 8px 14px;">
              Export Newick (.nwk)
            </button>
          </div>
        </div>
      </div>
    `;

    this.element.addEventListener('click', e => {
      if (e.target === this.element) this.close();
    });

    this.element.querySelector('#pipeline-close')?.addEventListener('click', () => this.close());

    this.element.querySelector('#btn-run-sync')?.addEventListener('click', async () => {
      await pipelineRunner.runSync(this.store, {
        source: 'bundled_seed',
        includeMedia: true,
        enrichWFO: true,
        enrichMycoBank: true,
        enrichGBIF: true,
        enrichTimeTree: true
      });
      if (this.onGraphUpdatedCallback) {
        this.onGraphUpdatedCallback();
      }
    });

    this.element.querySelector('#btn-export-json')?.addEventListener('click', () => {
      const data = this.store.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phylife_graph_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    this.element.querySelector('#btn-export-newick')?.addEventListener('click', () => {
      const nwk = this.store.exportNewick();
      const blob = new Blob([nwk], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phylife_tree_${Date.now()}.nwk`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
