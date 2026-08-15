# 🧬 PhyLife Project Roadmap & Architecture Plan

## ✅ Completed Milestones

1. **🌳 Dual Canvas Phylogenetic Engine (Radial & Dendrogram)**:
   - Deep-zoom interactive canvas with dynamic Level of Detail (LoD) thresholding.
   - Smooth pan, zoom, fit-to-bounds, and MRCA path glowing camera navigation.

2. **⏳ Geological Chronogram & Divergence Timeline**:
   - Time-calibrated isochrone horizons (concentric circular rings in Radial, vertical line in Dendrogram).
   - Extant Horizon Nodes representing lineages alive at any epoch $T$.
   - Automated evolution time-travel playback engine (Play/Pause/Speed 1x-2x-4x) spanning 4.2 Ga to Present Day.
   - Clickable era preset chips and quadratic slider scale matching geological time bands.

3. **💾 Persisted Backend Knowledge Graph**:
   - Single consolidated knowledge graph snapshot at `public/data/phylogeny_graph.json`.
   - `GraphDataLoader` asynchronous loading with bundled fallback.
   - Deterministic build artifact generation (`npm run graph:seed`) and automated reconciliation (`npm run graph:refresh`).

4. **🔬 Creator Personalization & Educational Media Packages**:
   - Dynamic video and podcast prioritization based on user favorite science communicators (Sir David Attenborough, PBS Eons, Radiolab, etc.).
   - Deep search query generator for Wikipedia, YouTube, and Spotify podcasts.

5. **🌱 2026 Phylogenomic Delta Sync & On-Demand Clade Expansion**:
   - Subtree grafting engine for on-demand expansion (Feliformia, Dinosauria).
   - Automated reconciliation of 2026 Asgardarchaeota / Lokiarchaeum and Denisovan genomic studies.

6. **🧪 End-to-End Test Suite**:
   - 154 automated test assertions covering backend API resilience, graph topological integrity, and full UI interaction walkthroughs.

---

## 🚀 Next Roadmap Horizons

1. **🧬 Interactive Trait Evolution & Synapomorphy Layer**:
   - Add a visual synapomorphy overlay showing where major evolutionary innovations appeared along branches (e.g., Amniotic egg, Endosymbiosis, Chloroplast capture, Myelin sheath, Bipedalism, Flight).
2. **🗺️ Paleogeographic Continental Drift Map Sync**:
   - Synchronize an interactive mini paleogeographic globe/map with the timeline scrubber so selecting 250 Ma (Permian) or 66 Ma (Cretaceous) shows Earth's tectonic plate positions (Pangaea, Gondwana, Laurasia) and fossil discovery localities.
3. **🌳 WebGL / Multi-Resolution Clade Aggregation**:
   - Dynamic Level-of-Detail (LOD) aggregation so when zooming out to billions of years, dense clades automatically collapse into labeled superfamily "bubbles", expanding fluidly on camera zoom.
4. **🌐 Live Cloud Delta Sync Worker / Edge Caching**:
   - Lightweight GitHub Actions / Cloudflare Worker cron job that watches Open Tree of Life and TimeTree releases, publishing automated monthly delta JSON patches.
5. **📱 PWA & Offline Service Worker**:
   - Add Service Worker caching and Web App Manifest for complete offline PWA capability in field biology and academic settings.