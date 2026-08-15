import type { GeologicalEra } from '../graph/types.ts';

export interface MilestoneInfo {
  mya: number;
  title: string;
  era: GeologicalEra;
  description: string;
}

export const MAJOR_MILESTONES: MilestoneInfo[] = [
  {
    mya: 4200,
    title: 'LUCA & Origin of Cellular Life',
    era: 'Hadean',
    description: 'First universal common ancestor with DNA/RNA code, ribosomes, and ATP bioenergetics.'
  },
  {
    mya: 3500,
    title: 'Bacterial Crown Radiation',
    era: 'Archean',
    description: 'Divergence of photosynthetic Cyanobacteria, Firmicutes, and deep bacterial lineages.'
  },
  {
    mya: 2700,
    title: 'Proto-Eukaryote & Archaea Split',
    era: 'Archean',
    description: 'Emergence of Asgard archaea with proto-cytoskeletal and membrane remodeling systems.'
  },
  {
    mya: 2500,
    title: 'Great Oxidation Event',
    era: 'Archean',
    description: 'Accumulation of biogenic oxygen in the atmosphere and oceans, triggering global ecological shift.'
  },
  {
    mya: 2100,
    title: 'Eukaryogenesis (LECA)',
    era: 'Proterozoic',
    description: 'Endosymbiosis of alphaproteobacteria giving rise to mitochondria and complex compartmentalized cells.'
  },
  {
    mya: 1600,
    title: 'Archaeplastida & First Plastids',
    era: 'Proterozoic',
    description: 'Primary cyanobacterial capture creating the first photosynthetic eukaryotes (plants and algae).'
  },
  {
    mya: 1100,
    title: 'Opisthokonta Divergence',
    era: 'Proterozoic',
    description: 'Split between the ancestral lineages of Metazoa (Animals) and Fungi.'
  },
  {
    mya: 541,
    title: 'Cambrian Explosion',
    era: 'Paleozoic',
    description: 'Explosive evolutionary radiation of bilaterian animal body plans and mineralized exoskeletons.'
  },
  {
    mya: 480,
    title: 'Plant Colonization of Land',
    era: 'Paleozoic',
    description: 'First embryophytes establish terrestrial plant ecosystems with cuticles and spores.'
  },
  {
    mya: 375,
    title: 'Tetrapod Water-to-Land Transition',
    era: 'Paleozoic',
    description: 'Vertebrate limb evolution allowing the first tetrapods to explore terrestrial environments.'
  },
  {
    mya: 252,
    title: 'The Great Dying (Permian Extinction)',
    era: 'Paleozoic',
    description: 'Catastrophic mass extinction wiping out ~95% marine and ~70% terrestrial species.'
  },
  {
    mya: 230,
    title: 'Origin of Dinosaurs & Early Mammals',
    era: 'Mesozoic',
    description: 'Radiation of archosaurs, dinosaurs, and stem mammals across supercontinent Pangaea.'
  },
  {
    mya: 66,
    title: 'K-Pg Mass Extinction (Chicxulub Impact)',
    era: 'Mesozoic',
    description: 'Asteroid impact triggers extinction of non-avian dinosaurs and explosive radiation of placental mammals.'
  },
  {
    mya: 7,
    title: 'Hominin Lineage Split',
    era: 'Cenozoic',
    description: 'Divergence of early hominins from the common ancestor shared with chimpanzees.'
  },
  {
    mya: 0,
    title: 'Present Day Biosphere',
    era: 'Cenozoic',
    description: 'Modern global biodiversity spanning all domains and kingdoms of cellular life.'
  }
];

export class TimelineBar {
  private element: HTMLElement;
  private currentMya: number = 0;
  private onChangeCallback?: (mya: number) => void;
  private isPlaying: boolean = false;
  private playIntervalId: number | null = null;
  private playSpeed: number = 1; // 1x, 2x, 5x
  private activeLineagesCount: number = 0;

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

  // Mapping: slider pos (0 to 1000) -> Ma (4200 to 0) using quadratic scale
  public static sliderPosToMya(pos: number): number {
    const norm = Math.max(0, Math.min(1000, pos)) / 1000; // 0 = 4200 Ma, 1 = 0 Ma
    return Math.round(4200 * Math.pow(1 - norm, 2));
  }

  // Mapping: Ma (4200 to 0) -> slider pos (0 to 1000)
  public static myaToSliderPos(mya: number): number {
    const clamped = Math.max(0, Math.min(4200, mya));
    const norm = 1 - Math.sqrt(clamped / 4200);
    return Math.round(norm * 1000);
  }

