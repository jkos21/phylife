import { graphStore } from './graph/PhyGraphStore.ts';
import { graphDataLoader } from './services/GraphDataLoader.ts';
import { kgCacheStore } from './services/KGCacheStore.ts';
import { TreeCanvasRenderer } from './renderer/TreeCanvasRenderer.ts';
import { Navbar } from './ui/Navbar.ts';
import { TimelineBar } from './ui/TimelineBar.ts';
import { TreeControls } from './ui/TreeControls.ts';
import { SearchModal } from './ui/SearchModal.ts';
import { NodeInspector } from './ui/NodeInspector.ts';
import { MRCAExplorer } from './ui/MRCAExplorer.ts';
import { PipelineModal } from './ui/PipelineModal.ts';
import { UserPreferencesModal } from './ui/UserPreferencesModal.ts';
import { RecentChangesModal } from './ui/RecentChangesModal.ts';
import { userPreferences } from './services/userPreferences.ts';
import type { MRCAResult } from './graph/types.ts';

class PhyLifeApp {
  private appElement: HTMLElement;
  private renderer!: TreeCanvasRenderer;
  private navbar!: Navbar;
  private timelineBar!: TimelineBar;
  private treeControls!: TreeControls;
  private searchModal!: SearchModal;
  private nodeInspector!: NodeInspector;
  private mrcaExplorer!: MRCAExplorer;
  private pipelineModal!: PipelineModal;
  private preferencesModal!: UserPreferencesModal;
  private recentChangesModal!: RecentChangesModal;

  constructor() {
    this.appElement = document.getElementById('app')!;
    this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    // 1. Load initial persisted knowledge graph
    await graphDataLoader.loadInitialGraph(graphStore);

    // 2. Re-hydrate dynamic KG cached taxa & divergences
    kgCacheStore.loadPersistedDeltas(graphStore);

    // 3. Build UI containers
    this.setupUI();

    // 4. Mount Canvas Engine
    this.setupRenderer();

    // 5. Listen to preference updates
    userPreferences.subscribe(prefs => {
      this.renderer.setOptions({
        highlightRecentDeltas: prefs.highlightRecentDeltas
      });
    });
  }

  private cladeFocusBar!: HTMLElement;

