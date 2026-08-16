# 🧬 PhyLife Project Roadmap & Implementation Plan

> **Status**: Core phylogenetic engine, high-resolution species drill-down, embedded SQLite Knowledge Graph, clean-start seeding, and single canonical W3C JSON-LD format are **100% Complete & Verified**.

---

## 🎯 Active & Upcoming Roadmap Items

### 1. 🌐 Live External API Dynamic Enrichment & SQLite KG Caching
- **Goal**: Allow users to query and discover unlisted species and clades in real-time.
- **Components**:
  - Live fetcher services connecting to **GBIF Backbone Taxonomy**, **Open Tree of Life API v3**, **TimeTree 5**, and **Wikimedia/Wikispecies API**.
  - Dynamic graph grafting: automatically attaches new taxa to their respective family/genus divergence node in `PhyGraphStore`.
  - Persistence caching: writes newly discovered taxa and provenance directly to SQLite `kg_cache` and `kg_audit_log` tables.

---

### 2. 🔍 In-App SQL / SPARQL Knowledge Graph Query Explorer
- **Goal**: Provide an interactive in-browser query console to explore the Knowledge Graph directly.
- **Components**:
  - Interactive query terminal modal (`#btn-kg-query`) with pre-built SQL and SPARQL query templates:
    - *Filter by extinction / geological era*: `SELECT * FROM kg_nodes WHERE extinct = 1 AND divergence_mya > 65;`
    - *Query Darwin Core RDF triples*: `SELECT subject_id, predicate, object_value FROM kg_triples WHERE predicate = 'phylife:hasTrait';`
    - *Lineage inspection*: Recursive parent-child traversal queries.
  - Formatted tabular result viewer with instant export (CSV, JSON, Turtle).

---

### 3. ⚖️ Clade Comparison & Evolutionary Trait Matrix
- **Goal**: Side-by-side comparative cladistics between any two clades (e.g. *Theropoda* vs *Sauropodomorpha*, or *Cetacea* vs *Artiodactyla*).
- **Components**:
  - Comparative Clade Inspector modal.
  - Evolutionary Trait Heatmap: highlights shared synapomorphies vs divergent derived traits.
  - Chronogram comparison: divergence age comparison, species richness metrics, and mass extinction survival rates.

---

### 4. 🧬 Synapomorphy & Evolutionary Innovation Canvas Overlay
- **Goal**: Visually render major evolutionary innovations directly along tree branches.
- **Components**:
  - Innovation badges placed along branches (e.g., *Amniotic egg*, *Endosymbiosis*, *Chloroplast capture*, *Myelin sheath*, *Bipedalism*, *Powered flight*, *Echolocation*).
  - Hover tooltips detailing anatomical and genomic milestones.

---

### 5. 🗺️ Paleogeographic Continental Drift Map Sync
- **Goal**: Synchronize an interactive paleogeographic map/globe with the timeline scrubber.
- **Components**:
  - Mini paleogeographic map widget synchronized with the chronogram slider.
  - Scrubbing to 250 Ma (Permian) or 66 Ma (Cretaceous) renders continental configurations (*Pangaea*, *Gondwana*, *Laurasia*) alongside fossil locality markers.

---

### 6. 🚀 GitHub Actions CI & Remote Push
- **Goal**: Automate continuous integration for backend tests, graph integrity checks, and production builds.
- **Components**:
  - GitHub Actions workflow (`.github/workflows/ci.yml`) running `npm test` and `npm run build` on push and PR.
  - Push current 9 local commits to `origin/main`.