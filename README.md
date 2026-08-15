# 🧬 PhyLife — Global Phylogenetic Tree of Life Engine

**PhyLife** is an interactive, high-performance web visualization engine and embedded graph database for exploring the global phylogenetic Tree of Life across all domains: **Metazoa**, **Viridiplantae**, **Fungi**, **Protista**, **Bacteria**, and **Archaea**.

Built on a local in-memory property graph with $O(\text{depth})$ pathfinding, dynamic Level of Detail (LoD) Canvas rendering, and an automated ingestion pipeline reconciling Open Tree of Life (OToL), TimeTree chronograms, World Flora Online (WFO), MycoBank, GBIF Backbone, and Wikimedia Commons.

---

## 📸 Key Features

- **🌐 Deep-Zoom Canvas Visualizer**:
  - **Radial Geological Phylogram**: Concentric geological timescale rings (Hadean, Archean, Proterozoic, Paleozoic, Mesozoic, Cenozoic) with domain-coded bezier branches.
  - **Hierarchical Dendrogram**: Rectangular phylogram with time-calibrated linear bands.
  - **Dynamic Level of Detail (LoD)**: Automatic level filtering from domain crowns down to terminal species.
- **⚡ Local Property Graph Database (`PhyGraphStore`)**:
  - Embedded local property graph with indexed adjacency maps and full-text inverted search.
  - $O(\text{depth})$ Lowest Common Ancestor (**MRCA**) calculation.
  - Export to **JSON**, **GraphML**, and standard **Newick (`.nwk`)** format.
- **✨ Animated MRCA Explorer**:
  - Compare any two species across all 6 kingdoms (e.g. *Homo sapiens* vs *Panthera leo*, *Canis lupus* vs *Amanita muscaria*, or *Arabidopsis thaliana* vs *Escherichia coli*).
  - Traces bioluminescent glowing divergence paths on the tree with evolutionary milestones and divergence ages (Ma).
- **🔬 Rich Node Inspector Drawer**:
  - High-resolution Wikimedia photo galleries, common names, IUCN extinction status, temporal ranges, diagnostic evolutionary traits, interactive lineage breadcrumb trails, and source studies.
- **⏳ Geological Chronogram Bar**:
  - Interactive timescale scrubber spanning 4,200 Ma (Hadean LUCA) to 0 Ma (Present Day Cenozoic).
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

## 🛠️ Pipeline CLI Commands

PhyLife provides built-in CLI commands to seed, validate, and synchronize the phylogenetic property graph:

```bash
# Seed the local graph database with the bundled 6-domain dataset
npm run pipeline:seed

# Inspect graph connectivity metrics and benchmark MRCA queries
npm run pipeline:stats

# Run the full 6-step atomic ETL ingestion & reconciliation pipeline
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
