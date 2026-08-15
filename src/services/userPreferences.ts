export interface ScienceCreator {
  id: string;
  name: string;
  handle: string;
  category: 'Paleontology' | 'Evolution' | 'Botany' | 'Zoology' | 'Microbiology' | 'General Biology';
  avatarUrl?: string;
  description: string;
  channelKeywords: string[];
  isCustom?: boolean;
}

export const PRESET_CREATORS: ScienceCreator[] = [
  {
    id: 'pbs_eons',
    name: 'PBS Eons',
    handle: '@eons',
    category: 'Paleontology',
    description: 'Deep time, ancient life, prehistoric ecosystems, and evolutionary milestones.',
    channelKeywords: ['PBS Eons', 'Eons', 'Hank Green', 'Kallie Moore', 'Gabriel Santos']
  },
  {
    id: 'david_attenborough',
    name: 'Sir David Attenborough / BBC',
    handle: '@BBCEarth',
    category: 'Zoology',
    description: 'Legendary natural history documentaries, animal behavior, and living biodiversity.',
    channelKeywords: ['David Attenborough', 'BBC Earth', 'Planet Earth', 'Life on Earth']
  },
  {
    id: 'clints_reptiles',
    name: "Clint's Reptiles",
    handle: '@ClintsReptiles',
    category: 'Evolution',
    description: 'Phylogenetic breakdowns, cladograms, evolutionary relationships, and reptile biology.',
    channelKeywords: ["Clint's Reptiles", 'Clint Laidlaw', 'phylogenetic tree', 'cladistics']
  },
  {
    id: 'ologies',
    name: 'Ologies with Alie Ward',
    handle: '@alieward',
    category: 'General Biology',
    description: 'Irreverent, hilarious, and deeply scientific interviews with world-class specialists.',
    channelKeywords: ['Ologies', 'Alie Ward', 'podcasts', 'ology']
  },
  {
    id: 'scishow',
    name: 'SciShow Biology',
    handle: '@SciShow',
    category: 'General Biology',
    description: 'Fascinating evolutionary adaptations, genetic oddities, and biological marvels.',
    channelKeywords: ['SciShow', 'Hank Green', 'Michael Aranda', 'SciShow Tangents']
  },
  {
    id: 'kurzgesagt',
    name: 'Kurzgesagt – In a Nutshell',
    handle: '@kurzgesagt',
    category: 'Evolution',
    description: 'Beautifully animated explorations of cellular origins, deep time, and life.',
    channelKeywords: ['Kurzgesagt', 'In a Nutshell', 'Origin of Life', 'Tree of Life']
  },
  {
    id: 'stefan_milo',
    name: 'Stefan Milo',
    handle: '@StefanMilo',
    category: 'Evolution',
    description: 'Human evolution, hominin ancestors, Neanderthals, and ancient anthropology.',
    channelKeywords: ['Stefan Milo', 'human evolution', 'Neanderthal', 'Hominin', 'Homo sapiens']
  },
  {
    id: 'ben_g_thomas',
    name: 'Ben G Thomas',
    handle: '@BenGThomas',
    category: 'Paleontology',
    description: 'Extinct animals, prehistoric eras, dinosaur biology, and mass extinction events.',
    channelKeywords: ['Ben G Thomas', 'prehistoric', 'extinction', 'paleontology']
  },
  {
    id: 'in_defense_of_plants',
    name: 'In Defense of Plants (Matt Candeias)',
    handle: '@indefenseofplants',
    category: 'Botany',
    description: 'Plant evolution, botanical ecology, endangered flora, and gymnosperm/angiosperm history.',
    channelKeywords: ['In Defense of Plants', 'Matt Candeias', 'botany podcast', 'flora evolution']
  },
  {
    id: 'crime_pays_botany',
    name: "Crime Pays But Botany Doesn't (Joey Santore)",
    handle: '@CrimePaysButBotanyDoesnt',
    category: 'Botany',
    description: 'High-energy, direct, field-based plant taxonomy, evolutionary morphology, and ecology.',
    channelKeywords: ['Crime Pays But Botany Doesnt', 'Joey Santore', 'botany', 'phylogeny']
  },
  {
    id: 'common_descent',
    name: 'The Common Descent Podcast',
    handle: '@CommonDescentPod',
    category: 'Paleontology',
    description: 'Two paleontologists discuss the history of life, evolutionary adaptations, and fossils.',
    channelKeywords: ['Common Descent Podcast', 'David Moscato', 'Will Harris', 'evolutionary history']
  },
  {
    id: 'nick_lane',
    name: 'Prof. Nick Lane',
    handle: '@NickLane_bio',
    category: 'Microbiology',
    description: 'Bioenergetics, mitochondrial origins, hydrothermal vents, and the origin of cellular life.',
    channelKeywords: ['Nick Lane', 'Vital Question', 'Mitochondria', 'Origin of Life', 'hydrothermal vents']
  }
];

