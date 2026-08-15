import { themeManager, type AppTheme } from './ThemeManager.ts';
import type { LayoutMode } from '../renderer/types.ts';

export interface NavbarCallbacks {
  onSearchClick: () => void;
  onMRCAClick: () => void;
  onPipelineClick: () => void;
  onLayoutChange: (mode: LayoutMode) => void;
  onResetView: () => void;
}

export class Navbar {
  private element: HTMLElement;
  private callbacks: NavbarCallbacks;
  private currentLayout: LayoutMode = 'radial';

  constructor(callbacks: NavbarCallbacks) {
    this.callbacks = callbacks;
    this.element = document.createElement('header');
    this.element.className = 'navbar';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public updateStats(totalNodes: number): void {
    const badge = this.element.querySelector('.brand-badge');
    if (badge) {
      badge.textContent = `${totalNodes} Taxa & Clades`;
    }
  }

  public getLayout(): LayoutMode {
    return this.currentLayout;
  }

  public setLayout(mode: LayoutMode): void {
    this.currentLayout = mode;
    const radialBtn = this.element.querySelector('#btn-layout-radial');
    const dendroBtn = this.element.querySelector('#btn-layout-dendro');

    if (radialBtn && dendroBtn) {
      if (mode === 'radial') {
        radialBtn.classList.add('active');
        dendroBtn.classList.remove('active');
      } else {
        dendroBtn.classList.add('active');
        radialBtn.classList.remove('active');
      }
    }
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="nav-brand" id="nav-brand-btn">
        <div class="brand-icon">🧬</div>
        <div class="brand-title">
          PhyLife
          <span class="brand-badge">Tree of Life</span>
        </div>
      </div>

      <div class="nav-center">
        <button class="nav-search-btn" id="nav-search-trigger" title="Search taxa and clades (Cmd+K)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search species, orders, clades...</span>
          <span class="kbd-shortcut">⌘K</span>
        </button>

        <div class="btn-group">
          <button class="btn-toggle active" id="btn-layout-radial" title="Radial Geological Phylogram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
            Radial
          </button>
          <button class="btn-toggle" id="btn-layout-dendro" title="Hierarchical Dendrogram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="6" y1="3" x2="6" y2="15"></line>
              <circle cx="18" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <path d="M18 9a9 9 0 0 1-9 9"></path>
            </svg>
            Dendrogram
          </button>
        </div>
      </div>

      <div class="nav-actions">
        <button class="btn-primary" id="btn-mrca-trigger" title="Explore Most Recent Common Ancestor">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          MRCA Finder
        </button>

        <button class="btn-icon" id="btn-pipeline-trigger" title="Ingestion Pipeline & Graph Admin">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </button>

        <select class="mrca-select" id="theme-selector" style="width: auto; padding: 6px 10px; font-size: 12px;" title="Select UI Theme">
          <option value="modern-dark">Modern Dark</option>
          <option value="bioluminescent">Bioluminescent</option>
          <option value="academic-light">Academic Light</option>
        </select>
      </div>
    `;

    // Event listeners
    this.element.querySelector('#nav-brand-btn')?.addEventListener('click', () => {
      this.callbacks.onResetView();
    });

    this.element.querySelector('#nav-search-trigger')?.addEventListener('click', () => {
      this.callbacks.onSearchClick();
    });

    this.element.querySelector('#btn-mrca-trigger')?.addEventListener('click', () => {
      this.callbacks.onMRCAClick();
    });

    this.element.querySelector('#btn-pipeline-trigger')?.addEventListener('click', () => {
      this.callbacks.onPipelineClick();
    });

    this.element.querySelector('#btn-layout-radial')?.addEventListener('click', () => {
      this.setLayout('radial');
      this.callbacks.onLayoutChange('radial');
    });

    this.element.querySelector('#btn-layout-dendro')?.addEventListener('click', () => {
      this.setLayout('dendrogram');
      this.callbacks.onLayoutChange('dendrogram');
    });

    const themeSelect = this.element.querySelector('#theme-selector') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.value = themeManager.getTheme();
      themeSelect.addEventListener('change', e => {
        const val = (e.target as HTMLSelectElement).value as AppTheme;
        themeManager.setTheme(val);
      });
    }
  }
}
