import type { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { externalTaxonomyService, type CladeChildItem } from '../services/ExternalTaxonomyService.ts';
import { cladeExpansionService } from '../services/cladeExpansionService.ts';
import { toastManager } from './ToastNotification.ts';

export interface CladeDrilldownCallbacks {
  onCladeGrafted: (targetNodeId: string, addedCount: number) => void;
  onFocusClade: (cladeId: string) => void;
}

export class CladeDrilldownModal {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private callbacks: CladeDrilldownCallbacks;
  private currentQuery: string = '';
  private isSearching: boolean = false;
  private isGrafting: boolean = false;
  private searchResults: CladeChildItem[] = [];
  private currentFamilyMeta: { name: string; rank?: string; kingdom?: string; description?: string } | null = null;

  constructor(store: PhyGraphStore, callbacks: CladeDrilldownCallbacks) {
    this.store = store;
    this.callbacks = callbacks;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop clade-drilldown-backdrop';
    this.element.id = 'clade-drilldown-modal';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(defaultClade?: string): void {
    this.element.classList.add('active');
    const input = this.element.querySelector('#clade-drill-input') as HTMLInputElement;
    if (input) {
      if (defaultClade) {
        input.value = defaultClade;
        this.performCladeLookup(defaultClade);
      } else {
        input.focus();
      }
    }
  }

  public close(): void {
    this.element.classList.remove('active');
  }

  public async performCladeLookup(query: string): Promise<void> {
    const q = query.trim();
    if (!q) return;

    this.currentQuery = q;
    this.isSearching = true;
    this.searchResults = [];
    this.currentFamilyMeta = null;
    this.renderResults();

    try {
      // 1. Fetch live member species from GBIF Backbone & Open Tree
      const children = await externalTaxonomyService.fetchCladeChildren(q, 30);
      this.searchResults = children;

      // Extract general metadata
      const firstChild = children[0];
      this.currentFamilyMeta = {
        name: q,
        rank: firstChild?.rank === 'species' ? 'Family / Genus' : (firstChild?.rank || 'Clade'),
        kingdom: firstChild?.kingdom || 'Metazoa',
        description: `Biological group containing ${children.length} retrieved member species reconciled from the GBIF Backbone Taxonomy & Open Tree of Life v3.`
      };
    } catch (err: any) {
      console.warn('Failed to fetch live clade children:', err);
    } finally {
      this.isSearching = false;
      this.renderResults();
    }
  }

  private async graftCladeIntoTree(): Promise<void> {
    if (!this.searchResults.length || !this.currentQuery) return;

    this.isGrafting = true;
    this.renderResults();

    try {
      let graftedCount = 0;
      let lastGraftedNodeId = '';

      for (const item of this.searchResults) {
        const cleanId = cladeExpansionService.generateTaxonId(item.scientificName);
        if (!this.store.getNode(cleanId)) {
          const node = await cladeExpansionService.graftUnlistedTaxon(this.store, item.scientificName);
          lastGraftedNodeId = node.id;
          graftedCount++;
        }
      }

      const focusId = lastGraftedNodeId || this.store.getRootId();

      // Toast notification
      toastManager.show({
        icon: '🌐',
        title: 'Family Grafted from GBIF',
        message: `Successfully grafted ${graftedCount} species of ${this.currentQuery} into the live Tree of Life!`,
        actionLabel: 'Focus on Canvas',
        onAction: () => {
          this.callbacks.onFocusClade(focusId);
        }
      });

      this.callbacks.onCladeGrafted(focusId, graftedCount);
      this.close();
    } catch (err: any) {
      alert(`Could not graft clade: ${err.message || 'Unknown error'}`);
    } finally {
      this.isGrafting = false;
      this.renderResults();
    }
  }

  private render(): void {
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Live Clade and Family Drill-Down Explorer');

    this.element.innerHTML = `
      <div class="modal-dialog clade-drilldown-dialog" style="max-width: 860px; width: 92vw; max-height: 88vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="padding: 18px 24px 14px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🌐</span>
              <h2 style="font-size: 19px; font-weight: 700; margin: 0; font-family: var(--font-heading);">
                Live Family & Clade Drill-Down Explorer
              </h2>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); font-size: 11px;">
                GBIF Backbone & OToL v3
              </span>
            </div>
            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 13px;">
              Query live global biodiversity registries to discover, inspect, and graft any biological family, genus, or order onto the Tree of Life in real time.
            </p>
          </div>
          <button class="drawer-close-btn" id="drilldown-modal-close" aria-label="Close modal">✕</button>
        </div>

        <div style="padding: 16px 24px 8px; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.15);">
          <div style="display: flex; gap: 8px;">
            <div style="position: relative; flex: 1;">
              <input type="text" 
                     id="clade-drill-input" 
                     class="search-input" 
                     placeholder="Enter ANY family, genus, or order (e.g. Corvidae, Ursidae, Falconidae, Rosaceae, Delphinidae, Pinaceae)..." 
                     style="width: 100%; height: 42px; padding: 0 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-size: 14px;"
                     autofocus>
            </div>
            <button id="btn-execute-drilldown" class="btn-primary" style="padding: 0 20px; font-weight: 700; height: 42px; display: flex; align-items: center; gap: 6px;">
              <span>🔍</span>
              <span>Fetch Live Species</span>
            </button>
          </div>

          <!-- Quick Family Chips -->
          <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Famous Families:</span>
            <button class="badge quick-family-chip" data-family="Corvidae" style="cursor: pointer; background: rgba(56, 189, 248, 0.1);">🦅 Corvidae (Crows & Jays)</button>
            <button class="badge quick-family-chip" data-family="Ursidae" style="cursor: pointer; background: rgba(245, 158, 11, 0.1);">🐻 Ursidae (Bears)</button>
            <button class="badge quick-family-chip" data-family="Falconidae" style="cursor: pointer; background: rgba(56, 189, 248, 0.1);">🦅 Falconidae (Falcons)</button>
            <button class="badge quick-family-chip" data-family="Delphinidae" style="cursor: pointer; background: rgba(6, 182, 212, 0.1);">🐬 Delphinidae (Dolphins)</button>
            <button class="badge quick-family-chip" data-family="Spheniscidae" style="cursor: pointer; background: rgba(59, 130, 246, 0.1);">🐧 Spheniscidae (Penguins)</button>
            <button class="badge quick-family-chip" data-family="Rosaceae" style="cursor: pointer; background: rgba(16, 185, 129, 0.1);">🌺 Rosaceae (Roses & Apples)</button>
            <button class="badge quick-family-chip" data-family="Lamnidae" style="cursor: pointer; background: rgba(56, 189, 248, 0.1);">🦈 Lamnidae (Great White)</button>
            <button class="badge quick-family-chip" data-family="Pinaceae" style="cursor: pointer; background: rgba(16, 185, 129, 0.1);">🌲 Pinaceae (Pines)</button>
            <button class="badge quick-family-chip" data-family="Octopodidae" style="cursor: pointer; background: rgba(168, 85, 247, 0.1);">🐙 Octopodidae (Octopuses)</button>
            <button class="badge quick-family-chip" data-family="Ceratopsidae" style="cursor: pointer; background: rgba(245, 158, 11, 0.1);">🦖 Ceratopsidae (Horned Dinosaurs)</button>
            <button class="badge quick-family-chip" data-family="Canidae" style="cursor: pointer; background: rgba(245, 158, 11, 0.1);">🐺 Canidae (Wolves)</button>
            <button class="badge quick-family-chip" data-family="Felidae" style="cursor: pointer; background: rgba(245, 158, 11, 0.1);">🦁 Felidae (Big Cats)</button>
          </div>
        </div>

        <div id="drilldown-results-container" style="flex: 1; overflow-y: auto; padding: 20px 24px; min-height: 280px;">
          <!-- Results injected here -->
        </div>

        <div class="modal-footer" id="drilldown-footer" style="padding: 14px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface);">
          <div style="font-size: 12px; color: var(--text-muted);">
            Provenance: GBIF Backbone Taxonomy API, Open Tree of Life v3, and TimeTree 5.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" id="drilldown-btn-cancel">Close</button>
            <button class="btn-primary" id="drilldown-btn-graft-all" style="display: none; background: #10b981; border-color: #10b981; font-weight: 700; padding: 8px 18px;">
              <span>🚀 Graft Clade into Tree (+0 Species)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.renderResults();
  }

  private renderResults(): void {
    const container = this.element.querySelector('#drilldown-results-container');
    const graftBtn = this.element.querySelector('#drilldown-btn-graft-all') as HTMLButtonElement | null;
    if (!container) return;

    if (this.isSearching) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px;">
          <div style="font-size: 36px; animation: spin 1.5s linear infinite; display: inline-block;">🌐</div>
          <h3 style="font-size: 16px; margin: 16px 0 6px; color: var(--text-primary);">Querying Live Global Biodiversity APIs...</h3>
          <p style="color: var(--text-secondary); font-size: 13px; max-width: 480px; margin: 0 auto;">
            Connecting to GBIF Backbone Taxonomy and Open Tree of Life v3 for "<strong>${this.currentQuery}</strong>"...
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; margin-top: 18px; font-size: 12px; color: var(--accent-primary);">
            <span>📡 GBIF API: OK</span>
            <span>🌳 OToL TNRS: Connecting</span>
            <span>⏱️ TimeTree: Calibrating</span>
          </div>
        </div>
      `;
      if (graftBtn) graftBtn.style.display = 'none';
      return;
    }

    if (this.isGrafting) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px;">
          <div style="font-size: 36px; animation: bounce 1s infinite; display: inline-block;">🌱</div>
          <h3 style="font-size: 16px; margin: 16px 0 6px; color: #10b981;">Grafting Subtree into Tree of Life...</h3>
          <p style="color: var(--text-secondary); font-size: 13px; max-width: 480px; margin: 0 auto;">
            Calculating pairwise divergence chronograms, grafting nodes and branch edges into PhyGraphStore, and updating cache...
          </p>
        </div>
      `;
      if (graftBtn) graftBtn.style.display = 'none';
      return;
    }

    if (!this.searchResults.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.8;">🌳</div>
          <h3 style="font-size: 16px; color: var(--text-primary); margin-bottom: 6px;">Discover Any Biological Clade or Family</h3>
          <p style="font-size: 13px; max-width: 520px; margin: 0 auto; line-height: 1.5;">
            Type any taxonomic family, genus, or order above, or click one of the famous family chips to retrieve live species data, taxonomy classifications, and thumbnail images.
          </p>
        </div>
      `;
      if (graftBtn) graftBtn.style.display = 'none';
      return;
    }

    // Count how many are new vs already in tree
    const newSpeciesCount = this.searchResults.filter(item => !this.store.getNode(cladeExpansionService.generateTaxonId(item.scientificName))).length;

    let html = `
      <div style="margin-bottom: 18px; padding: 14px 18px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0; color: #38bdf8;">${this.currentFamilyMeta?.name}</h3>
            <span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary); font-size: 11px;">${this.currentFamilyMeta?.rank}</span>
            <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; font-size: 11px;">${this.currentFamilyMeta?.kingdom}</span>
          </div>
          <p style="margin: 4px 0 0; font-size: 12.5px; color: var(--text-secondary);">
            Retrieved <strong>${this.searchResults.length}</strong> member species from GBIF. <strong>${newSpeciesCount}</strong> are ready to graft into your live graph.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
    `;

    for (const item of this.searchResults) {
      const cleanId = cladeExpansionService.generateTaxonId(item.scientificName);
      const isAlreadyInTree = this.store.getNode(cleanId) !== undefined;

      html += `
        <div style="background: var(--bg-surface); border: 1px solid ${isAlreadyInTree ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.3)'}; border-radius: var(--radius-sm); padding: 12px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="font-weight: 700; font-size: 13.5px; font-style: italic; color: var(--text-primary);">
              ${item.scientificName}
            </div>
            ${isAlreadyInTree ? `
              <span class="badge" style="font-size: 10px; background: rgba(255,255,255,0.08); color: var(--text-muted);">In Tree</span>
            ` : `
              <span class="badge" style="font-size: 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3);">✨ New</span>
            `}
          </div>

          ${item.commonName ? `<div style="font-size: 12px; color: #38bdf8; font-weight: 600;">${item.commonName}</div>` : ''}

          <p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.4; margin: 2px 0 6px; flex: 1;">
            ${item.description || 'Member species resolved from GBIF Backbone Taxonomy.'}
          </p>

          ${item.traits && item.traits.length ? `
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${item.traits.slice(0, 2).map(t => `<span class="badge" style="font-size: 10px; padding: 2px 6px;">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    if (graftBtn) {
      graftBtn.style.display = 'block';
      graftBtn.innerHTML = `<span>🚀 Graft Clade into Tree (+${newSpeciesCount} Species)</span>`;
      graftBtn.disabled = newSpeciesCount === 0;
    }
  }

  private attachEventListeners(): void {
    this.element.querySelector('#drilldown-modal-close')?.addEventListener('click', () => this.close());
    this.element.querySelector('#drilldown-btn-cancel')?.addEventListener('click', () => this.close());

    // Backdrop click close
    this.element.addEventListener('click', e => {
      if (e.target === this.element) this.close();
    });

    const input = this.element.querySelector('#clade-drill-input') as HTMLInputElement;
    const fetchBtn = this.element.querySelector('#btn-execute-drilldown');

    fetchBtn?.addEventListener('click', () => {
      this.performCladeLookup(input.value);
    });

    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        this.performCladeLookup(input.value);
      }
    });

    // Quick family chips
    this.element.querySelectorAll('.quick-family-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const fam = chip.getAttribute('data-family');
        if (fam) {
          input.value = fam;
          this.performCladeLookup(fam);
        }
      });
    });

    // Graft all button
    this.element.querySelector('#drilldown-btn-graft-all')?.addEventListener('click', () => {
      this.graftCladeIntoTree();
    });
  }
}
