# 🧬 PhyLife — Global Phylogenetic Tree of Life Engine

**PhyLife** is an interactive, high-performance web visualization engine and embedded graph database for exploring the global phylogenetic Tree of Life across all domains: **Metazoa**, **Viridiplantae**, **Fungi**, **Protista**, **Bacteria**, and **Archaea**.

Built on a local in-memory property graph with $O(\text{depth})$ pathfinding, dynamic Level of Detail (LoD) Canvas rendering, and an automated ingestion pipeline reconciling Open Tree of Life (OToL), TimeTree chronograms, World Flora Online (WFO), MycoBank, GBIF Backbone, and Wikimedia Commons.

---

## 📸 Key Features

- **🌐 Deep-Zoom Canvas Visualizer**:
  - **Radial Geological Phylogram**: Concentric geological timescale rings (Hadean, Archean, Proterozoic, Paleozoic, Mesozoic, Cenozoic) with domain-coded bezier branches.
  - **Hierarchical Dendrogram**: Rectangular phylogram with time-calibrated linear bands and clean branch slicing.
  - **Dynamic Level of Detail (LoD)**: Automatic Level of Detail filtering from domain crowns down to terminal species.
- **⏳ Interactive Geological Chronogram & Divergence Timeline**:
  - **Real-Time Isochrone Horizons**: Renders a glowing isochrone ring (Radial) or vertical line (Dendrogram) slicing branches at epoch $T$.
  - **Extant Horizon Nodes**: Renders glowing intersection dots showing lineages alive on Earth at any scrubbed timestamp.
  - **Evolution Time-Travel Playback**: Play/Pause/Speed (1x, 2x, 4x) automated playback watching the Tree of Life radiate across 4.2 billion years.
  - **Clickable Era Presets**: One-click jump to major planetary milestones (4.2 Ga LUCA, 2.5 Ga Great Oxidation, 541 Ma Cambrian, 252 Ma Great Dying, 66 Ma K-Pg Extinction, 0 Ma Present).
  - **Nonlinear Sqrt Scaling**: Calibrated slider mapping providing high-resolution control for Phanerozoic and Cenozoic eras.
- **⚡ Persisted Property Graph Engine (`PhyGraphStore` & `GraphDataLoader`)**:
  - Embedded local property graph with indexed adjacency maps and full-text inverted search.
  - Asynchronous loading from persisted snapshot (`public/data/phylogeny_graph.json`) with automatic bundled fallback.
  - $O(\text{depth})$ Lowest Common Ancestor (**MRCA**) calculation.
  - Export to **JSON**, **GraphML**, and standard **Newick (`.nwk`)** format.
- **✨ Animated MRCA Explorer**:
  - Compare any two species across all 6 kingdoms (e.g. *Homo sapiens* vs *Panthera leo*, *Canis lupus* vs *Amanita muscaria*, or *Arabidopsis thaliana* vs *Escherichia coli*).
  - Traces bioluminescent glowing divergence paths on the tree with evolutionary milestones and divergence ages (Ma).
- **🔬 Rich Node Inspector Drawer & Creator Media Packages**:
  - High-resolution Wikimedia photo galleries, IUCN extinction status, temporal ranges, diagnostic traits, and interactive lineage breadcrumbs.
  - Personalized video and podcast recommendations prioritized by your favorite science communicators (Sir David Attenborough, PBS Eons, Radiolab, etc.).
- **🌱 On-Demand Clade Expansion & 2026 Phylogenomic Delta Sync**:
  - Dynamically grafts expanded subtrees into the live graph (e.g., Feliformia sister taxa, Dinosauria).
  - Reconciles 2026 phylogenomic discoveries (Asgardarchaeota / Lokiarchaeum, Denisovan hominins).
- **🔄 Ingestion & Reconciliation Pipeline**:
  - 6-step atomic ETL pipeline reconciling Open Tree of Life (OToL API v3), TimeTree chronograms, WFO, MycoBank, GBIF, and Wikimedia Commons.
  - Accessible via CLI (`npm run pipeline:sync`) and the in-app Admin Console.
