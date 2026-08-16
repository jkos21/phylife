import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { type PhyNode, type TaxonNode, type TaxonMediaPackage, isTaxonNode, isDivergenceNode } from '../graph/types.ts';
import { mediaFetcher } from '../pipeline/mediaFetcher.ts';
import { cladeExpansionService } from '../services/cladeExpansionService.ts';

export type NodeInspectorTab = 'overview' | 'species' | 'media' | 'videos' | 'podcasts' | 'lineage';

export class NodeInspector {
  private element: HTMLElement;
  private backdrop: HTMLElement;
  private store: PhyGraphStore;
  private currentNode: PhyNode | null = null;
  private currentTab: NodeInspectorTab = 'overview';
  private mediaPackage: TaxonMediaPackage | null = null;
  private isLoadingMedia: boolean = false;
  private isOpen: boolean = false;
  private speciesSearchQuery: string = '';

  private onNodeSelectCallback?: (nodeId: string) => void;
  private onFindMRCACallback?: (nodeId: string) => void;
  private onCladeExpandedCallback?: (cladeId: string) => void;
  private onFocusCladeCallback?: (cladeId: string | null) => void;

  constructor(
    store: PhyGraphStore,
    onNodeSelect?: (nodeId: string) => void,
    onFindMRCA?: (nodeId: string) => void,
    onCladeExpanded?: (cladeId: string) => void,
    onFocusClade?: (cladeId: string | null) => void
  ) {
    this.store = store;
    this.onNodeSelectCallback = onNodeSelect;
    this.onFindMRCACallback = onFindMRCA;
    this.onCladeExpandedCallback = onCladeExpanded;
    this.onFocusCladeCallback = onFocusClade;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'drawer-backdrop';
    this.backdrop.setAttribute('aria-hidden', 'true');

    this.element = document.createElement('aside');
    this.element.className = 'node-inspector-drawer';
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'Taxon and Clade Inspector');

