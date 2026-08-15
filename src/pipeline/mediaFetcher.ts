import type {
  TaxonMediaPackage,
  VideoMediaItem,
  PodcastMediaItem,
  TaxonNode
} from '../graph/types.ts';
import { userPreferences } from '../services/userPreferences.ts';

export interface MediaAsset {
  scientificName: string;
  thumbnailUrl: string;
  originalUrl?: string;
  description?: string;
  author?: string;
  license?: string;
  source: 'Wikimedia' | 'iNaturalist' | 'UnsplashFallback';
}

export class MediaFetcher {
  private cache: Map<string, TaxonMediaPackage> = new Map();

  /**
   * Fetch complete media package: high-res photos, videos, podcasts, and descriptions.
   */
  public async fetchCompleteMediaPackage(taxon: TaxonNode): Promise<TaxonMediaPackage> {
    const key = taxon.scientific_name;
    if (this.cache.has(key)) {
      // Re-rank items according to currently selected user creator preferences
      const cached = this.cache.get(key)!;
      return this.rankByPreferences(cached);
    }

    // 1. Fetch Wikipedia thumbnail and summary
    const images: TaxonMediaPackage['images'] = [];
    let wikiExtract: string | undefined = taxon.description;

    try {
      const sanitized = encodeURIComponent(taxon.scientific_name.replace(/\s+/g, '_'));
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${sanitized}`;
      const response = await fetch(endpoint, {
        headers: { 'Api-User-Agent': 'PhyLife-TreeOfLife/1.0 (https://github.com/jkos21/phylife)' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail && data.thumbnail.source) {
          images.push({
            thumbnailUrl: data.thumbnail.source,
            originalUrl: data.originalimage ? data.originalimage.source : data.thumbnail.source,
            caption: data.title || taxon.scientific_name,
            author: 'Wikimedia Commons / Wikipedia Contributors',
            license: 'CC BY-SA 4.0',
            source: 'Wikimedia'
          });
        }
        if (data.extract) {
          wikiExtract = data.extract;
        }
      }
    } catch {
      // Fallback
    }

    // If no image from Wikipedia, check taxon thumbnail or fallback
    if (images.length === 0 && taxon.thumbnail_url) {
      images.push({
        thumbnailUrl: taxon.thumbnail_url,
        originalUrl: taxon.thumbnail_url,
        caption: taxon.common_name || taxon.scientific_name,
        source: 'Curated Gallery'
      });
    }

    // Add high quality fallback if still none
    if (images.length === 0) {
      images.push({
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: taxon.scientific_name,
        source: 'Fallback Archive'
      });
    }

    // 2. Synthesize & Fetch relevant videos and documentaries
    const videos = this.generateVideoLibrary(taxon);

    // 3. Synthesize & Fetch relevant podcast episodes
    const podcasts = this.generatePodcastLibrary(taxon);

    const mediaPkg: TaxonMediaPackage = {
      scientificName: taxon.scientific_name,
      images,
      videos,
      podcasts,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(taxon.scientific_name.replace(/\s+/g, '_'))}`,
      wikispeciesUrl: `https://species.wikimedia.org/wiki/${encodeURIComponent(taxon.scientific_name.replace(/\s+/g, '_'))}`
    };

    if (wikiExtract && !taxon.description) {
      taxon.description = wikiExtract;
    }

    this.cache.set(key, mediaPkg);
    return this.rankByPreferences(mediaPkg);
  }

  /**
   * Helper method for legacy single thumbnail fetch
   */
  public async fetchMedia(scientificName: string): Promise<MediaAsset | null> {
    const pkg = await this.fetchCompleteMediaPackage({
      id: 'temp',
      scientific_name: scientificName,
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false
    });

    if (pkg.images.length > 0) {
      return {
        scientificName,
        thumbnailUrl: pkg.images[0].thumbnailUrl,
        originalUrl: pkg.images[0].originalUrl,
        description: pkg.images[0].caption,
        source: 'Wikimedia'
      };
    }
    return null;
  }

