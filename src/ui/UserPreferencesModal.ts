import { userPreferences, type ScienceCreator } from '../services/userPreferences.ts';

export class UserPreferencesModal {
  private element: HTMLElement;
  private onPreferencesUpdatedCallback?: () => void;
  private isOpen = false;

  constructor(onPreferencesUpdated?: () => void) {
    this.onPreferencesUpdatedCallback = onPreferencesUpdated;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.element.id = 'preferences-modal';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Creator and Media Preferences');

    this.element.addEventListener('click', e => {
      if (e.target === this.element) {
        this.close();
      }
    });

    this.render();
    this.initGlobalKeys();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public open(): void {
    this.isOpen = true;
    this.render();
    this.element.classList.add('active');
  }

  public close(): void {
    this.isOpen = false;
    this.element.classList.remove('active');
    if (this.onPreferencesUpdatedCallback) {
      this.onPreferencesUpdatedCallback();
    }
  }

  private initGlobalKeys(): void {
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  private render(): void {
    const creators = userPreferences.getAllCreators();
    const prefs = userPreferences.getPreferences();

    this.element.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px; max-height: 85vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;" aria-hidden="true">🎙️</span>
              <h2 class="modal-title">Creator & Media Preferences</h2>
            </div>
            <p class="modal-subtitle">
              Prioritize content from your favorite science communicators, podcasters, and researchers when exploring taxa.
            </p>
          </div>
          <button class="modal-close-btn" id="prefs-modal-close" aria-label="Close preferences" title="Close preferences (Escape)">✕</button>
        </div>

        <div class="modal-body" style="overflow-y: auto; padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Delta Highlight Toggle -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                <span>✨ Highlight Recent Taxonomic Changes</span>
                <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: var(--accent-primary);">Delta Freshness</span>
              </div>
              <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">
                Visually highlight recently revised nodes, new fossil calibrations, and phylogenomic updates.
              </div>
            </div>
            <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
              <input type="checkbox" id="toggle-highlight-deltas" aria-label="Highlight Recent Taxonomic Changes" ${prefs.highlightRecentDeltas ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>

          <!-- Add Custom Creator -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
              ➕ Add Custom Science Communicator / Podcaster
            </div>
            <div style="display: flex; gap: 8px;">
              <input 
                type="text" 
                id="custom-creator-input" 
                placeholder="e.g. Neil deGrasse Tyson, Radiolab, Robert Sapolsky..." 
                aria-label="Add custom science communicator or podcaster"
                style="flex: 1; padding: 8px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px;"
              />
              <button class="btn-primary" id="btn-add-custom-creator" style="padding: 8px 14px; font-size: 13px;" aria-label="Add custom creator" title="Add custom creator">
                Add Creator
              </button>
            </div>
          </div>

          <!-- Creators Grid -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
                Curated Science Communicators & Podcasters (${creators.length})
              </div>
              <span style="font-size: 12px; color: var(--accent-primary);">
                ${userPreferences.getSelectedCreators().length} Selected
              </span>
            </div>

            <div class="creators-grid" role="group" aria-label="Science communicators and creators" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
              ${creators.map(c => this.renderCreatorCard(c)).join('')}
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding: 14px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn-secondary" id="btn-prefs-done" aria-label="Save and close preferences" title="Save and close preferences">Done & Save Preferences</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderCreatorCard(creator: ScienceCreator): string {
    const isSelected = userPreferences.isCreatorSelected(creator.id);
    return `
      <div class="creator-card ${isSelected ? 'selected' : ''}" 
           data-creator-id="${creator.id}" 
           role="checkbox"
           aria-checked="${isSelected}"
           tabindex="0"
           aria-label="${creator.name}, ${creator.category}. ${isSelected ? 'Prioritized' : 'Not prioritized'}"
           style="
        background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-surface)'};
        border: 1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'};
        border-radius: var(--radius-md);
        padding: 12px;
        cursor: pointer;
        transition: all var(--transition-fast);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      ">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <div style="font-weight: 600; font-size: 13.5px; color: ${isSelected ? 'var(--accent-primary)' : 'var(--text-primary)'};">
              ${creator.name}
            </div>
            <span class="badge" style="font-size: 10px; padding: 2px 6px;">${creator.category}</span>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px;">${creator.handle}</div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${creator.description}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; pt-2; border-top: 1px solid rgba(255, 255, 255, 0.05);">
          <span style="font-size: 11px; font-weight: 600; color: ${isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'};">
            ${isSelected ? '✓ Prioritized First' : '+ Click to Prioritize'}
          </span>
          ${creator.isCustom ? `
            <button class="btn-icon btn-delete-custom" data-creator-id="${creator.id}" aria-label="Remove custom creator ${creator.name}" title="Remove custom creator ${creator.name}" style="width: 22px; height: 22px; font-size: 11px;">✕</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  private attachEvents(): void {
    this.element.querySelector('#prefs-modal-close')?.addEventListener('click', () => this.close());
    this.element.querySelector('#btn-prefs-done')?.addEventListener('click', () => this.close());

    // Highlight deltas toggle
    const deltaToggle = this.element.querySelector('#toggle-highlight-deltas') as HTMLInputElement;
    if (deltaToggle) {
      deltaToggle.addEventListener('change', () => {
        userPreferences.setHighlightRecentDeltas(deltaToggle.checked);
      });
    }

    // Toggle creator cards
    this.element.querySelectorAll('.creator-card').forEach(card => {
      const toggle = (e: Event) => {
        if ((e.target as HTMLElement).classList.contains('btn-delete-custom')) return;
        const id = card.getAttribute('data-creator-id');
        if (id) {
          userPreferences.toggleCreator(id);
          this.render();
        }
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', e => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          (e as Event).preventDefault();
          toggle(e);
        }
      });
    });

    // Delete custom creator
    this.element.querySelectorAll('.btn-delete-custom').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-creator-id');
        if (id) {
          userPreferences.removeCustomCreator(id);
          this.render();
        }
      });
    });

    // Add custom creator
    const addBtn = this.element.querySelector('#btn-add-custom-creator');
    const input = this.element.querySelector('#custom-creator-input') as HTMLInputElement;

    const handleAdd = () => {
      const val = input.value.trim();
      if (val) {
        userPreferences.addCustomCreator(val, [val]);
        input.value = '';
        this.render();
      }
    };

    addBtn?.addEventListener('click', handleAdd);
    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAdd();
    });
  }
}