    this.backdrop.addEventListener('click', () => this.close());
    this.renderEmpty();
    this.initGlobalKeys();
  }

  public getBackdrop(): HTMLElement {
    return this.backdrop;
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public async inspect(node: PhyNode): Promise<void> {
    this.currentNode = node;
    this.speciesSearchQuery = '';
    this.mediaPackage = null;
    this.render();
    this.open();

    if (isTaxonNode(node)) {
      this.isLoadingMedia = true;
      try {
        this.mediaPackage = await mediaFetcher.fetchCompleteMediaPackage(node);
      } catch (err) {
        console.warn('Failed to load media package', err);
      } finally {
        this.isLoadingMedia = false;
        // Re-render if still looking at the same node
        if (this.currentNode && this.currentNode.id === node.id) {
          this.render();
        }
      }
    }
  }

  public setTab(tab: NodeInspectorTab): void {
    this.currentTab = tab;
    this.render();
  }

  public open(): void {
    this.isOpen = true;
    this.backdrop.classList.add('active');
    this.element.classList.add('open');
  }

  public close(): void {
    this.isOpen = false;
    this.backdrop.classList.remove('active');
    this.element.classList.remove('open');
  }

  private initGlobalKeys(): void {
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private renderEmpty(): void {
    this.element.innerHTML = `
      <div style="padding: 30px; text-align: center; color: var(--text-muted);">
        Select any node in the tree to inspect its taxonomic lineage, member species, media, and evolutionary timescale.
      </div>
    `;
  }

  private render(): void {
    if (!this.currentNode) return;

    const node = this.currentNode;
    const isTaxon = isTaxonNode(node);
    const taxon = isTaxon ? (node as TaxonNode) : null;
    const lineage = this.store.getLineage(node.id);
    const cladeSpecies = this.store.getCladeSpecies(node.id);

    const title = isTaxon ? node.scientific_name : node.name;
    const commonName = node.common_name || (isTaxon ? 'Unspecified common name' : 'Ancestral Divergence Clade');
    
    // Header image
    let thumbUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
    if (taxon) {
      if (this.mediaPackage && this.mediaPackage.images.length > 0) {
        thumbUrl = this.mediaPackage.images[0].thumbnailUrl;
      } else if (taxon.thumbnail_url) {
        thumbUrl = taxon.thumbnail_url;
      }
    } else if (cladeSpecies.length > 0 && cladeSpecies[0].thumbnail_url) {
      thumbUrl = cladeSpecies[0].thumbnail_url;
    }

    const extinctionBadge = isTaxon
      ? (taxon!.extinct
          ? `<span class="badge badge-extinct">💀 Extinct (${taxon!.extinction_era || 'Fossil record'})</span>`
          : `<span class="badge badge-extant">🌿 Extant (Living)</span>`)
      : `<span class="badge" style="color: #f59e0b; background: rgba(245, 158, 11, 0.15);">⏳ Divergence Milestone</span>`;

    const deltaBadge = node.delta_status === 'new'
      ? `<span class="badge" style="color: #10b981; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4);">✨ NEW TAXON</span>`
      : node.is_recently_updated
      ? `<span class="badge" style="color: var(--accent-primary); background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4);">🔄 RECENTLY REVISED</span>`
      : '';

    const domainBadge = node.kingdom
      ? `<span class="badge" style="color: var(--domain-${node.kingdom.toLowerCase()}); background: rgba(255, 255, 255, 0.05);">${node.kingdom}</span>`
      : '';

    const rankBadge = isTaxon
      ? `<span class="badge">${taxon!.rank.toUpperCase()}</span>`
      : `<span class="badge">${isDivergenceNode(node) ? `${node.divergence_mya} Ma` : 'CLADE'}</span>`;

    this.element.innerHTML = `
      <div class="drawer-header">
        <img class="drawer-header-img" src="${thumbUrl}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'">
        <div class="drawer-header-gradient"></div>
        <button class="drawer-close-btn" id="drawer-close" aria-label="Close Inspector" title="Close Inspector (Escape)">✕</button>
      </div>

      <div class="drawer-body" style="padding-top: 14px;">
        <div class="taxon-title-row">
          <h2 class="taxon-scientific-name">${title}</h2>
          <div class="taxon-common-name">${commonName}</div>
        </div>

        <div class="badge-row" style="margin-top: 8px;">
          ${domainBadge}
          ${rankBadge}
          ${extinctionBadge}
          ${deltaBadge}
        </div>

        <!-- Tab Navigation -->
        <div class="inspector-tabs" role="tablist" aria-label="Inspector Views" style="display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin: 14px 0 10px 0; padding-bottom: 4px; overflow-x: auto;">
          <button class="tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'overview'}" data-tab="overview">Overview</button>
          <button class="tab-btn ${this.currentTab === 'species' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'species'}" data-tab="species">
            🦁 Species (${cladeSpecies.length})
          </button>
          ${isTaxon ? `
            <button class="tab-btn ${this.currentTab === 'videos' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'videos'}" data-tab="videos">
              🎬 Videos ${this.mediaPackage?.videos.length ? `(${this.mediaPackage.videos.length})` : ''}
            </button>
            <button class="tab-btn ${this.currentTab === 'podcasts' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'podcasts'}" data-tab="podcasts">
              🎙️ Podcasts ${this.mediaPackage?.podcasts.length ? `(${this.mediaPackage.podcasts.length})` : ''}
            </button>
            <button class="tab-btn ${this.currentTab === 'media' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'media'}" data-tab="media">📸 Photos</button>
          ` : ''}
          <button class="tab-btn ${this.currentTab === 'lineage' ? 'active' : ''}" role="tab" aria-selected="${this.currentTab === 'lineage'}" data-tab="lineage">🌿 Lineage</button>
        </div>

        <!-- Tab Contents -->
        <div class="tab-content-container" role="tabpanel">
          ${this.renderTabContent(node, isTaxon, lineage, cladeSpecies)}
        </div>

        <!-- Action Row -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
          <button class="btn-primary" id="btn-focus-clade" style="justify-content: center; width: 100%;" title="Focus and Isolate this Clade on Tree" aria-label="Focus and Isolate this Clade on Tree">
            🎯 Focus Subtree on Canvas
          </button>

          <button class="btn-secondary" id="btn-expand-clade" style="justify-content: center; width: 100%;" title="Expand Clade & Sibling Lineages" aria-label="Expand Clade and Sibling Lineages">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            ⚡ Expand Clade & Sibling Lineages
          </button>

          ${isTaxon ? `
            <button class="btn-secondary" id="btn-find-mrca-with-node" style="justify-content: center; width: 100%;" title="Find Common Ancestor (MRCA) with this Taxon" aria-label="Find Common Ancestor (MRCA) with this Taxon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
              Find Common Ancestor (MRCA) with this Taxon
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this.attachEvents(node, cladeSpecies);
  }

  private renderTabContent(node: PhyNode, isTaxon: boolean, lineage: PhyNode[], cladeSpecies: TaxonNode[]): string {
    if (this.currentTab === 'overview') {
      return this.renderOverviewTab(node, isTaxon, cladeSpecies);
    }
    if (this.currentTab === 'species') {
      return this.renderSpeciesTab(node, isTaxon, cladeSpecies);
    }
    if (this.currentTab === 'videos') {
      return this.renderVideosTab();
    }
    if (this.currentTab === 'podcasts') {
      return this.renderPodcastsTab();
    }
    if (this.currentTab === 'media') {
      return this.renderMediaTab();
    }
    if (this.currentTab === 'lineage') {
      return this.renderLineageTab(lineage);
    }
    return '';
  }

  private renderOverviewTab(node: PhyNode, isTaxon: boolean, cladeSpecies: TaxonNode[]): string {
    const taxon = isTaxon ? (node as TaxonNode) : null;
    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${node.recent_discovery_note ? `
          <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
              <span>✨ Recent Taxonomic / Scientific Update</span>
            </div>
            <div style="font-size: 13px; color: var(--text-primary); margin-top: 4px; line-height: 1.4;">
              ${node.recent_discovery_note}
            </div>
            ${node.updated_at ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Updated: ${node.updated_at}</div>` : ''}
          </div>
        ` : ''}

        ${cladeSpecies.length > 0 ? `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: var(--text-primary);">
                ${isTaxon ? `Related Species in Group (${cladeSpecies.length})` : `Member Species in Clade (${cladeSpecies.length})`}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Drill down and inspect all animals and lineages in this group.
              </div>
            </div>
            <button class="btn-secondary" id="btn-quick-view-species" style="font-size: 11px; padding: 4px 8px;">
              View All ↗
            </button>
          </div>
        ` : ''}

        ${isTaxon && taxon?.description ? `
          <div>
            <div class="section-label">Overview & Morphology</div>
            <p style="font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);">${taxon.description}</p>
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

        ${isTaxon && taxon?.temporal_range ? `
          <div class="source-card">
            <div class="source-card-label">Temporal Range / Fossil Record</div>
            <div class="source-card-val">${taxon.temporal_range}</div>
          </div>
        ` : ''}

        ${isTaxon && taxon?.habitat ? `
          <div class="source-card">
            <div class="source-card-label">Habitat & Distribution</div>
            <div class="source-card-val">${taxon.habitat}</div>
          </div>
        ` : ''}

        ${isTaxon && taxon?.traits && taxon.traits.length > 0 ? `
          <div>
            <div class="section-label">Key Diagnostic Evolutionary Traits</div>
            <div class="badge-row">
              ${taxon.traits.map(t => `<span class="badge" style="background: var(--bg-primary);">${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div>
          <div class="section-label">External Database Identifiers & Studies</div>
          <div class="source-ids-grid">
            <div class="source-card">
              <div class="source-card-label">Open Tree OTT ID</div>
              <div class="source-card-val">${(node as any).ott_id || 'ott_synced'}</div>
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
      </div>
    `;
  }

  private renderSpeciesTab(node: PhyNode, _isTaxon: boolean, cladeSpecies: TaxonNode[]): string {
    const isClade = isDivergenceNode(node);
    const filterQuery = this.speciesSearchQuery.toLowerCase().trim();
    const filtered = filterQuery
      ? cladeSpecies.filter(sp =>
          sp.scientific_name.toLowerCase().includes(filterQuery) ||
          (sp.common_name && sp.common_name.toLowerCase().includes(filterQuery)) ||
          (sp.traits && sp.traits.some(t => t.toLowerCase().includes(filterQuery)))
        )
      : cladeSpecies;

    if (cladeSpecies.length === 0) {
      return `
        <div style="text-align: center; padding: 25px; color: var(--text-muted);">
          No member species found in this group yet. Click <strong>⚡ Expand Clade</strong> to fetch and graft additional sister lineages.
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">
            ${isClade ? `All Member Species (${cladeSpecies.length})` : `Sister Species & Lineage Members (${cladeSpecies.length})`}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">Click any animal to drill down</span>
        </div>

        <!-- Quick Filter Input inside Drawer -->
        <input type="text"
               class="search-input species-filter-input"
               style="padding: 7px 10px; font-size: 12px; border-radius: var(--radius-sm);"
               placeholder="Filter species by name or trait..."
               value="${this.speciesSearchQuery}">

        <div class="species-cards-grid" style="display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto;">
          ${filtered.map(sp => {
            const isCurrent = sp.id === node.id;
            const thumb = sp.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80';
            const extinctBadge = sp.extinct
              ? `<span class="badge badge-extinct" style="font-size: 9px; padding: 1px 4px;">💀 Extinct (${sp.extinction_era || 'Fossil'})</span>`
              : `<span class="badge badge-extant" style="font-size: 9px; padding: 1px 4px;">🌿 Living</span>`;

            return `
              <div class="species-drilldown-card ${isCurrent ? 'selected' : ''}"
                   data-species-id="${sp.id}"
                   style="
                     display: flex;
                     gap: 10px;
                     background: ${isCurrent ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)'};
                     border: 1px solid ${isCurrent ? 'var(--accent-primary)' : 'var(--border-color)'};
                     border-radius: var(--radius-md);
                     padding: 10px;
                     transition: all var(--transition-fast);
                     cursor: pointer;
                   ">
                <img src="${thumb}" alt="${sp.scientific_name}" style="width: 58px; height: 58px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; background: #000;" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80'">
                
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                      <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${sp.scientific_name}
                      </span>
                      ${extinctBadge}
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 1px;">
                      ${sp.common_name || 'Unspecified common name'}
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                    <span style="font-size: 10.5px; color: var(--text-muted);">
                      ${sp.temporal_range || ''}
                    </span>
                    <div style="display: flex; gap: 4px;">
                      <button class="btn-secondary btn-species-inspect" data-id="${sp.id}" style="font-size: 10px; padding: 2px 6px;">
                        Inspect ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private renderVideosTab(): string {
    if (this.isLoadingMedia) {
      return `<div style="text-align: center; padding: 25px; color: var(--text-muted);">Fetching educational videos & documentaries...</div>`;
    }

    if (!this.mediaPackage || this.mediaPackage.videos.length === 0) {
      return `<div style="text-align: center; padding: 25px; color: var(--text-muted);">No videos found for this species.</div>`;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 4px;">
          Ranked using your Science Communicator & Creator preferences.
        </div>
        ${this.mediaPackage.videos.map(v => `
          <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="media-card-link" style="
            display: flex;
            gap: 12px;
            background: var(--bg-surface);
            border: 1px solid ${v.isCreatorMatch ? 'var(--accent-primary)' : 'var(--border-color)'};
            border-radius: var(--radius-md);
            padding: 10px;
            text-decoration: none;
            color: inherit;
            transition: all var(--transition-fast);
          ">
            <div style="position: relative; width: 95px; height: 60px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; background: #000;">
              <img src="${v.thumbnailUrl}" alt="${v.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80'">
              <div style="position: absolute; bottom: 3px; right: 3px; background: rgba(0,0,0,0.8); color: #fff; font-size: 9px; padding: 1px 3px; border-radius: 2px;">
                ${v.duration || 'Video'}
              </div>
            </div>

            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <span style="font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${v.title}
                  </span>
                </div>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 11px; color: ${v.isCreatorMatch ? 'var(--accent-primary)' : 'var(--text-muted)'}; font-weight: 600;">
                  ${v.isCreatorMatch ? `⭐ ${v.creator}` : v.creator}
                </span>
                <span style="font-size: 10px; color: var(--text-muted);">Watch on ${v.platform} ↗</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  private renderPodcastsTab(): string {
    if (this.isLoadingMedia) {
      return `<div style="text-align: center; padding: 25px; color: var(--text-muted);">Fetching podcast episodes & audio talks...</div>`;
    }

    if (!this.mediaPackage || this.mediaPackage.podcasts.length === 0) {
      return `<div style="text-align: center; padding: 25px; color: var(--text-muted);">No podcast episodes found for this species.</div>`;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 4px;">
          Audio episodes, scientific discussions, and expert interviews.
        </div>
        ${this.mediaPackage.podcasts.map(p => `
          <a href="${p.webUrl}" target="_blank" rel="noopener noreferrer" class="media-card-link" style="
            display: flex;
            flex-direction: column;
            gap: 6px;
            background: var(--bg-surface);
            border: 1px solid ${p.isCreatorMatch ? 'var(--accent-primary)' : 'var(--border-color)'};
            border-radius: var(--radius-md);
            padding: 12px;
            text-decoration: none;
            color: inherit;
            transition: all var(--transition-fast);
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span style="font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.3;">
                ${p.title}
              </span>
              ${p.isCreatorMatch ? `<span class="badge" style="font-size: 9px; padding: 2px 5px; color: var(--accent-primary);">⭐ FAVORITE</span>` : ''}
            </div>

            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
              ${p.description || ''}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">
                🎙️ ${p.showName} • ${p.duration || 'Full Episode'}
              </span>
              <span style="font-size: 11px; color: var(--accent-primary);">Listen ↗</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  private renderMediaTab(): string {
    if (!this.mediaPackage || this.mediaPackage.images.length === 0) {
      return `<div style="text-align: center; padding: 25px; color: var(--text-muted);">No additional images available.</div>`;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${this.mediaPackage.images.map(img => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
            <img src="${img.originalUrl || img.thumbnailUrl}" alt="${img.caption || ''}" style="width: 100%; max-height: 240px; object-fit: cover;" onerror="this.src='${img.thumbnailUrl}'">
            <div style="padding: 10px;">
              <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${img.caption || ''}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between;">
                <span>Source: ${img.source}</span>
                <span>${img.license || 'Public / CC'}</span>
              </div>
            </div>
          </div>
        `).join('')}

        ${this.mediaPackage.wikipediaUrl ? `
          <a href="${this.mediaPackage.wikipediaUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="justify-content: center; margin-top: 6px;">
            📖 Read Full Wikipedia Monograph ↗
          </a>
        ` : ''}
      </div>
    `;
  }

  private renderLineageTab(lineage: PhyNode[]): string {
    return `
      <div>
        <div class="section-label">Full Phylogenetic Lineage (${lineage.length} Ancestral Nodes)</div>
        <div class="lineage-breadcrumbs" role="list" aria-label="Phylogenetic lineage" style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
          ${lineage.map((anc, idx) => {
            const ancName = isTaxonNode(anc) ? (anc.common_name ? `${anc.scientific_name} (${anc.common_name})` : anc.scientific_name) : (anc.common_name || anc.name);
            const era = isDivergenceNode(anc) ? ` • ${anc.divergence_mya} Ma (${anc.geological_era})` : '';
            return `
              <div class="lineage-chip" 
                   data-node-id="${anc.id}" 
                   role="button" 
                   tabindex="0"
                   aria-label="Inspect ancestral node L${idx + 1}: ${ancName}${era}"
                   style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">
                <span style="font-size: 13px; font-weight: 500;">
                  <strong style="color: var(--text-muted); font-size: 11px; margin-right: 6px;">L${idx + 1}</strong> ${ancName}
                </span>
                <span style="font-size: 11px; color: var(--text-muted);">${era}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private attachEvents(node: PhyNode, cladeSpecies: TaxonNode[]): void {
    this.element.querySelector('#drawer-close')?.addEventListener('click', () => this.close());

    // Tab buttons
    this.element.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as NodeInspectorTab;
        if (tab) {
          this.currentTab = tab;
          this.render();
        }
      });
    });

    // Quick view species button on overview tab
    this.element.querySelector('#btn-quick-view-species')?.addEventListener('click', () => {
      this.currentTab = 'species';
      this.render();
    });

    // Focus clade button
    this.element.querySelector('#btn-focus-clade')?.addEventListener('click', () => {
      if (this.onFocusCladeCallback) {
        this.onFocusCladeCallback(node.id);
      }
    });

    // Expand clade button
    const expandBtn = this.element.querySelector('#btn-expand-clade') as HTMLButtonElement | null;
    expandBtn?.addEventListener('click', async () => {
      if (expandBtn) {
        expandBtn.disabled = true;
        expandBtn.innerHTML = `<span>⏳ Connecting to GBIF & Open Tree of Life...</span>`;
      }

      try {
        await cladeExpansionService.expandCladeLive(this.store, node.id);
        if (this.onCladeExpandedCallback) {
          this.onCladeExpandedCallback(node.id);
        }
        
        // Auto-switch to species tab to show newly discovered taxa
        this.currentTab = 'species';
        this.render();
      } catch (err: any) {
        alert(err.message || 'Clade expansion could not be completed.');
        this.render();
      }
    });

    // Species search input in species tab
    const speciesFilterInput = this.element.querySelector('.species-filter-input') as HTMLInputElement;
    if (speciesFilterInput) {
      speciesFilterInput.addEventListener('input', e => {
        this.speciesSearchQuery = (e.target as HTMLInputElement).value;
        const grid = this.element.querySelector('.species-cards-grid');
        if (grid) {
          const filterQuery = this.speciesSearchQuery.toLowerCase().trim();
          const filtered = filterQuery
            ? cladeSpecies.filter(sp =>
                sp.scientific_name.toLowerCase().includes(filterQuery) ||
                (sp.common_name && sp.common_name.toLowerCase().includes(filterQuery)) ||
                (sp.traits && sp.traits.some(t => t.toLowerCase().includes(filterQuery)))
              )
            : cladeSpecies;

          grid.innerHTML = filtered.map(sp => {
            const isCurrent = sp.id === node.id;
            const thumb = sp.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80';
            const extinctBadge = sp.extinct
              ? `<span class="badge badge-extinct" style="font-size: 9px; padding: 1px 4px;">💀 Extinct (${sp.extinction_era || 'Fossil'})</span>`
              : `<span class="badge badge-extant" style="font-size: 9px; padding: 1px 4px;">🌿 Living</span>`;

            return `
              <div class="species-drilldown-card ${isCurrent ? 'selected' : ''}"
                   data-species-id="${sp.id}"
                   style="
                     display: flex;
                     gap: 10px;
                     background: ${isCurrent ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)'};
                     border: 1px solid ${isCurrent ? 'var(--accent-primary)' : 'var(--border-color)'};
                     border-radius: var(--radius-md);
                     padding: 10px;
                     transition: all var(--transition-fast);
                     cursor: pointer;
                   ">
                <img src="${thumb}" alt="${sp.scientific_name}" style="width: 58px; height: 58px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; background: #000;" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80'">
                
                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                      <span style="font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${sp.scientific_name}
                      </span>
                      ${extinctBadge}
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 1px;">
                      ${sp.common_name || 'Unspecified common name'}
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                    <span style="font-size: 10.5px; color: var(--text-muted);">
                      ${sp.temporal_range || ''}
                    </span>
                    <div style="display: flex; gap: 4px;">
                      <button class="btn-secondary btn-species-inspect" data-id="${sp.id}" style="font-size: 10px; padding: 2px 6px;">
                        Inspect ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('');

          this.attachSpeciesCardEvents();
        }
      });
    }

    this.attachSpeciesCardEvents();

    // Lineage navigation clicks and keyboard activation
    this.element.querySelectorAll('.lineage-chip').forEach(chip => {
      const selectLineage = () => {
        const id = chip.getAttribute('data-node-id');
        if (id && this.onNodeSelectCallback) {
          this.onNodeSelectCallback(id);
        }
      };

      chip.addEventListener('click', selectLineage);
      chip.addEventListener('keydown', e => {
        if ((e as KeyboardEvent).key === 'Enter') {
          selectLineage();
        }
      });
    });

    this.element.querySelector('#btn-find-mrca-with-node')?.addEventListener('click', () => {
      if (this.onFindMRCACallback) {
        this.onFindMRCACallback(node.id);
      }
    });
  }

  private attachSpeciesCardEvents(): void {
    this.element.querySelectorAll('.species-drilldown-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-species-id');
        if (id) {
          const spNode = this.store.getNode(id);
          if (spNode) {
            if (this.onNodeSelectCallback) {
              this.onNodeSelectCallback(id);
            }
            this.inspect(spNode);
          }
        }
      });
    });

    this.element.querySelectorAll('.btn-species-inspect').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (id) {
          const spNode = this.store.getNode(id);
          if (spNode) {
            if (this.onNodeSelectCallback) {
              this.onNodeSelectCallback(id);
            }
            this.inspect(spNode);
          }
        }
      });
    });
  }
}