export interface UserPreferencesData {
  favoriteCreatorIds: string[];
  customCreators: ScienceCreator[];
  autoFetchMedia: boolean;
  highlightRecentDeltas: boolean;
  enableAutoDeltaSync: boolean;
  preferredLayout: 'radial' | 'dendrogram';
  preferredTheme: string;
}

const STORAGE_KEY = 'phylife_user_preferences_v1';

export class UserPreferencesService {
  private prefs: UserPreferencesData;
  private listeners: ((prefs: UserPreferencesData) => void)[] = [];

  constructor() {
    this.prefs = this.loadPreferences();
  }

  private loadPreferences(): UserPreferencesData {
    const defaultData: UserPreferencesData = {
      favoriteCreatorIds: ['pbs_eons', 'david_attenborough', 'clints_reptiles', 'ologies'],
      customCreators: [],
      autoFetchMedia: true,
      highlightRecentDeltas: true,
      enableAutoDeltaSync: true,
      preferredLayout: 'radial',
      preferredTheme: 'modern-dark'
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...defaultData, ...JSON.parse(saved) };
        }
      }
    } catch {
      // Fallback
    }

    return defaultData;
  }

  private savePreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
      }
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }

  public getPreferences(): UserPreferencesData {
    return { ...this.prefs };
  }

  public getAllCreators(): ScienceCreator[] {
    return [...PRESET_CREATORS, ...this.prefs.customCreators];
  }

  public getSelectedCreators(): ScienceCreator[] {
    const all = this.getAllCreators();
    const selectedSet = new Set(this.prefs.favoriteCreatorIds);
    return all.filter(c => selectedSet.has(c.id));
  }

  public isCreatorSelected(id: string): boolean {
    return this.prefs.favoriteCreatorIds.includes(id);
  }

  public toggleCreator(id: string): void {
    if (this.prefs.favoriteCreatorIds.includes(id)) {
      this.prefs.favoriteCreatorIds = this.prefs.favoriteCreatorIds.filter(i => i !== id);
    } else {
      this.prefs.favoriteCreatorIds.push(id);
    }
    this.savePreferences();
  }

  public addCustomCreator(name: string, keywords: string[], category: ScienceCreator['category'] = 'General Biology'): ScienceCreator {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const custom: ScienceCreator = {
      id,
      name: name.trim(),
      handle: `@${name.replace(/[^a-zA-Z0-9]/g, '')}`,
      category,
      description: `User-defined favorite personality / channel: ${name}`,
      channelKeywords: keywords.length > 0 ? keywords : [name],
      isCustom: true
    };

    this.prefs.customCreators.push(custom);
    this.prefs.favoriteCreatorIds.push(id);
    this.savePreferences();
    return custom;
  }

  public removeCustomCreator(id: string): void {
    this.prefs.customCreators = this.prefs.customCreators.filter(c => c.id !== id);
    this.prefs.favoriteCreatorIds = this.prefs.favoriteCreatorIds.filter(i => i !== id);
    this.savePreferences();
  }

  public setHighlightRecentDeltas(enabled: boolean): void {
    this.prefs.highlightRecentDeltas = enabled;
    this.savePreferences();
  }

  public isHighlightRecentDeltas(): boolean {
    return this.prefs.highlightRecentDeltas;
  }

  public subscribe(fn: (prefs: UserPreferencesData) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener({ ...this.prefs });
    }
  }
}

export const userPreferences = new UserPreferencesService();
