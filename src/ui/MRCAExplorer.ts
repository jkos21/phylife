import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { type MRCAResult, isDivergenceNode } from '../graph/types.ts';

export class MRCAExplorer {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private taxonAId: string = 'tax_homo_sapiens';
  private taxonBId: string = 'tax_panthera_leo';
  private onHighlightPathCallback?: (result: MRCAResult) => void;
  private isOpen = false;

  constructor(store: PhyGraphStore, onHighlightPath?: (result: MRCAResult) => void) {
    this.store = store;
    this.onHighlightPathCallback = onHighlightPath;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Most Recent Common Ancestor (MRCA) Explorer');
    this.render();
    this.initGlobalKeys();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(presetTaxonAId?: string, presetTaxonBId?: string): void {
    if (presetTaxonAId) this.taxonAId = presetTaxonAId;
    if (presetTaxonBId) this.taxonBId = presetTaxonBId;
    this.isOpen = true;
    this.element.classList.add('active');
    this.render();
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
    const allTaxa = this.store.getAllTaxa().sort((a, b) => a.scientific_name.localeCompare(b.scientific_name));
    const result = this.store.findMRCA(this.taxonAId, this.taxonBId);

    this.element.innerHTML = `
      <div class="mrca-modal">
        <div class="modal-header">
          <div class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f43f5e;" aria-hidden="true">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            Most Recent Common Ancestor (MRCA) Explorer
          </div>
          <button class="drawer-close-btn" id="mrca-close" style="position: static; width: 28px; height: 28px;" aria-label="Close MRCA Explorer" title="Close MRCA Explorer (Escape)">✕</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 13.5px; color: var(--text-secondary);">
            Select any two species from any kingdom across the Tree of Life to calculate their lowest common ancestor clade, evolutionary divergence age, and common traits.
          </p>

          <div class="mrca-picker-row">
            <div class="mrca-select-box">
              <label class="section-label" for="select-species-a">Species A</label>
              <select class="mrca-select" id="select-species-a" aria-label="Select first comparison species">
                ${allTaxa.map(t => `<option value="${t.id}" ${t.id === this.taxonAId ? 'selected' : ''}>${t.common_name ? `${t.common_name} (${t.scientific_name})` : t.scientific_name}</option>`).join('')}
              </select>
            </div>

            <div class="mrca-vs-badge" aria-hidden="true">VS</div>

            <div class="mrca-select-box">
              <label class="section-label" for="select-species-b">Species B</label>
              <select class="mrca-select" id="select-species-b" aria-label="Select second comparison species">
                ${allTaxa.map(t => `<option value="${t.id}" ${t.id === this.taxonBId ? 'selected' : ''}>${t.common_name ? `${t.common_name} (${t.scientific_name})` : t.scientific_name}</option>`).join('')}
              </select>
            </div>
          </div>

          ${result ? `
            <div class="mrca-result-card">
              <div style="font-size: 11px; font-weight: 700; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.5px;">
                Divergence Timescale (TimeTree Chronogram)
              </div>

              <div class="mrca-age-banner">
                <span class="mrca-age-number">${result.divergence_mya.toLocaleString()}</span>
                <span class="mrca-age-unit">Million Years Ago (${result.geological_era} Era)</span>
              </div>

              ${result.confidence_interval ? `
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: -6px;">
                  Confidence Interval: <strong>${result.confidence_interval[0]} - ${result.confidence_interval[1]} Ma</strong>
                </div>
              ` : ''}

              <div style="height: 1px; background: rgba(244, 63, 94, 0.2); margin: 4px 0;"></div>

              <div>
                <div class="section-label">Shared Ancestral Milestone</div>
                <div style="font-size: 14.5px; font-weight: 600; color: var(--text-primary);">
                  ${result.evolutionary_milestone}
                </div>
              </div>

              <div>
                <div class="section-label">Lowest Common Ancestor Clade</div>
                <div style="font-size: 13.5px; color: var(--text-secondary);">
                  ${isDivergenceNode(result.mrca_node) ? result.mrca_node.name : (result.mrca_node.common_name || result.mrca_node.scientific_name)}
                </div>
              </div>

              <div>
                <div class="section-label">Shared Deep Ancestry Lineage</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                  ${result.shared_lineage_names.join(' → ')}
                </div>
              </div>

              <button class="btn-primary" id="btn-highlight-mrca" style="background: linear-gradient(135deg, #f43f5e, #e11d48); justify-content: center; margin-top: 6px;" title="Trace Bioluminescent Divergence Path on Tree" aria-label="Trace Bioluminescent Divergence Path on Tree">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Trace Bioluminescent Divergence Path on Tree
              </button>
            </div>
          ` : `
            <div style="padding: 20px; text-align: center; color: var(--text-muted);">
              Unable to locate common ancestor path.
            </div>
          `}
        </div>
      </div>
    `;

    this.element.addEventListener('click', e => {
      if (e.target === this.element) this.close();
    });

    this.element.querySelector('#mrca-close')?.addEventListener('click', () => this.close());

    const selectA = this.element.querySelector('#select-species-a') as HTMLSelectElement;
    const selectB = this.element.querySelector('#select-species-b') as HTMLSelectElement;

    selectA?.addEventListener('change', e => {
      this.taxonAId = (e.target as HTMLSelectElement).value;
      this.render();
    });

    selectB?.addEventListener('change', e => {
      this.taxonBId = (e.target as HTMLSelectElement).value;
      this.render();
    });

    this.element.querySelector('#btn-highlight-mrca')?.addEventListener('click', () => {
      if (result && this.onHighlightPathCallback) {
        this.onHighlightPathCallback(result);
        this.close();
      }
    });
  }
}