  public setMya(mya: number, triggerCallback: boolean = true): void {
    const clampedMya = Math.max(0, Math.min(4200, Math.round(mya)));
    this.currentMya = clampedMya;

    const sliderPos = TimelineBar.myaToSliderPos(clampedMya);
    const slider = this.element.querySelector('.timeline-slider') as HTMLInputElement;
    const valText = this.element.querySelector('#timeline-active-val');
    const milestoneBox = this.element.querySelector('#timeline-milestone-text');
    const milestoneTitle = this.element.querySelector('#timeline-milestone-title');
    const eraBadge = this.element.querySelector('#timeline-era-badge');
    const eraText = clampedMya === 0 ? 'Present Day (0 Ma)' : `${clampedMya.toLocaleString()} Ma`;

    if (slider) {
      slider.value = String(sliderPos);
      slider.setAttribute('aria-valuenow', String(clampedMya));
      slider.setAttribute('aria-valuetext', `${eraText} (${this.getEraName(clampedMya)})`);
    }

    if (valText) {
      valText.textContent = eraText;
    }

    if (eraBadge) {
      eraBadge.textContent = this.getEraName(clampedMya);
      eraBadge.className = `timeline-era-badge era-${this.getEraName(clampedMya).toLowerCase()}`;
    }

    const milestone = this.getClosestMilestone(clampedMya);
    if (milestoneTitle && milestoneBox) {
      milestoneTitle.textContent = milestone.title;
      milestoneBox.textContent = milestone.description;
    }

    // Highlight active preset chip if any
    this.updateActivePresetChip(clampedMya);

    if (triggerCallback && this.onChangeCallback) {
      this.onChangeCallback(clampedMya);
    }
  }

  public updateActiveLineages(count: number): void {
    this.activeLineagesCount = count;
    const lineageBadge = this.element.querySelector('#timeline-lineages-val');
    if (lineageBadge) {
      lineageBadge.textContent = `${count} Lineages`;
    }
  }

  public getEraName(mya: number): GeologicalEra {
    if (mya >= 4000) return 'Hadean';
    if (mya >= 2500) return 'Archean';
    if (mya >= 541) return 'Proterozoic';
    if (mya >= 252) return 'Paleozoic';
    if (mya >= 66) return 'Mesozoic';
    return 'Cenozoic';
  }

  private getClosestMilestone(mya: number): MilestoneInfo {
    let closest = MAJOR_MILESTONES[0];
    let minDiff = Math.abs(mya - closest.mya);

    for (const m of MAJOR_MILESTONES) {
      const diff = Math.abs(mya - m.mya);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    }
    return closest;
  }

