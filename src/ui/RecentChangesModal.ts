import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { deltaSyncEngine } from '../services/deltaSyncEngine.ts';

export class RecentChangesModal {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private onInspectNodeCallback?: (nodeId: string) => void;
  private onDeltaAppliedCallback?: () => void;
  private isOpen = false;

  constructor(
    store: PhyGraphStore,
    onInspectNode?: (nodeId: string) => void,
    onDeltaApplied?: () => void
  ) {
    this.store = store;
    this.onInspectNodeCallback = onInspectNode;
    this.onDeltaAppliedCallback = onDeltaApplied;

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.element.id = 'recent-changes-modal';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Recent Taxonomic and Phylogenomic Updates');

    this.element.addEventListener('click', e => {
      if (e.target === this.element) {
        this.close();
      }
    });

    this.render();
    this.initGlobalKeys();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(): void {
    this.isOpen = true;
    this.render();
    this.element.classList.add('active');
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('active');
  }

  private initGlobalKeys(): void {
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private render(): void {
    const summary = deltaSyncEngine.getRecentChangesSummary(this.store);

    this.element.innerHTML = `
      <div class="modal-dialog" style="max-width: 650px; max-height: 85vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;" aria-hidden="true">✨</span>
              <h2 class="modal-title">Recent Taxonomic & Phylogenomic Updates</h2>
            </div>
            <p class="modal-subtitle">
              Incremental delta updates, newly discovered extinct species, and recalibrated divergence dates.
            </p>
          </div>
          <button class="modal-close-btn" id="recent-modal-close" aria-label="Close updates modal" title="Close updates modal (Escape)">✕</button>
        </div>

        <div class="modal-body" style="overflow-y: auto; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Summary Metrics Banner -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" role="region" aria-label="Dataset Summary">
            <div class="source-card" style="text-align: center; padding: 12px;">
              <div class="source-card-label">Dataset Version</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--accent-primary); margin-top: 4px;">${summary.currentVersion}</div>
            </div>
            <div class="source-card" style="text-align: center; padding: 12px;">
              <div class="source-card-label">New Taxa Added</div>
              <div style="font-size: 15px; font-weight: 700; color: #10b981; margin-top: 4px;">${summary.newTaxaCount} Taxa</div>
            </div>
            <div class="source-card" style="text-align: center; padding: 12px;">
              <div class="source-card-label">Modified Clades</div>
              <div style="font-size: 15px; font-weight: 700; color: #f59e0b; margin-top: 4px;">${summary.modifiedNodesCount} Clades</div>
            </div>
          </div>

          <!-- Quick Delta Sync Action -->
          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-md); padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13.5px; font-weight: 600; color: var(--text-primary);">
                ⚡ Apply 2026 Phylogenomic Delta Patch
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Injects latest Spinosaurus aquatic biome data, Asgard archaea imaging, and Denisovan hominin markers.
              </div>
            </div>
            <button class="btn-primary" id="btn-apply-2026-delta" style="font-size: 12px; padding: 6px 12px; white-space: nowrap;" title="Apply 2026 Phylogenomic Delta Patch" aria-label="Apply 2026 Phylogenomic Delta Patch">
              Load Delta
            </button>
          </div>

          <!-- Recent Items List -->
          <div>
            <div style="font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 10px;">
              Recently Updated Taxa & Clades (${summary.recentItems.length})
            </div>

            ${summary.recentItems.length === 0 ? `
              <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;" role="status">
                No delta changes in current session. Click "Load Delta" above to simulate live scientific updates!
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;" role="feed" aria-label="Recent updates list">
                ${summary.recentItems.map(item => `
                  <div class="recent-change-item" 
                       data-node-id="${item.id}" 
                       role="button"
                       tabindex="0"
                       aria-label="Inspect ${item.name} (${item.status === 'new' ? 'New Taxon' : 'Revised'})"
                       style="
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 12px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all var(--transition-fast);
                  ">
                    <div style="flex: 1; min-width: 0; padding-right: 12px;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-weight: 600; font-size: 13.5px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${item.name}
                        </span>
                        <span class="badge" style="font-size: 10px; ${item.status === 'new' ? 'color: #10b981; background: rgba(16, 185, 129, 0.15);' : 'color: #f59e0b; background: rgba(245, 158, 11, 0.15);'}">
                          ${item.status === 'new' ? '✨ NEW TAXON' : '🔄 REVISED'}
                        </span>
                      </div>
                      ${item.discoveryNote ? `
                        <div style="font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${item.discoveryNote}
                        </div>
                      ` : ''}
                    </div>

                    <button class="btn-secondary" style="font-size: 11px; padding: 4px 8px;" tabindex="-1" aria-hidden="true">Inspect →</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>

        <div class="modal-footer" style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end;">
          <button class="btn-secondary" id="btn-recent-close" aria-label="Close recent updates modal" title="Close recent updates modal">Close</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    this.element.querySelector('#recent-modal-close')?.addEventListener('click', () => this.close());
    this.element.querySelector('#btn-recent-close')?.addEventListener('click', () => this.close());

    // Apply 2026 delta patch
    this.element.querySelector('#btn-apply-2026-delta')?.addEventListener('click', () => {
      const patch = deltaSyncEngine.getCurated2026DeltaPatch();
      deltaSyncEngine.applyDeltaPatch(this.store, patch);
      this.render();
      if (this.onDeltaAppliedCallback) {
        this.onDeltaAppliedCallback();
      }
    });

    // Node click and keyboard navigation
    this.element.querySelectorAll('.recent-change-item').forEach(item => {
      const inspect = () => {
        const id = item.getAttribute('data-node-id');
        if (id && this.onInspectNodeCallback) {
          this.close();
          this.onInspectNodeCallback(id);
        }
      };

      item.addEventListener('click', inspect);
      item.addEventListener('keydown', e => {
        if ((e as KeyboardEvent).key === 'Enter') {
          inspect();
        }
      });
    });
  }
}
