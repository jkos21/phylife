import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { type PhyNode, isTaxonNode, isDivergenceNode } from '../graph/types.ts';

export class NodeInspector {
  private element: HTMLElement;
  private backdrop: HTMLElement;
  private store: PhyGraphStore;
  private currentNode: PhyNode | null = null;
  private onNodeSelectCallback?: (nodeId: string) => void;
  private onFindMRCACallback?: (nodeId: string) => void;

  constructor(
    store: PhyGraphStore,
    onNodeSelect?: (nodeId: string) => void,
    onFindMRCA?: (nodeId: string) => void
  ) {
    this.store = store;
    this.onNodeSelectCallback = onNodeSelect;
    this.onFindMRCACallback = onFindMRCA;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'drawer-backdrop';

    this.element = document.createElement('aside');
    this.element.className = 'node-inspector-drawer';

    this.backdrop.addEventListener('click', () => this.close());
    this.renderEmpty();
  }

  public getBackdrop(): HTMLElement {
    return this.backdrop;
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public inspect(node: PhyNode): void {
    this.currentNode = node;
    this.render();
    this.open();
  }

  public open(): void {
    this.backdrop.classList.add('active');
    this.element.classList.add('open');
  }

  public close(): void {
    this.backdrop.classList.remove('active');
    this.element.classList.remove('open');
  }

  private renderEmpty(): void {
    this.element.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted);">
        Select any node in the tree to inspect its taxonomic lineage, divergence timescale, and morphology.
      </div>
    `;
  }

  private render(): void {
    if (!this.currentNode) return;

    const node = this.currentNode;
    const isTaxon = isTaxonNode(node);
    const lineage = this.store.getLineage(node.id);

    const title = isTaxon ? node.scientific_name : node.name;
    const commonName = node.common_name || (isTaxon ? 'Unspecified common name' : 'Ancestral Divergence Clade');
    const thumbUrl = isTaxon && node.thumbnail_url
      ? node.thumbnail_url
      : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';

    const extinctionBadge = isTaxon
      ? (node.extinct
          ? `<span class="badge badge-extinct">💀 Extinct (${node.extinction_era || 'Fossil record'})</span>`
          : `<span class="badge badge-extant">🌿 Extant (Living)</span>`)
      : `<span class="badge" style="color: #f59e0b;">⏳ Divergence Milestone</span>`;

    const domainBadge = node.kingdom
      ? `<span class="badge" style="color: var(--domain-${node.kingdom.toLowerCase()});">${node.kingdom}</span>`
      : '';

    const rankBadge = isTaxon
      ? `<span class="badge">${node.rank.toUpperCase()}</span>`
      : `<span class="badge">${isDivergenceNode(node) ? `${node.divergence_mya} Ma` : 'CLADE'}</span>`;

    this.element.innerHTML = `
      <div class="drawer-header">
        <img class="drawer-header-img" src="${thumbUrl}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'">
        <div class="drawer-header-gradient"></div>
        <button class="drawer-close-btn" id="drawer-close" title="Close Inspector">✕</button>
      </div>

      <div class="drawer-body">
        <div class="taxon-title-row">
          <h2 class="taxon-scientific-name">${title}</h2>
          <div class="taxon-common-name">${commonName}</div>
        </div>

        <div class="badge-row">
          ${domainBadge}
          ${rankBadge}
          ${extinctionBadge}
        </div>

        ${isTaxon && node.description ? `
          <div>
            <div class="section-label">Overview & Morphology</div>
            <p style="font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);">${node.description}</p>
          </div>
        ` : ''}

        ${isDivergenceNode(node) ? `
          <div class="source-card" style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); padding: 14px;">
            <div style="font-size: 11px; font-weight: 700; color: #f43f5e; text-transform: uppercase;">Evolutionary Milestone</div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-top: 4px;">${node.evolutionary_milestone || node.name}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
              Divergence: <strong>${node.divergence_mya} Ma</strong> • Geological Era: <strong>${node.geological_era}</strong>
            </div>
          </div>
        ` : ''}

        ${isTaxon && node.temporal_range ? `
          <div class="source-card">
            <div class="source-card-label">Temporal Range / Fossil Record</div>
            <div class="source-card-val">${node.temporal_range}</div>
          </div>
        ` : ''}

        ${isTaxon && node.traits && node.traits.length > 0 ? `
          <div>
            <div class="section-label">Key Diagnostic Evolutionary Traits</div>
            <div class="badge-row">
              ${node.traits.map(t => `<span class="badge" style="background: var(--bg-primary);">${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div>
          <div class="section-label">Full Phylogenetic Lineage (${lineage.length} Ancestral Nodes)</div>
          <div class="lineage-breadcrumbs">
            ${lineage.map((anc, idx) => {
              const ancName = isTaxonNode(anc) ? (anc.common_name || anc.scientific_name) : (anc.common_name || anc.name);
              return `
                <span class="lineage-chip" data-node-id="${anc.id}">
                  ${ancName}
                </span>
                ${idx < lineage.length - 1 ? '<span style="color: var(--text-muted); font-size: 10px;">→</span>' : ''}
              `;
            }).join('')}
          </div>
        </div>

        <div>
          <div class="section-label">External Database Identifiers & Studies</div>
          <div class="source-ids-grid">
            <div class="source-card">
              <div class="source-card-label">Open Tree OTT ID</div>
              <div class="source-card-val">${(node as any).ott_id || 'ott_auto'}</div>
            </div>
            <div class="source-card">
              <div class="source-card-label">GBIF Backbone Key</div>
              <div class="source-card-val">${(node as any).gbif_key || 'gbif_synced'}</div>
            </div>
            ${(node as any).wfo_id ? `
              <div class="source-card">
                <div class="source-card-label">World Flora Online (WFO)</div>
                <div class="source-card-val">${(node as any).wfo_id}</div>
              </div>
            ` : ''}
            ${(node as any).mycobank_id ? `
              <div class="source-card">
                <div class="source-card-label">MycoBank ID</div>
                <div class="source-card-val">${(node as any).mycobank_id}</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${isTaxon ? `
          <button class="btn-primary" id="btn-find-mrca-with-node" style="justify-content: center; margin-top: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            Find Common Ancestor (MRCA) with this Taxon
          </button>
        ` : ''}
      </div>
    `;

    this.element.querySelector('#drawer-close')?.addEventListener('click', () => this.close());

    // Lineage navigation clicks
    this.element.querySelectorAll('.lineage-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.getAttribute('data-node-id');
        if (id && this.onNodeSelectCallback) {
          this.onNodeSelectCallback(id);
        }
      });
    });

    this.element.querySelector('#btn-find-mrca-with-node')?.addEventListener('click', () => {
      if (this.onFindMRCACallback) {
        this.onFindMRCACallback(node.id);
      }
    });
  }
}