  private setupUI(): void {
    // 1. Modals & Drawers
    this.nodeInspector = new NodeInspector(
      graphStore,
      nodeId => {
        const node = graphStore.getNode(nodeId);
        if (node) {
          this.renderer.panToNode(nodeId);
          this.nodeInspector.inspect(node);
        }
      },
      nodeId => {
        this.nodeInspector.close();
        this.mrcaExplorer.open('tax_homo_sapiens', nodeId);
      },
      _cladeId => {
        // Clade expanded: recompute tree layout & update stats
        this.renderer.recomputeLayout();
        this.navbar.updateStats(graphStore.getAllNodes().length);
      },
      cladeId => {
        this.setCladeFocus(cladeId);
      }
    );

    this.searchModal = new SearchModal(graphStore, node => {
      this.renderer.panToNode(node.id);
      this.renderer.setOptions({ selectedNodeId: node.id });
      this.nodeInspector.inspect(node);
    });

    this.mrcaExplorer = new MRCAExplorer(graphStore, (result: MRCAResult) => {
      this.handleHighlightMRCAPath(result);
    });

    this.pipelineModal = new PipelineModal(graphStore, () => {
      this.renderer.recomputeLayout();
      this.navbar.updateStats(graphStore.getAllNodes().length);
    });

    this.preferencesModal = new UserPreferencesModal(() => {
      this.renderer.setOptions({
        highlightRecentDeltas: userPreferences.isHighlightRecentDeltas()
      });
    });

    this.recentChangesModal = new RecentChangesModal(
      graphStore,
      nodeId => {
        const node = graphStore.getNode(nodeId);
        if (node) {
          this.renderer.panToNode(nodeId);
          this.renderer.setOptions({ selectedNodeId: nodeId });
          this.nodeInspector.inspect(node);
        }
      },
      () => {
        this.renderer.recomputeLayout();
        this.navbar.updateStats(graphStore.getAllNodes().length);
      }
    );

    // 2. Navigation Bar
    this.navbar = new Navbar({
      onSearchClick: () => this.searchModal.open(),
      onMRCAClick: () => this.mrcaExplorer.open(),
      onPipelineClick: () => this.pipelineModal.open(),
      onPreferencesClick: () => this.preferencesModal.open(),
      onRecentChangesClick: () => this.recentChangesModal.open(),
      onLayoutChange: mode => this.renderer.setLayoutMode(mode),
      onResetView: () => {
        this.setCladeFocus(null);
        this.renderer.resetCamera();
      }
    });

    this.navbar.updateStats(graphStore.getAllNodes().length);
    this.appElement.appendChild(this.navbar.getElement());

    // 3. Viewport Container & Canvas
    const viewportContainer = document.createElement('main');
    viewportContainer.className = 'viewport-container';

    // 3a. Clade Focus Breadcrumb Bar
    this.cladeFocusBar = document.createElement('div');
    this.cladeFocusBar.className = 'clade-focus-bar';
    this.cladeFocusBar.style.display = 'none';
    viewportContainer.appendChild(this.cladeFocusBar);

    const canvas = document.createElement('canvas');
    canvas.id = 'tree-canvas';
    viewportContainer.appendChild(canvas);


    // 4. Domain Legend
    const legend = document.createElement('div');
    legend.className = 'domain-legend';
    legend.innerHTML = `
      <div class="legend-item" data-domain="Metazoa">
        <div class="legend-dot" style="background-color: var(--domain-metazoa);"></div>
        <span>Animals</span>
      </div>
      <div class="legend-item" data-domain="Viridiplantae">
        <div class="legend-dot" style="background-color: var(--domain-plantae);"></div>
        <span>Plants</span>
      </div>
      <div class="legend-item" data-domain="Fungi">
        <div class="legend-dot" style="background-color: var(--domain-fungi);"></div>
        <span>Fungi</span>
      </div>
      <div class="legend-item" data-domain="Protista">
        <div class="legend-dot" style="background-color: var(--domain-protista);"></div>
        <span>Protists</span>
      </div>
      <div class="legend-item" data-domain="Bacteria">
        <div class="legend-dot" style="background-color: var(--domain-bacteria);"></div>
        <span>Bacteria</span>
      </div>
      <div class="legend-item" data-domain="Archaea">
        <div class="legend-dot" style="background-color: var(--domain-archaea);"></div>
        <span>Archaea</span>
      </div>
    `;

    legend.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const domain = item.getAttribute('data-domain');
        const taxaInDomain = graphStore.search({ kingdoms: [domain as any] });
        if (taxaInDomain.length > 0) {
          this.renderer.panToNode(taxaInDomain[0].id);
          this.renderer.setOptions({ selectedNodeId: taxaInDomain[0].id });
          this.nodeInspector.inspect(taxaInDomain[0]);
        }
      });
    });

    viewportContainer.appendChild(legend);

    // 5. Timeline Bar
    this.timelineBar = new TimelineBar((mya: number) => {
      if (this.renderer) {
        this.renderer.setOptions({ timeCutoffMya: mya });
        const activeLineages = this.renderer.getActiveLineagesAtTime(mya);
        this.timelineBar.updateActiveLineages(activeLineages);
      }
    });
    viewportContainer.appendChild(this.timelineBar.getElement());

    // 6. Tree Floating Controls Dock
    this.treeControls = new TreeControls({
      onZoomIn: () => this.renderer.zoomIn(),
      onZoomOut: () => this.renderer.zoomOut(),
      onReset: () => this.renderer.resetCamera(),
      onToggleRings: show => this.renderer.setOptions({ showGeologicalRings: show }),
      onToggleLabels: show => this.renderer.setOptions({ showLabels: show }),
      onToggleDeltas: show => {
        userPreferences.setHighlightRecentDeltas(show);
        this.renderer.setOptions({ highlightRecentDeltas: show });
      }
    });
    viewportContainer.appendChild(this.treeControls.getElement());

    this.appElement.appendChild(viewportContainer);

    // Mount Drawers & Modals to document body
    document.body.appendChild(this.nodeInspector.getBackdrop());
    document.body.appendChild(this.nodeInspector.getElement());
    document.body.appendChild(this.searchModal.getElement());
    document.body.appendChild(this.mrcaExplorer.getElement());
    document.body.appendChild(this.pipelineModal.getElement());
    document.body.appendChild(this.preferencesModal.getElement());
    document.body.appendChild(this.recentChangesModal.getElement());
  }

  private setupRenderer(): void {
    const canvas = document.getElementById('tree-canvas') as HTMLCanvasElement;
    this.renderer = new TreeCanvasRenderer(canvas, graphStore);
    this.renderer.setOptions({
      highlightRecentDeltas: userPreferences.isHighlightRecentDeltas(),
      timeCutoffMya: this.timelineBar.getMya()
    });

    const initialLineages = this.renderer.getActiveLineagesAtTime(this.timelineBar.getMya());
    this.timelineBar.updateActiveLineages(initialLineages);

    this.renderer.setCallbacks(
      node => {
        this.nodeInspector.inspect(node.rawNode);
      },
      _hoveredNode => {
        // Optional status bar tooltip updates
      }
    );
  }

  private handleHighlightMRCAPath(result: MRCAResult): void {
    const nodeIds = new Set(result.full_path);
    this.renderer.setOptions({
      activeMRCAIds: nodeIds,
      selectedNodeId: result.mrca_node.id
    });
    this.renderer.focusMRCAPath(result.full_path);
    this.nodeInspector.inspect(result.mrca_node);
  }

  public setCladeFocus(cladeId: string | null): void {
    this.renderer.focusClade(cladeId);

    if (!cladeId) {
      this.cladeFocusBar.style.display = 'none';
      this.cladeFocusBar.innerHTML = '';
      return;
    }

    const node = graphStore.getNode(cladeId);
    if (!node) {
      this.cladeFocusBar.style.display = 'none';
      return;
    }

    const lineage = graphStore.getLineage(cladeId);
    const cladeSpecies = graphStore.getCladeSpecies(cladeId);

    this.cladeFocusBar.style.display = 'flex';
    this.cladeFocusBar.innerHTML = `
      <div class="clade-focus-crumbs" role="navigation" aria-label="Clade focus breadcrumbs">
        <button class="clade-crumb-btn" data-id="" title="Exit Clade Focus (Show Complete Tree)">🌍 Full Tree</button>
        ${lineage.map((anc, idx) => {
          const isLast = idx === lineage.length - 1;
          const name = 'scientific_name' in anc ? (anc.common_name ? `${anc.scientific_name} (${anc.common_name})` : anc.scientific_name) : (anc.common_name || anc.name);
          return `
            <span class="clade-crumb-sep">›</span>
            <button class="clade-crumb-btn ${isLast ? 'active' : ''}" data-id="${anc.id}" ${isLast ? 'aria-current="page"' : ''}>
              ${name}
            </button>
          `;
        }).join('')}
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-primary); border-color: rgba(56, 189, 248, 0.3); font-size: 11px;">
          ${cladeSpecies.length} Species in Subtree
        </span>
        <button class="clade-crumb-close" id="btn-exit-clade-focus" title="Exit Clade Focus" aria-label="Exit Clade Focus">
          ✕ Exit Focus
        </button>
      </div>
    `;

    // Attach breadcrumb click events
    this.cladeFocusBar.querySelectorAll('.clade-crumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.setCladeFocus(id ? id : null);
      });
    });

    this.cladeFocusBar.querySelector('#btn-exit-clade-focus')?.addEventListener('click', () => {
      this.setCladeFocus(null);
    });
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new PhyLifeApp();
  (window as any).__phylife = {
    app,
    graphStore,
    kgCacheStore,
    getGraphAuditLog: () => graphStore.getAuditLog(),
    getKGAuditLog: () => kgCacheStore.getAuditLogs(),
    getAllNodes: () => graphStore.getAllNodes()
  };
});

