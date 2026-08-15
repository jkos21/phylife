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
  private cache: Map<string, MediaAsset> = new Map();

  /**
   * Fetch image thumbnail and description from Wikimedia Commons API or Wikipedia summary.
   */
  public async fetchMedia(scientificName: string): Promise<MediaAsset | null> {
    if (this.cache.has(scientificName)) {
      return this.cache.get(scientificName)!;
    }

    try {
      const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName.replace(/\s+/g, '_'))}`;
      const response = await fetch(endpoint, {
        headers: { 'Api-User-Agent': 'PhyLife-TreeOfLife/1.0' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail && data.thumbnail.source) {
          const asset: MediaAsset = {
            scientificName,
            thumbnailUrl: data.thumbnail.source,
            originalUrl: data.originalimage ? data.originalimage.source : data.thumbnail.source,
            description: data.extract || undefined,
            source: 'Wikimedia'
          };
          this.cache.set(scientificName, asset);
          return asset;
        }
      }
    } catch {
      // Ignore network errors and fallback
    }

    return null;
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const mediaFetcher = new MediaFetcher();
