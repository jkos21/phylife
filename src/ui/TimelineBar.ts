import type { GeologicalEra } from '../graph/types.ts';

export class TimelineBar {
  private element: HTMLElement;
  private currentMya: number = 0;
  private onChangeCallback?: (mya: number) => void;

  constructor(onChange?: (mya: number) => void) {
    this.onChangeCallback = onChange;
    this.element = document.createElement('div');
    this.element.className = 'timeline-container';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public getMya(): number {
    return this.currentMya;
  }

  public setMya(mya: number): void {
    this.currentMya = mya;
    const slider = this.element.querySelector('.timeline-slider') as HTMLInputElement;
    const valText = this.element.querySelector('#timeline-active-val');
    const eraText = mya === 0 ? 'Present Day (0 Ma)' : `${mya.toLocaleString()} Ma (${this.getEraName(mya)})`;
    if (slider) {
      slider.value = String(mya);
      slider.setAttribute('aria-valuenow', String(mya));
      slider.setAttribute('aria-valuetext', eraText);
    }
    if (valText) {
      valText.textContent = eraText;
    }
  }

  private getEraName(mya: number): GeologicalEra {
    if (mya > 4000) return 'Hadean';
    if (mya > 2500) return 'Archean';
    if (mya > 541) return 'Proterozoic';
    if (mya > 252) return 'Paleozoic';
    if (mya > 66) return 'Mesozoic';
    return 'Cenozoic';
  }

  private render(): void {
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'Geological Chronogram and Divergence Timeline');

    this.element.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Geological Chronogram & Divergence Timeline
        </div>
        <div class="timeline-value" id="timeline-active-val" role="status" aria-live="polite">Present Day (0 Ma)</div>
      </div>

      <div class="timeline-slider-track">
        <input type="range" 
               class="timeline-slider" 
               min="0" 
               max="4200" 
               step="10" 
               value="0" 
               aria-label="Scrub Geological Time (4,200 Ma to 0 Ma)"
               aria-valuemin="0"
               aria-valuemax="4200"
               aria-valuenow="0"
               aria-valuetext="Present Day (0 Ma)"
               title="Scrub Geological Time (4,200 Ma to 0 Ma)">
      </div>

      <div class="timeline-eras-labels" aria-hidden="true">
        <span style="color: #ef4444;" title="LUCA & Origin of Life">4.2 Ga (LUCA)</span>
        <span style="color: #f59e0b;" title="Archean (Photosynthesis & Bacteria)">2.5 Ga (Archean)</span>
        <span style="color: #3b82f6;" title="Eukaryogenesis & Multicellularity">541 Ma (Proterozoic)</span>
        <span style="color: #10b981;" title="Cambrian Explosion & Land Colonization">252 Ma (Paleozoic)</span>
        <span style="color: #a855f7;" title="Age of Dinosaurs">66 Ma (Mesozoic)</span>
        <span style="color: #06b6d4;" title="Age of Mammals & Humans">0 Ma (Cenozoic)</span>
      </div>
    `;

    const slider = this.element.querySelector('.timeline-slider') as HTMLInputElement;
    slider.addEventListener('input', e => {
      const mya = Number((e.target as HTMLInputElement).value);
      this.setMya(mya);
      if (this.onChangeCallback) {
        this.onChangeCallback(mya);
      }
    });
  }
}
