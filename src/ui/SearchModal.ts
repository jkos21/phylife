import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import { type PhyNode, isTaxonNode, type DomainKingdom } from '../graph/types.ts';

export class SearchModal {
  private element: HTMLElement;
  private store: PhyGraphStore;
  private onSelectCallback: (node: PhyNode) => void;
  private isOpen = false;
  private selectedDomain: DomainKingdom | null = null;
  private selectedIndex = 0;
  private currentResults: PhyNode[] = [];

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
          this.selectedIndex = Math.min(this.currentResults.length - 1, this.selectedIndex + 1);
          this.updateSelectionHighlight();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = Math.max(0, this.selectedIndex - 1);
          this.updateSelectionHighlight();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (this.currentResults[this.selectedIndex]) {
            this.onSelectCallback(this.currentResults[this.selectedIndex]);
            this.close();
          }
        }
      }
    });
  }

  private performSearch(query: string): void {
    const filter = {
      query,
      kingdoms: this.selectedDomain ? [this.selectedDomain] : undefined
    };

    this.currentResults = this.store.search(filter).slice(0, 30);
    this.selectedIndex = 0;
    this.renderResults();
  }

  private updateSelectionHighlight(): void {
    const items = this.element.querySelectorAll('.search-result-item');
    items.forEach((el, idx) => {
      el.classList.toggle('selected', idx === this.selectedIndex);
      if (idx === this.selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  private renderResults(): void {
    const list = this.element.querySelector('.search-results-list');
    if (!list) return;

    if (this.currentResults.length === 0) {
      list.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching taxa or clades found. Try searching for "Homo", "Lion", "Fungi", "Cyanobacteria", or "LUCA".
        </div>
      `;
      return;
    }

    list.innerHTML = this.currentResults.map((node, idx) => {
      const isTaxon = isTaxonNode(node);
      const title = isTaxon ? node.scientific_name : node.name;
      const sub = isTaxon
        ? `${node.common_name || node.rank} • ${node.kingdom}${node.extinct ? ' • (Extinct)' : ''}`
        : `${node.common_name || 'Divergence Clade'} • ${node.divergence_mya} Ma (${node.geological_era})`;

      return `
        <div class="search-result-item ${idx === this.selectedIndex ? 'selected' : ''}" data-id="${node.id}">
          <div class="result-main">
            <div class="result-name">${title}</div>
            <div class="result-sub">${sub}</div>
          </div>
          <span class="kbd-shortcut">${isTaxon ? node.rank : 'Clade'}</span>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const node = this.store.getNode(id || '');
        if (node) {
          this.onSelectCallback(node);
          this.close();
        }
      });
    });
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="search-modal">
        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" class="search-input" placeholder="Search tree of life (scientific or common name)..." autofocus>
          <span class="kbd-shortcut">ESC</span>
        </div>

        <div style="padding: 10px 16px 0; display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="badge domain-chip active" data-domain="all">All Domains</button>
          <button class="badge domain-chip" data-domain="Metazoa" style="border-color: var(--domain-metazoa);">Animals</button>
          <button class="badge domain-chip" data-domain="Viridiplantae" style="border-color: var(--domain-plantae);">Plants</button>
          <button class="badge domain-chip" data-domain="Fungi" style="border-color: var(--domain-fungi);">Fungi</button>
          <button class="badge domain-chip" data-domain="Protista" style="border-color: var(--domain-protista);">Protists</button>
          <button class="badge domain-chip" data-domain="Bacteria" style="border-color: var(--domain-bacteria);">Bacteria</button>
          <button class="badge domain-chip" data-domain="Archaea" style="border-color: var(--domain-archaea);">Archaea</button>
        </div>

        <div class="search-results-list"></div>
      </div>
    `;

    // Backdrop click close
    this.element.addEventListener('click', e => {
      if (e.target === this.element) this.close();
    });

    const input = this.element.querySelector('.search-input') as HTMLInputElement;
    input.addEventListener('input', e => {
      this.performSearch((e.target as HTMLInputElement).value);
    });

    // Domain chips
    this.element.querySelectorAll('.domain-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.element.querySelectorAll('.domain-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const domain = chip.getAttribute('data-domain');
        this.selectedDomain = domain === 'all' ? null : (domain as DomainKingdom);
        this.performSearch(input.value);
      });
    });
  }
}