- **🎨 Theme Engine**:
  - **Modern Dark (Default)**: Sleek, clean, functional presentation in dark slate.
  - **Bioluminescent Deep Sea**: Obsidian black background with cybernetic glowing neon branches.
  - **Academic Slate Light**: Clean high-contrast theme for academic and scientific review.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### Installation & Local Development

```bash
# Clone repository
git clone https://github.com/jkos21/phylife.git
cd phylife

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Validation

PhyLife includes a comprehensive automated test suite spanning backend graph integrity, external API fallbacks, and UI workflows:

```bash
# Run all test suites (150+ assertions across backend, graph integrity, and UI)
npm test

# Run individual test suites
npm run test:persisted-kg     # Validate schema and topological integrity of persisted JSON
npm run test:backend          # Test OToL, TimeTree, WFO, GBIF, and media fetcher
npm run test:walkthrough      # Full automated UI & interaction walkthrough test
```

---

## 🛠️ Pipeline & Knowledge Graph CLI Commands

PhyLife provides built-in CLI commands to seed, validate, refresh, and synchronize the phylogenetic property graph:

```bash
# Persist the canonical knowledge graph snapshot to public/data/phylogeny_graph.json
npm run graph:seed

# Reconcile external sources and refresh the persisted knowledge graph snapshot
npm run graph:refresh

# Inspect graph connectivity metrics and benchmark MRCA queries
npm run pipeline:stats

# Run the 6-step atomic ETL ingestion & reconciliation pipeline
npm run pipeline:sync
```

---

## 🏗️ Architecture Overview

```
  [ External Data Sources ]
  • Open Tree of Life (OToL v3) ─┐
  • TimeTree (Chronograms)      ─┼──► [ 6-Step ETL Pipeline Engine ]
  • World Flora / MycoBank      ─┤      (CLI: npm run pipeline:sync / In-App Console)
  • GBIF / Wikimedia Commons    ─┘                   │
                                                     ▼
                                         [ Local Graph Database ]
                                              (PhyGraphStore)
                                                     │
                                                     ▼
                                         [ High-Performance Canvas ]
                                        (Radial & Dendrogram Phylograms)
```

---

## 📊 Property Graph Schema

### Node: `TaxonNode`
```json
{
  "id": "tax_panthera_leo",
  "scientific_name": "Panthera leo",
  "common_name": "African Lion",
  "rank": "species",
  "kingdom": "Metazoa",
  "extinct": false,
  "thumbnail_url": "https://upload.wikimedia.org/.../Panthera_leo.jpg",
  "description": "Large apex felid of the genus Panthera...",
  "temporal_range": "Late Pleistocene - Present",
  "ott_id": "ott_93302",
  "gbif_key": "5219404",
  "source_study_ids": ["ot_1234", "treebase_987"]
}
```

### Node: `DivergenceNode`
```json
{
  "id": "div_carnivora_feliformia_caniformia",
  "name": "Carnivora Split (Feliformia vs Caniformia)",
  "divergence_mya": 55.0,
  "confidence_interval": [51.2, 58.6],
  "geological_era": "Cenozoic",
  "evolutionary_milestone": "Specialized carnassial shear teeth for hyper-carnivorous diet."
}
```

### Relationships
- `(:TaxonNode | :DivergenceNode)-[:BRANCHES_TO { branch_length_mya, confidence_score }]->(:TaxonNode | :DivergenceNode)`
- `(:TaxonNode)-[:SYNONYM_OF { source }]->(:TaxonNode)`

---

## 📦 Production Build

```bash
# Typecheck & build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License & Attribution

- **Open Tree of Life (OToL)**: Synthetic tree topology and OTT identifiers.
- **TimeTree**: Geological chronogram divergence times and confidence intervals.
- **World Flora Online (WFO)**: Plant taxonomy and synonymy.
- **MycoBank / Index Fungorum**: Mycological nomenclature.
- **GBIF Backbone Taxonomy**: Taxonomic hierarchy and vernacular names.
- **Wikimedia Commons & iNaturalist**: Creative Commons licensed photography and morphological descriptions.

MIT License © 2026 [James Kosterman](https://github.com/jkos21)
