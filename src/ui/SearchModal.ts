import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { type PhyNode, isTaxonNode, type DomainKingdom } from '../graph/types.ts';
import { externalTaxonomyService, type GlobalTaxonMatch } from '../services/ExternalTaxonomyService.ts';
import { cladeExpansionService } from '../services/cladeExpansionService.ts';

export class SearchModal {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private onSelectCallback: (node: PhyNode) => void;
  private isOpen = false;
  private selectedDomain: DomainKingdom | null = null;
  private selectedIndex = 0;
  private currentLocalResults: PhyNode[] = [];
  private currentGlobalResults: GlobalTaxonMatch[] = [];
  private totalSelectableItems: Array<{ type: 'local'; node: PhyNode } | { type: 'global'; match: GlobalTaxonMatch }> = [];
  private debounceTimer: any = null;
  private isSearchingGlobal = false;

  constructor(store: PhyGraphStore, onSelect: (node: PhyNode) => void) {
    this.store = store;
    this.onSelectCallback = onSelect;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.render();
    this.initGlobalKeys();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(): void {
    this.isOpen = true;
    this.element.classList.add('active');
    const input = this.element.querySelector('.search-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
    this.performSearch('');
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('active');
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  private initGlobalKeys(): void {
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.isOpen) this.close();
        else this.open();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.totalSelectableItems.length > 0) {
            this.selectedIndex = Math.min(this.totalSelectableItems.length - 1, this.selectedIndex + 1);
            this.updateSelectionHighlight();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.totalSelectableItems.length > 0) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateSelectionHighlight();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const selectedItem = this.totalSelectableItems[this.selectedIndex];
          if (selectedItem) {
            if (selectedItem.type === 'local') {
              this.onSelectCallback(selectedItem.node);
              this.close();
            } else {
              this.handleSelectGlobalTaxon(selectedItem.match);
            }
          }
        }
      }
    });
  }

  public async performSearchAsync(query: string): Promise<void> {
    const filter = {
      query,
      kingdoms: this.selectedDomain ? [this.selectedDomain] : undefined
    };

    // 1. Instant local indexed search
    this.currentLocalResults = this.store.search(filter).slice(0, 20);
    this.currentGlobalResults = [];
    this.rebuildSelectableItems();
    this.selectedIndex = 0;
    this.renderResults();

    // 2. Global Biodiversity Search (GBIF & OToL)
    if (query.trim().length >= 2) {
      this.isSearchingGlobal = true;
      try {
        const globalMatches = await externalTaxonomyService.searchGlobalTaxa(query, 8);
        const filtered = globalMatches.filter(m => {
          if (this.selectedDomain && m.kingdom !== this.selectedDomain) return false;
          const cleanId = `tax_${(m.canonicalName || m.scientificName || '').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}`;
          if (this.store.getNode(cleanId)) return false;
          const mSciName = (m.scientificName || '').toLowerCase();
          return !this.currentLocalResults.some(l => {
            const lSciName = isTaxonNode(l) ? (l.scientific_name || '').toLowerCase() : '';
            const lName = !isTaxonNode(l) ? (l.name || '').toLowerCase() : (l.common_name || '').toLowerCase();
            return (lSciName && lSciName === mSciName) || (lName && lName === mSciName);
          });
        });

        this.currentGlobalResults = filtered;
        this.rebuildSelectableItems();
        this.renderResults();
      } catch (err) {
        console.warn('Global taxonomy search error:', err);
      } finally {
        this.isSearchingGlobal = false;
      }
    } else {
      this.isSearchingGlobal = false;
    }
  }

  private performSearch(query: string): void {
    const filter = {
      query,
      kingdoms: this.selectedDomain ? [this.selectedDomain] : undefined
    };

    // 1. Instant local indexed search
    this.currentLocalResults = this.store.search(filter).slice(0, 20);
    this.currentGlobalResults = [];
    this.rebuildSelectableItems();
    this.selectedIndex = 0;
    this.renderResults();

    // 2. Debounced Global Biodiversity Search (GBIF & OToL)
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (query.trim().length >= 2) {
      this.isSearchingGlobal = true;
      this.debounceTimer = setTimeout(() => {
        this.performSearchAsync(query);
      }, 100);
    } else {
      this.isSearchingGlobal = false;
    }
  }

  private rebuildSelectableItems(): void {
    this.totalSelectableItems = [
      ...this.currentLocalResults.map(node => ({ type: 'local' as const, node })),
      ...this.currentGlobalResults.map(match => ({ type: 'global' as const, match }))
    ];
  }

  private updateSelectionHighlight(): void {
    const items = this.element.querySelectorAll('.search-result-item, .global-search-result-item');
    items.forEach((el, idx) => {
      el.classList.toggle('selected', idx === this.selectedIndex);
      if (idx === this.selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  private async handleSelectGlobalTaxon(match: GlobalTaxonMatch): Promise<void> {
    const list = this.element.querySelector('.search-results-list');
    if (list) {
      const loader = document.createElement('div');
      loader.className = 'grafting-toast';
      loader.style.cssText = 'position: sticky; bottom: 8px; background: rgba(56, 189, 248, 0.95); color: #000; padding: 8px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 10;';
      loader.innerHTML = `<span>⏳ Grafting "${match.scientificName}" into Tree of Life...</span>`;
      list.appendChild(loader);
    }

    try {
      const graftedNode = await cladeExpansionService.graftUnlistedTaxon(this.store, match.scientificName);
      this.onSelectCallback(graftedNode);
      this.close();
    } catch (err: any) {
      alert(`Could not graft taxon: ${err.message || 'Unknown error'}`);
    }
  }

  private renderResults(): void {
    const list = this.element.querySelector('.search-results-list');
    if (!list) return;

    if (this.currentLocalResults.length === 0 && this.currentGlobalResults.length === 0) {
      list.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;" role="status">
          ${this.isSearchingGlobal ? 'Searching global taxonomic registry (GBIF & Open Tree of Life)...' : 'No matching taxa found. Try searching for any animal, plant, fungus or clade (e.g. "Cheetah", "Orca", "Giant Panda", "Smilodon", "Triceratops", "LUCA").'}
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Local Knowledge Graph Matches
    if (this.currentLocalResults.length > 0) {
      html += `
        <div class="search-section-label" style="padding: 8px 14px 4px; font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between;">
          <span>🌳 In Tree of Life (${this.currentLocalResults.length})</span>
          <span>Indexed</span>
        </div>
      `;

      html += this.currentLocalResults.map((node, localIdx) => {
        const globalItemIdx = localIdx;
        const isTaxon = isTaxonNode(node);
        const title = isTaxon ? node.scientific_name : node.name;
        const sub = isTaxon
          ? `${node.common_name || node.rank} • ${node.kingdom}${node.extinct ? ' • (Extinct)' : ''}`
          : `${node.common_name || 'Divergence Clade'} • ${node.divergence_mya} Ma (${node.geological_era})`;

        return `
          <div class="search-result-item ${globalItemIdx === this.selectedIndex ? 'selected' : ''}" 
               data-id="${node.id}" 
               data-item-index="${globalItemIdx}"
               id="search-opt-${globalItemIdx}"
               role="option" 
               aria-selected="${globalItemIdx === this.selectedIndex}"
               tabindex="0"
               aria-label="${title}, ${sub}">
            <div class="result-main">
              <div class="result-name">${title}</div>
              <div class="result-sub">${sub}</div>
            </div>
            <span class="kbd-shortcut">${isTaxon ? node.rank : 'Clade'}</span>
          </div>
        `;
      }).join('');
    }

    // 2. Global External Taxonomy Discoveries (GBIF & OpenTree)
    if (this.currentGlobalResults.length > 0) {
      const localCount = this.currentLocalResults.length;
      html += `
        <div class="search-section-label" style="padding: 10px 14px 4px; font-size: 10.5px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); margin-top: 6px;">
          <span>🌐 Global Biodiversity Discoveries (GBIF & OpenTree)</span>
          <span>Click to Graft</span>
        </div>
      `;

      html += this.currentGlobalResults.map((match, idx) => {
        const globalItemIdx = localCount + idx;
        const rankBadge = `<span class="badge" style="font-size: 9px; padding: 2px 5px; color: var(--accent-primary); border-color: rgba(56, 189, 248, 0.3);">${match.rank.toUpperCase()}</span>`;
        const kingdomBadge = `<span class="badge" style="font-size: 9px; padding: 2px 5px; color: var(--domain-${match.kingdom.toLowerCase()}); border-color: rgba(255, 255, 255, 0.1);">${match.kingdom}</span>`;
        const extinctBadge = match.isExtinct ? `<span class="badge badge-extinct" style="font-size: 9px; padding: 1px 4px;">💀 Fossil</span>` : '';

        const lineageContext = match.family || match.order || match.genus ? `Family: ${match.family || match.genus || match.order}` : 'Global Species Registry';

        return `
          <div class="search-result-item global-search-result-item ${globalItemIdx === this.selectedIndex ? 'selected' : ''}" 
               data-scientific-name="${match.scientificName}" 
               data-item-index="${globalItemIdx}"
               id="search-opt-${globalItemIdx}"
               role="option" 
               aria-selected="${globalItemIdx === this.selectedIndex}"
               tabindex="0"
               style="border-left: 2px solid var(--accent-primary);"
               aria-label="Discover and graft ${match.scientificName} ${match.commonName || ''}">
            <div class="result-main">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="result-name" style="font-weight: 700;">${match.scientificName}</span>
                ${match.commonName ? `<span style="font-size: 12px; color: var(--text-secondary);">(${match.commonName})</span>` : ''}
              </div>
              <div class="result-sub" style="margin-top: 2px; display: flex; align-items: center; gap: 5px;">
                ${kingdomBadge}
                ${rankBadge}
                ${extinctBadge}
                <span style="color: var(--text-muted); font-size: 11px;">• ${lineageContext}</span>
              </div>
            </div>
            <button class="btn-secondary" style="font-size: 10px; padding: 3px 8px; color: var(--accent-primary); border-color: rgba(56, 189, 248, 0.4);" title="Graft into Tree">
              ⚡ Graft ↗
            </button>
          </div>
        `;
      }).join('');
    }

    list.innerHTML = html;

    // Attach click events for all items
    list.querySelectorAll('.search-result-item').forEach(item => {
      if (item.classList.contains('global-search-result-item')) {
        const selectGlobal = () => {
          const name = item.getAttribute('data-scientific-name');
          if (name) {
            const match = this.currentGlobalResults.find(m => m.scientificName === name);
            if (match) {
              this.handleSelectGlobalTaxon(match);
            }
          }
        };

        item.addEventListener('click', selectGlobal);
        item.addEventListener('keydown', e => {
          if ((e as KeyboardEvent).key === 'Enter') {
            selectGlobal();
          }
        });
      } else {
        const selectItem = () => {
          const id = item.getAttribute('data-id');
          const node = this.store.getNode(id || '');
          if (node) {
            this.onSelectCallback(node);
            this.close();
          }
        };

        item.addEventListener('click', selectItem);
        item.addEventListener('keydown', e => {
          if ((e as KeyboardEvent).key === 'Enter') {
            selectItem();
          }
        });
      }
    });
  }

  private render(): void {
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Search tree of life');

    this.element.innerHTML = `
      <div class="search-modal">
        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" 
                 class="search-input" 
                 placeholder="Search tree of life or discover any species (GBIF / OpenTree)..." 
                 aria-label="Search tree of life or discover any species"
                 aria-autocomplete="list"
                 aria-controls="search-results-list"
                 autofocus>
          <button class="drawer-close-btn" id="search-modal-close" aria-label="Close search (Escape)" title="Close search (Escape)" style="position: static; width: 26px; height: 26px; font-size: 11px;">✕</button>
        </div>

        <div style="padding: 10px 16px 0; display: flex; gap: 6px; flex-wrap: wrap;" role="toolbar" aria-label="Filter search by taxonomic domain">
          <button class="badge domain-chip active" data-domain="all" aria-pressed="true" aria-label="Show all domains">All Domains</button>
          <button class="badge domain-chip" data-domain="Metazoa" aria-pressed="false" aria-label="Filter animals" style="border-color: var(--domain-metazoa);">Animals</button>
          <button class="badge domain-chip" data-domain="Viridiplantae" aria-pressed="false" aria-label="Filter plants" style="border-color: var(--domain-plantae);">Plants</button>
          <button class="badge domain-chip" data-domain="Fungi" aria-pressed="false" aria-label="Filter fungi" style="border-color: var(--domain-fungi);">Fungi</button>
          <button class="badge domain-chip" data-domain="Protista" aria-pressed="false" aria-label="Filter protists" style="border-color: var(--domain-protista);">Protists</button>
          <button class="badge domain-chip" data-domain="Bacteria" aria-pressed="false" aria-label="Filter bacteria" style="border-color: var(--domain-bacteria);">Bacteria</button>
          <button class="badge domain-chip" data-domain="Archaea" aria-pressed="false" aria-label="Filter archaea" style="border-color: var(--domain-archaea);">Archaea</button>
        </div>

        <!-- Featured Animal Lineage & Clade Quick Chips -->
        <div style="padding: 8px 16px 0; display: flex; gap: 5px; flex-wrap: wrap; align-items: center;" role="toolbar" aria-label="Quick jump to popular animal clades">
          <span style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-right: 2px;">Lineages:</span>
          <button class="badge clade-quick-chip" data-query="Tyrannosaur" style="cursor: pointer; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">🦖 Tyrannosauroids</button>
          <button class="badge clade-quick-chip" data-query="Dromaeosaur" style="cursor: pointer; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">🦅 Raptors</button>
          <button class="badge clade-quick-chip" data-query="Sauropod" style="cursor: pointer; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">🦕 Sauropods</button>
          <button class="badge clade-quick-chip" data-query="Ornithischia" style="cursor: pointer; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">🛡️ Horned / Armored</button>
          <button class="badge clade-quick-chip" data-query="Felidae" style="cursor: pointer; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">🦁 Big Cats & Sabertooths</button>
          <button class="badge clade-quick-chip" data-query="Cetacea" style="cursor: pointer; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3);">🐋 Whales</button>
          <button class="badge clade-quick-chip" data-query="Homo" style="cursor: pointer; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">🧠 Early Humans</button>
          <button class="badge clade-quick-chip" data-query="Shark" style="cursor: pointer; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3);">🦈 Sharks & Megalodon</button>
          <button class="badge clade-quick-chip" data-query="Arthropod" style="cursor: pointer; background: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.3);">🦟 Megafauna Arthropods</button>
        </div>

        <div class="search-results-list" id="search-results-list" role="listbox" aria-label="Search suggestions"></div>
      </div>
    `;

    // Backdrop click close
    this.element.addEventListener('click', e => {
      if (e.target === this.element) this.close();
    });

    this.element.querySelector('#search-modal-close')?.addEventListener('click', () => this.close());

    const input = this.element.querySelector('.search-input') as HTMLInputElement;
    input.addEventListener('input', e => {
      this.performSearch((e.target as HTMLInputElement).value);
    });

    // Clade quick chips
    this.element.querySelectorAll('.clade-quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query') || '';
        input.value = query;
        this.performSearch(query);
      });
    });

    // Domain chips
    this.element.querySelectorAll('.domain-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.element.querySelectorAll('.domain-chip').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');

        const domain = chip.getAttribute('data-domain');
        this.selectedDomain = domain === 'all' ? null : (domain as DomainKingdom);
        this.performSearch(input.value);
      });
    });
  }
}
