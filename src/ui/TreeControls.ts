export interface TreeControlCallbacks {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleRings: (show: boolean) => void;
  onToggleLabels: (show: boolean) => void;
  onToggleDeltas: (show: boolean) => void;
}

export class TreeControls {
  private element: HTMLElement;
  private callbacks: TreeControlCallbacks;
  private showRings = true;
  private showLabels = true;
  private showDeltas = true;

  constructor(callbacks: TreeControlCallbacks) {
    this.callbacks = callbacks;
    this.element = document.createElement('div');
    this.element.className = 'floating-dock';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private render(): void {
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Phylogenetic Tree Viewport Controls');

    this.element.innerHTML = `
      <button class="btn-icon" id="ctrl-zoom-in" aria-label="Zoom In (+)" title="Zoom In (+)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>

      <button class="btn-icon" id="ctrl-zoom-out" aria-label="Zoom Out (-)" title="Zoom Out (-)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>

      <button class="btn-icon" id="ctrl-reset" aria-label="Reset Viewport to Origin" title="Reset Viewport to Origin">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>

      <div style="height: 1px; background-color: var(--border-color); margin: 2px 0;" aria-hidden="true"></div>

      <button class="btn-icon active" id="ctrl-toggle-rings" role="button" aria-pressed="true" aria-label="Toggle Geological Era Rings and Bands" title="Toggle Geological Era Rings/Bands">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      </button>

      <button class="btn-icon active" id="ctrl-toggle-labels" role="button" aria-pressed="true" aria-label="Toggle Clade and Taxon Labels" title="Toggle Clade & Taxon Labels">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      </button>

      <button class="btn-icon active" id="ctrl-toggle-deltas" role="button" aria-pressed="true" aria-label="Toggle Highlight of Recent Taxonomic Changes (✨)" title="Toggle Highlight of Recent Taxonomic Changes (✨)">
        <span style="font-size: 14px; line-height: 1;" aria-hidden="true">✨</span>
      </button>
    `;

    this.element.querySelector('#ctrl-zoom-in')?.addEventListener('click', () => this.callbacks.onZoomIn());
    this.element.querySelector('#ctrl-zoom-out')?.addEventListener('click', () => this.callbacks.onZoomOut());
    this.element.querySelector('#ctrl-reset')?.addEventListener('click', () => this.callbacks.onReset());

    const ringsBtn = this.element.querySelector('#ctrl-toggle-rings');
    ringsBtn?.addEventListener('click', () => {
      this.showRings = !this.showRings;
      ringsBtn.classList.toggle('active', this.showRings);
      ringsBtn.setAttribute('aria-pressed', String(this.showRings));
      this.callbacks.onToggleRings(this.showRings);
    });

    const labelsBtn = this.element.querySelector('#ctrl-toggle-labels');
    labelsBtn?.addEventListener('click', () => {
      this.showLabels = !this.showLabels;
      labelsBtn.classList.toggle('active', this.showLabels);
      labelsBtn.setAttribute('aria-pressed', String(this.showLabels));
      this.callbacks.onToggleLabels(this.showLabels);
    });

    const deltasBtn = this.element.querySelector('#ctrl-toggle-deltas');
    deltasBtn?.addEventListener('click', () => {
      this.showDeltas = !this.showDeltas;
      deltasBtn.classList.toggle('active', this.showDeltas);
      deltasBtn.setAttribute('aria-pressed', String(this.showDeltas));
      this.callbacks.onToggleDeltas(this.showDeltas);
    });
  }
}