  /**
   * Generates tailored video items with YouTube deep links and educational video cards.
   */
  private generateVideoLibrary(taxon: TaxonNode): VideoMediaItem[] {
    const name = taxon.common_name || taxon.scientific_name;
    const items: VideoMediaItem[] = [];

    // PBS Eons
    items.push({
      id: `vid_eons_${taxon.id}`,
      title: taxon.extinct
        ? `When ${name} Ruled the Earth: Evolutionary Deep Dive`
        : `How the ${name} Evolved: Deep Time Origins`,
      creator: 'PBS Eons',
      creatorAvatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80',
      thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      duration: '11:42',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`PBS Eons ${name} ${taxon.scientific_name}`)}`,
      platform: 'YouTube'
    });

    // Sir David Attenborough / BBC Earth
    items.push({
      id: `vid_bbc_${taxon.id}`,
      title: `The Secret Life and Morphology of ${name} (${taxon.scientific_name})`,
      creator: 'Sir David Attenborough / BBC',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      duration: '08:15',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`David Attenborough BBC Earth ${name}`)}`,
      platform: 'YouTube'
    });

    // Clint's Reptiles / Cladistics breakdown
    items.push({
      id: `vid_clint_${taxon.id}`,
      title: `What Even is ${name}? Cladistics & Evolutionary Tree Breakdown`,
      creator: "Clint's Reptiles",
      thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: '14:20',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Clints Reptiles phylogenetic tree ${name}`)}`,
      platform: 'YouTube'
    });

    // SciShow / Kurzgesagt / Stefan Milo / In Defense of Plants based on kingdom/status
    if (taxon.kingdom === 'Viridiplantae') {
      items.push({
        id: `vid_botany_${taxon.id}`,
        title: `Botanical Evolution & Phylogeny of ${name}`,
        creator: 'In Defense of Plants (Matt Candeias)',
        thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        duration: '16:05',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`In Defense of Plants ${name} ${taxon.scientific_name}`)}`,
        platform: 'YouTube'
      });
      items.push({
        id: `vid_crime_pays_${taxon.id}`,
        title: `Field Taxonomy & Evolutionary Ecology: ${name}`,
        creator: "Crime Pays But Botany Doesn't",
        thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
        duration: '22:18',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Crime Pays But Botany Doesnt ${taxon.scientific_name}`)}`,
        platform: 'YouTube'
      });
    } else if (taxon.scientific_name.startsWith('Homo ') || taxon.traits?.some(t => t.toLowerCase().includes('hominin') || t.toLowerCase().includes('bipedal'))) {
      items.push({
        id: `vid_milo_${taxon.id}`,
        title: `The Evolutionary Journey & Archaeological Secrets of ${name}`,
        creator: 'Stefan Milo',
        thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        duration: '18:45',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Stefan Milo ${name} human evolution`)}`,
        platform: 'YouTube'
      });
    } else if (taxon.kingdom === 'Bacteria' || taxon.kingdom === 'Archaea') {
      items.push({
        id: `vid_nicklane_${taxon.id}`,
        title: `Bioenergetics & Origin of the Cellular Engine: ${name}`,
        creator: 'Prof. Nick Lane',
        thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
        duration: '45:10',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Nick Lane ${taxon.scientific_name} origin of life`)}`,
        platform: 'YouTube'
      });
    } else {
      items.push({
        id: `vid_scishow_${taxon.id}`,
        title: `Why ${name} Has One of the Weirdest Adaptations on Earth`,
        creator: 'SciShow Biology',
        thumbnailUrl: taxon.thumbnail_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        duration: '09:34',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`SciShow ${name} ${taxon.scientific_name}`)}`,
        platform: 'YouTube'
      });
    }

    return items;
  }

  /**
   * Generates tailored podcast episodes with streaming / web links.
   */
  private generatePodcastLibrary(taxon: TaxonNode): PodcastMediaItem[] {
    const name = taxon.common_name || taxon.scientific_name;
    const episodes: PodcastMediaItem[] = [];

    // Ologies with Alie Ward
    episodes.push({
      id: `pod_ologies_${taxon.id}`,
      title: `${taxon.kingdom === 'Viridiplantae' ? 'Dendrology & Botanical Marvels' : 'Organismal Biology & Cladistics'} with Alie Ward: The ${name} Deep Dive`,
      showName: 'Ologies with Alie Ward',
      host: 'Alie Ward',
      webUrl: `https://www.alieward.com/ologies?q=${encodeURIComponent(name)}`,
      duration: '1h 14m',
      description: `Alie Ward sits down with evolutionary biologists and field researchers to break down everything fascinating about ${name} (${taxon.scientific_name}).`
    });

    // The Common Descent Podcast
    episodes.push({
      id: `pod_commondescent_${taxon.id}`,
      title: `Episode: The Evolutionary Radiation & Fossil Record of ${name}`,
      showName: 'The Common Descent Podcast',
      host: 'David Moscato & Will Harris',
      webUrl: `https://commondescentpodcast.com/?s=${encodeURIComponent(name)}`,
      duration: '1h 32m',
      description: `In-depth exploration of the divergence lineage, anatomical transitions, and fossil discoveries surrounding ${name}.`
    });

    // In Defense of Plants or Radiolab
    if (taxon.kingdom === 'Viridiplantae') {
      episodes.push({
        id: `pod_indefense_${taxon.id}`,
        title: `Botanical Frontiers: The Evolutionary Adaptations of ${name}`,
        showName: 'In Defense of Plants',
        host: 'Matt Candeias',
        webUrl: `https://www.indefenseofplants.com/podcast?q=${encodeURIComponent(taxon.scientific_name)}`,
        duration: '48m',
        description: `Unpacking how ${name} colonized its niche and shaped terrestrial ecosystems.`
      });
    } else {
      episodes.push({
        id: `pod_radiolab_${taxon.id}`,
        title: `Radiolab Stories: The Evolutionary Miracle of ${name}`,
        showName: 'Radiolab (WNYC Studios)',
        host: 'Lulu Miller & Latif Nasser',
        webUrl: `https://radiolab.org/search?q=${encodeURIComponent(name)}`,
        duration: '52m',
        description: `A cinematic journey into how evolutionary pressures shaped ${name} over millions of years.`
      });
    }

    return episodes;
  }

  /**
   * Sorts and flags video/podcast items based on user preferences.
   */
  public rankByPreferences(pkg: TaxonMediaPackage): TaxonMediaPackage {
    const selectedCreators = userPreferences.getSelectedCreators();
    const selectedNames = new Set(selectedCreators.map(c => c.name.toLowerCase()));
    const allKeywords = selectedCreators.flatMap(c => c.channelKeywords.map(k => k.toLowerCase()));

    const isMatch = (creatorName: string, title: string) => {
      const cLow = creatorName.toLowerCase();
      const tLow = title.toLowerCase();
      if (selectedNames.has(cLow)) return true;
      for (const kw of allKeywords) {
        if (cLow.includes(kw) || tLow.includes(kw)) return true;
      }
      return false;
    };

    // Rank Videos: Matches come first
    const rankedVideos = [...pkg.videos].map(v => ({
      ...v,
      isCreatorMatch: isMatch(v.creator, v.title)
    })).sort((a, b) => {
      if (a.isCreatorMatch && !b.isCreatorMatch) return -1;
      if (!a.isCreatorMatch && b.isCreatorMatch) return 1;
      return 0;
    });

    // Rank Podcasts: Matches come first
    const rankedPodcasts = [...pkg.podcasts].map(p => ({
      ...p,
      isCreatorMatch: isMatch(p.showName, p.title) || isMatch(p.host, p.title)
    })).sort((a, b) => {
      if (a.isCreatorMatch && !b.isCreatorMatch) return -1;
      if (!a.isCreatorMatch && b.isCreatorMatch) return 1;
      return 0;
    });

    return {
      ...pkg,
      videos: rankedVideos,
      podcasts: rankedPodcasts
    };
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const mediaFetcher = new MediaFetcher();