  private togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private play(): void {
    this.isPlaying = true;
    const playBtn = this.element.querySelector('#timeline-play-btn');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>Pause</span>
      `;
      playBtn.classList.add('active');
    }

    // If already at present day (0 Ma), loop back to LUCA (4200 Ma)
    if (this.currentMya <= 0) {
      this.setMya(4200);
    }

    const stepTime = () => {
      if (!this.isPlaying) return;

      // Nonlinear step: bigger steps in deep time, finer steps in recent eras
      let step = (this.currentMya > 1000 ? 25 : (this.currentMya > 200 ? 10 : 3)) * this.playSpeed;
      let nextMya = Math.max(0, this.currentMya - step);

      this.setMya(nextMya);

      if (nextMya <= 0) {
        this.pause();
      } else {
        this.playIntervalId = window.setTimeout(stepTime, 35);
      }
    };

    this.playIntervalId = window.setTimeout(stepTime, 35);
  }

  private pause(): void {
    this.isPlaying = false;
    if (this.playIntervalId !== null) {
      clearTimeout(this.playIntervalId);
      this.playIntervalId = null;
    }
    const playBtn = this.element.querySelector('#timeline-play-btn');
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Play</span>
      `;
      playBtn.classList.remove('active');
    }
  }

  private cycleSpeed(): void {
    const speeds = [1, 2, 4];
    const currentIndex = speeds.indexOf(this.playSpeed);
    this.playSpeed = speeds[(currentIndex + 1) % speeds.length];
    const speedBtn = this.element.querySelector('#timeline-speed-btn');
    if (speedBtn) {
      speedBtn.textContent = `${this.playSpeed}x`;
    }
  }

  private updateActivePresetChip(mya: number): void {
    const chips = this.element.querySelectorAll('.era-preset-chip');
    chips.forEach(chip => {
      const chipMya = Number(chip.getAttribute('data-mya'));
      if (Math.abs(chipMya - mya) <= 30) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  private render(): void {
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', 'Geological Chronogram and Divergence Timeline');

    const defaultMilestone = this.getClosestMilestone(0);

    this.element.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-header-left">
          <div class="timeline-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Geological Chronogram & Divergence Timeline
          </div>
          <div class="timeline-era-badge era-cenozoic" id="timeline-era-badge">Cenozoic</div>
        </div>

        <div class="timeline-header-center">
          <div class="timeline-milestone-pill" title="Key Evolutionary Milestone at this Geological Epoch">
            <span class="milestone-icon">⚡</span>
            <span class="milestone-title" id="timeline-milestone-title">${defaultMilestone.title}</span>
            <span class="milestone-desc" id="timeline-milestone-text">${defaultMilestone.description}</span>
          </div>
        </div>

        <div class="timeline-header-right">
          <div class="timeline-stat-pill" title="Active lineages alive at this epoch">
            <span class="stat-dot"></span>
            <span id="timeline-lineages-val">${this.activeLineagesCount || 'All'} Lineages</span>
          </div>
          <div class="timeline-value" id="timeline-active-val" role="status" aria-live="polite">Present Day (0 Ma)</div>
        </div>
      </div>

      <div class="timeline-slider-row">
        <div class="timeline-playback-controls">
          <button type="button" class="timeline-btn timeline-play-btn" id="timeline-play-btn" aria-label="Play evolutionary radiation time travel" title="Play 4.2 Ga Time Travel Evolution">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Play</span>
          </button>
          <button type="button" class="timeline-btn timeline-reset-btn" id="timeline-reset-btn" aria-label="Reset to Present Day" title="Reset Scrubber to Present Day (0 Ma)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          <button type="button" class="timeline-btn timeline-speed-btn" id="timeline-speed-btn" aria-label="Cycle Playback Speed" title="Cycle playback speed (1x, 2x, 4x)">1x</button>
        </div>

        <div class="timeline-slider-track">
          <input type="range" 
                 class="timeline-slider" 
                 min="0" 
                 max="1000" 
                 step="1" 
                 value="1000" 
                 aria-label="Scrub Geological Time (4,200 Ma to 0 Ma)"
                 aria-valuemin="0"
                 aria-valuemax="1000"
                 aria-valuenow="0"
                 aria-valuetext="Present Day (0 Ma)"
                 title="Scrub Geological Time (Left: 4,200 Ma LUCA → Right: 0 Ma Present Day)">
        </div>
      </div>

      <div class="timeline-presets-bar">
        <div class="timeline-presets-labels">
          <button type="button" class="era-preset-chip" data-mya="4200" title="4.2 Ga: Origin of Cellular Life & LUCA">
            <span class="chip-dot" style="background-color: #ef4444;"></span>
            <span>4.2 Ga (LUCA)</span>
          </button>
          <button type="button" class="era-preset-chip" data-mya="2500" title="2.5 Ga: Archean & Great Oxidation Event">
            <span class="chip-dot" style="background-color: #f59e0b;"></span>
            <span>2.5 Ga (Great Oxidation)</span>
          </button>
          <button type="button" class="era-preset-chip" data-mya="541" title="541 Ma: Cambrian Explosion of Animal Phyla">
            <span class="chip-dot" style="background-color: #3b82f6;"></span>
            <span>541 Ma (Cambrian)</span>
          </button>
          <button type="button" class="era-preset-chip" data-mya="252" title="252 Ma: Permian-Triassic Great Dying">
            <span class="chip-dot" style="background-color: #10b981;"></span>
            <span>252 Ma (Great Dying)</span>
          </button>
          <button type="button" class="era-preset-chip" data-mya="66" title="66 Ma: K-Pg Asteroid Impact & Dinosaur Extinction">
            <span class="chip-dot" style="background-color: #a855f7;"></span>
            <span>66 Ma (K-Pg Extinction)</span>
          </button>
          <button type="button" class="era-preset-chip active" data-mya="0" title="0 Ma: Modern Biosphere & Humans">
            <span class="chip-dot" style="background-color: #06b6d4;"></span>
            <span>0 Ma (Present)</span>
          </button>
        </div>
      </div>
    `;

    const slider = this.element.querySelector('.timeline-slider') as HTMLInputElement;
    slider.addEventListener('input', e => {
      // Nonlinear slider pos (0 to 1000) -> mya (4200 to 0)
      const sliderPos = Number((e.target as HTMLInputElement).value);
      const mya = TimelineBar.sliderPosToMya(sliderPos);
      this.pause(); // Pause auto-playback on manual interaction
      this.setMya(mya);
    });

    const playBtn = this.element.querySelector('#timeline-play-btn');
    playBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePlay();
    });

    const resetBtn = this.element.querySelector('#timeline-reset-btn');
    resetBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.pause();
      this.setMya(0);
    });

    const speedBtn = this.element.querySelector('#timeline-speed-btn');
    speedBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.cycleSpeed();
    });

    const presetChips = this.element.querySelectorAll('.era-preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const mya = Number(chip.getAttribute('data-mya'));
        this.pause();
        this.setMya(mya);
      });
    });
  }
}

