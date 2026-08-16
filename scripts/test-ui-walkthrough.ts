/**
 * PhyLife Comprehensive End-to-End UI & Feature Walkthrough Test Suite
 * 
 * Tests and verifies:
 * 1. App Bootstrap (GraphStore seeding, 69 nodes / 68 edges, Canvas initialization)
 * 2. Search & Taxon Inspection (SearchModal, query typing, selection, camera pan)
 * 3. MRCA Explorer (pairwise computation, 95 Ma Human/Lion, path highlighting)
 * 4. NodeInspector Tabs & Media (Overview, Videos, Podcasts, Photos, Lineage)
 * 5. On-Demand Clade Expansion (Feliformia/Dinosauria sister grafting)
 * 6. Creator Preferences (toggling, custom creator addition, media prioritization)
 * 7. Recent Updates & Delta Sync (2026 phylogenomic patch application, Denisovan/Lokiarchaeum)
 * 8. Theme & Layout Switcher (Radial/Dendrogram, ThemeManager persistence)
 * 9. Keyboard Navigation & Accessibility (Escape key, ARIA roles, focusable elements)
 */

declare const globalThis: any;
declare const process: any;

// ==========================================
// 1. ROBUST LIGHTWEIGHT DOM & CANVAS SHIM
// ==========================================

class MockDOMTokenList {
  private tokens: Set<string> = new Set();
  constructor(initial: string = '') {
    if (initial) {
      initial.split(/\s+/).filter(Boolean).forEach(t => this.tokens.add(t));
    }
  }
  add(...tokens: string[]) { tokens.forEach(t => this.tokens.add(t)); }
  remove(...tokens: string[]) { tokens.forEach(t => this.tokens.delete(t)); }
  toggle(token: string, force?: boolean): boolean {
    if (force !== undefined) {
      if (force) this.tokens.add(token);
      else this.tokens.delete(token);
      return force;
    }
    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      return false;
    } else {
      this.tokens.add(token);
      return true;
    }
  }
  contains(token: string): boolean { return this.tokens.has(token); }
  toString(): string { return Array.from(this.tokens).join(' '); }
}

class MockElement {
  public tagName: string;
  public id: string = '';
  public attributes: Map<string, string> = new Map();
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public classList: MockDOMTokenList = new MockDOMTokenList();
  public style: Record<string, any> = {};
  public eventListeners: Map<string, Function[]> = new Map();
  public _value: string = '';
  public _checked: boolean = false;
  private _textContent: string = '';

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get className(): string {
    return this.classList.toString();
  }

  set className(val: string) {
    this.classList = new MockDOMTokenList(val);
  }

  get value(): string {
    if (this.tagName === 'SELECT') {
      const selected = this.children.find(c => c.getAttribute('selected') !== null || (c as any).selected);
      return selected ? (selected.getAttribute('value') || selected.textContent) : (this.children[0]?.getAttribute('value') || this._value);
    }
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    if (this.tagName === 'SELECT') {
      for (const child of this.children) {
        if (child.getAttribute('value') === val) {
          child.setAttribute('selected', 'true');
          (child as any).selected = true;
        } else {
          child.removeAttribute('selected');
          (child as any).selected = false;
        }
      }
    }
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(val: boolean) {
    this._checked = val;
    if (val) this.setAttribute('checked', 'true');
    else this.removeAttribute('checked');
  }

  get textContent(): string {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join(' ');
  }

  set textContent(val: string) {
    this._textContent = val;
    this.children = [];
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name.toLowerCase(), value);
    if (name.toLowerCase() === 'id') this.id = value;
    if (name.toLowerCase() === 'class') this.className = value;
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name.toLowerCase()) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name.toLowerCase());
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name.toLowerCase());
  }

  appendChild(child: MockElement): MockElement {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: MockElement): MockElement {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
    }
    return child;
  }

  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }

  addEventListener(type: string, listener: Function) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    const list = this.eventListeners.get(type);
    if (list) {
      const idx = list.indexOf(listener);
      if (idx !== -1) list.splice(idx, 1);
    }
  }

  dispatchEvent(event: any): boolean {
    event.target = this;
    event.currentTarget = this;
    const list = this.eventListeners.get(event.type);
    if (list) {
      list.forEach(fn => fn(event));
    }
    return !event.defaultPrevented;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, currentTarget: this, defaultPrevented: false, preventDefault: () => {} });
  }

  focus() {}
  scrollIntoView() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, right: 1920, bottom: 1080, width: 1920, height: 1080, x: 0, y: 0 };
  }

  getContext(_type: string, _options?: any) {
    return new MockCanvasRenderingContext2D();
  }

  get innerHTML(): string {
    return this.children.map(c => `<${c.tagName.toLowerCase()}>${c.innerHTML}</${c.tagName.toLowerCase()}>`).join('');
  }

  set innerHTML(html: string) {
    this.children = [];
    parseHTMLInto(html, this);
  }

  querySelector(selector: string): MockElement | null {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];
    const selectors = selector.split(',').map(s => s.trim());

    for (const sel of selectors) {
      this.matchSelectorRecursive(sel, results);
    }
    return results;
  }

  private matchSelectorRecursive(selector: string, accumulator: MockElement[]) {
    for (const child of this.children) {
      if (child.matches(selector) && !accumulator.includes(child)) {
        accumulator.push(child);
      }
      child.matchSelectorRecursive(selector, accumulator);
    }
  }

  public matches(selector: string): boolean {
    const s = selector.trim();
    if (!s) return false;

    let remaining = s;

    // 1. Tag name at start
    const tagMatch = remaining.match(/^([a-zA-Z0-9]+)/);
    if (tagMatch) {
      if (this.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
      remaining = remaining.slice(tagMatch[1].length);
    }

    // 2. ID match: #foo
    const idMatch = remaining.match(/^#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      if (this.id !== idMatch[1]) return false;
      remaining = remaining.slice(idMatch[0].length);
    }

    // 3. Classes and attribute selectors
    while (remaining.length > 0) {
      if (remaining.startsWith('.')) {
        const classMatch = remaining.match(/^\.([a-zA-Z0-9_-]+)/);
        if (!classMatch) return false;
        if (!this.classList.contains(classMatch[1])) return false;
        remaining = remaining.slice(classMatch[0].length);
      } else if (remaining.startsWith('[')) {
        const attrMatch = remaining.match(/^\[([a-zA-Z0-9_-]+)(?:=([^\s\]]+))?\]/);
        if (!attrMatch) return false;
        const attrName = attrMatch[1].toLowerCase();
        const rawVal = attrMatch[2];
        const attrVal = rawVal ? rawVal.replace(/^["']|["']$/g, '') : undefined;
        if (!this.hasAttribute(attrName)) return false;
        if (attrVal !== undefined && this.getAttribute(attrName) !== attrVal) return false;
        remaining = remaining.slice(attrMatch[0].length);
      } else if (remaining.startsWith(':')) {
        const pseudoMatch = remaining.match(/^:([a-zA-Z0-9_-]+)/);
        if (!pseudoMatch) break;
        remaining = remaining.slice(pseudoMatch[0].length);
      } else {
        break;
      }
    }

    return remaining.length === 0;
  }
}

// Simple robust HTML string tokenizer & tree builder for innerHTML
function parseHTMLInto(html: string, parent: MockElement) {
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const tagRegex = /<([a-zA-Z0-9]+)([^>]*)\/?>|([^<]+)|<\/([a-zA-Z0-9]+)>/g;
  let match;
  const stack: MockElement[] = [parent];

  while ((match = tagRegex.exec(cleanHtml)) !== null) {
    const [full, openTag, attrsStr, textContent, closeTag] = match;

    if (openTag) {
      const el = new MockElement(openTag);
      // Parse attributes
      const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let attrMatch;
      if (attrsStr) {
        while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
          const name = attrMatch[1];
          const val = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
          el.setAttribute(name, val);
          if (name.toLowerCase() === 'id') el.id = val;
          if (name.toLowerCase() === 'class') el.className = val;
          if (name.toLowerCase() === 'checked') el._checked = true;
          if (name.toLowerCase() === 'value') el._value = val;
          if (name.toLowerCase() === 'selected') (el as any).selected = true;
        }
      }

      const currentParent = stack[stack.length - 1];
      currentParent.appendChild(el);

      const isSelfClosing = full.endsWith('/>') || ['img', 'input', 'hr', 'br', 'meta', 'link'].includes(openTag.toLowerCase());
      if (!isSelfClosing) {
        stack.push(el);
      }
    } else if (textContent) {
      const trimmed = textContent.trim();
      if (trimmed) {
        const currentParent = stack[stack.length - 1];
        currentParent.textContent = (currentParent.textContent ? currentParent.textContent + ' ' : '') + trimmed;
      }
    } else if (closeTag) {
      if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === closeTag.toLowerCase()) {
        stack.pop();
      }
    }
  }
}

class MockCanvasRenderingContext2D {
  public fillStyle: string = '#000000';
  public strokeStyle: string = '#000000';
  public lineWidth: number = 1;
  public font: string = '10px sans-serif';
  public textAlign: string = 'start';
  public shadowBlur: number = 0;
  public shadowColor: string = 'transparent';
  save() {}
  restore() {}
  scale(_x: number, _y: number) {}
  translate(_x: number, _y: number) {}
  rotate(_angle: number) {}
  beginPath() {}
  arc(_x: number, _y: number, _r: number, _s: number, _e: number) {}
  fill() {}
  stroke() {}
  moveTo(_x: number, _y: number) {}
  lineTo(_x: number, _y: number) {}
  bezierCurveTo(_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) {}
  quadraticCurveTo(_cpx: number, _cpy: number, _x: number, _y: number) {}
  clearRect(_x: number, _y: number, _w: number, _h: number) {}
  fillRect(_x: number, _y: number, _w: number, _h: number) {}
  strokeRect(_x: number, _y: number, _w: number, _h: number) {}
  fillText(_text: string, _x: number, _y: number) {}
  measureText(text: string) { return { width: text.length * 7 }; }
}

// Setup global browser environment
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

const documentMock = {
  body: new MockElement('body'),
  getElementById(id: string): MockElement | null {
    if (this.body.id === id) return this.body;
    return this.body.querySelector(`#${id}`);
  },
  createElement(tag: string): MockElement {
    return new MockElement(tag);
  },
  querySelector(sel: string): MockElement | null {
    return this.body.querySelector(sel);
  },
  querySelectorAll(sel: string): MockElement[] {
    return this.body.querySelectorAll(sel);
  }
};

const getComputedStyleMock = (_el: any) => ({
  getPropertyValue: (prop: string) => {
    if (prop === '--bg-primary') return '#0f172a';
    if (prop === '--border-color') return '#334155';
    if (prop === '--text-primary') return '#f8fafc';
    if (prop === '--accent-primary') return '#38bdf8';
    return '';
  }
});

const windowMock = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  localStorage: mockLocalStorage,
  getComputedStyle: getComputedStyleMock,
  eventListeners: new Map<string, Function[]>(),
  addEventListener(type: string, fn: Function) {
    if (!this.eventListeners.has(type)) this.eventListeners.set(type, []);
    this.eventListeners.get(type)!.push(fn);
  },
  removeEventListener(type: string, fn: Function) {
    const list = this.eventListeners.get(type);
    if (list) {
      const idx = list.indexOf(fn);
      if (idx !== -1) list.splice(idx, 1);
    }
  },
  dispatchEvent(event: any) {
    const list = this.eventListeners.get(event.type);
    if (list) list.forEach(fn => fn(event));
  },
  requestAnimationFrame(fn: Function) {
    return setTimeout(fn, 16) as any;
  },
  cancelAnimationFrame(id: any) {
    clearTimeout(id);
  }
};

// Bind to Node global
globalThis.window = windowMock;
globalThis.document = documentMock;
globalThis.localStorage = mockLocalStorage;
globalThis.getComputedStyle = getComputedStyleMock;
globalThis.HTMLElement = MockElement;
globalThis.HTMLCanvasElement = MockElement;
globalThis.HTMLInputElement = MockElement;
globalThis.HTMLSelectElement = MockElement;
globalThis.CanvasRenderingContext2D = MockCanvasRenderingContext2D;
globalThis.requestAnimationFrame = windowMock.requestAnimationFrame;
globalThis.cancelAnimationFrame = windowMock.cancelAnimationFrame;
globalThis.alert = (_msg: string) => {};

// ==========================================
// 2. IMPORT PHYLIFE MODULES
// ==========================================

import { graphStore } from '../src/graph/PhyGraphStore.ts';
import { SEED_DATA } from '../src/pipeline/seedData.ts';
import { TreeCanvasRenderer } from '../src/renderer/TreeCanvasRenderer.ts';
import { Navbar } from '../src/ui/Navbar.ts';
import { SearchModal } from '../src/ui/SearchModal.ts';
import { MRCAExplorer } from '../src/ui/MRCAExplorer.ts';
import { NodeInspector } from '../src/ui/NodeInspector.ts';
import { UserPreferencesModal } from '../src/ui/UserPreferencesModal.ts';
import { RecentChangesModal } from '../src/ui/RecentChangesModal.ts';
import { TreeControls } from '../src/ui/TreeControls.ts';
import { themeManager } from '../src/ui/ThemeManager.ts';
import { userPreferences } from '../src/services/userPreferences.ts';
import { deltaSyncEngine } from '../src/services/deltaSyncEngine.ts';
import { mediaFetcher } from '../src/pipeline/mediaFetcher.ts';
import type { MRCAResult } from '../src/graph/types.ts';

// ==========================================
// 3. ASSERTION HELPERS & LOGGER
// ==========================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, stepName: string, detail: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${stepName}: ${detail}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${stepName}: ${detail}`);
    throw new Error(`Assertion failed in ${stepName}: ${detail}`);
  }
}

function logHeader(title: string) {
  console.log(`\n================================================================================`);
  console.log(`🔷 ${title}`);
  console.log(`================================================================================`);
}

// ==========================================
// 4. MAIN TEST WALKTHROUGH SUITE
// ==========================================

async function runTestSuite() {
  console.log(`\n🧬 Starting PhyLife End-to-End UI & Feature Walkthrough Test Suite`);
  console.log(`Target: Global Phylogenetic Tree of Life Engine (All Domains)\n`);

  // Clear document & storage
  documentMock.body = new MockElement('body');
  mockLocalStorage.clear();

  // App container
  const appContainer = documentMock.createElement('div');
  appContainer.id = 'app';
  documentMock.body.appendChild(appContainer);

  // --------------------------------------------------------------------------
  // STEP 1: App Bootstrap & Graph Database Seeding
  // --------------------------------------------------------------------------
  logHeader('Step 1: App Bootstrap & Graph Database Seeding');

  graphStore.importJSON({
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    root_id: 'div_luca',
    taxa: SEED_DATA.taxa,
    divergences: SEED_DATA.divergences,
    edges: SEED_DATA.edges,
    synonyms: SEED_DATA.synonyms
  });

  const initialStats = graphStore.getStatistics();
  assert(initialStats.totalNodes === 134, 'Bootstrap', `PhyGraphStore contains exactly 134 nodes (found: ${initialStats.totalNodes})`);
  assert(initialStats.totalTaxonNodes === 91, 'Bootstrap', `PhyGraphStore contains 91 Taxon nodes`);
  assert(initialStats.totalDivergenceNodes === 43, 'Bootstrap', `PhyGraphStore contains 43 Divergence Clade nodes`);
  assert(initialStats.totalEdges === 133, 'Bootstrap', `PhyGraphStore contains exactly 133 Edges (found: ${initialStats.totalEdges})`);
  assert(initialStats.rootId === 'div_luca', 'Bootstrap', `Root node is Hadean LUCA (div_luca)`);
  assert(initialStats.domainCounts.Metazoa === 70, 'Bootstrap', `Metazoa domain has 70 taxa (dense animal lineages)`);
  assert(initialStats.domainCounts.Viridiplantae === 7, 'Bootstrap', `Viridiplantae domain has 7 taxa`);
  assert(initialStats.domainCounts.Fungi === 4, 'Bootstrap', `Fungi domain has 4 taxa`);
  assert(initialStats.domainCounts.Bacteria === 4, 'Bootstrap', `Bacteria domain has 4 taxa`);
  assert(initialStats.domainCounts.Archaea === 4, 'Bootstrap', `Archaea domain has 4 taxa`);

  // Mount canvas and TreeCanvasRenderer
  const canvas = documentMock.createElement('canvas') as any;
  canvas.id = 'tree-canvas';
  appContainer.appendChild(canvas);

  const renderer = new TreeCanvasRenderer(canvas, graphStore);
  assert(renderer !== undefined, 'Bootstrap', 'TreeCanvasRenderer initialized successfully');
  assert(renderer.getLayoutMode() === 'radial', 'Bootstrap', 'Initial layout mode is Radial Phylogram');

  // Mount UI Components
  let pannedNodeId: string | null = null;

  const nodeInspector = new NodeInspector(
    graphStore,
    nodeId => {
      pannedNodeId = nodeId;
      renderer.panToNode(nodeId);
      const n = graphStore.getNode(nodeId);
      if (n) nodeInspector.inspect(n);
    },
    nodeId => {
      nodeInspector.close();
      mrcaExplorer.open('tax_homo_sapiens', nodeId);
    },
    _cladeId => {
      renderer.recomputeLayout();
      navbar.updateStats(graphStore.getAllNodes().length);
    }
  );

  const searchModal = new SearchModal(graphStore, node => {
    pannedNodeId = node.id;
    renderer.panToNode(node.id);
    nodeInspector.inspect(node);
  });

  const mrcaExplorer = new MRCAExplorer(graphStore, (result: MRCAResult) => {
    renderer.setOptions({ activeMRCAIds: new Set(result.full_path), selectedNodeId: result.mrca_node.id });
    renderer.focusMRCAPath(result.full_path);
    nodeInspector.inspect(result.mrca_node);
  });

  const preferencesModal = new UserPreferencesModal(() => {
    renderer.setOptions({ highlightRecentDeltas: userPreferences.isHighlightRecentDeltas() });
  });

  const recentChangesModal = new RecentChangesModal(
    graphStore,
    nodeId => {
      const node = graphStore.getNode(nodeId);
      if (node) {
        renderer.panToNode(nodeId);
        nodeInspector.inspect(node);
      }
    },
    () => {
      renderer.recomputeLayout();
      navbar.updateStats(graphStore.getAllNodes().length);
    }
  );

  const navbar = new Navbar({
    onSearchClick: () => searchModal.open(),
    onMRCAClick: () => mrcaExplorer.open(),
    onPipelineClick: () => {},
    onPreferencesClick: () => preferencesModal.open(),
    onRecentChangesClick: () => recentChangesModal.open(),
    onLayoutChange: mode => renderer.setLayoutMode(mode),
    onResetView: () => renderer.resetCamera()
  });

  const treeControls = new TreeControls({
    onZoomIn: () => renderer.zoomIn(),
    onZoomOut: () => renderer.zoomOut(),
    onReset: () => renderer.resetCamera(),
    onToggleRings: show => renderer.setOptions({ showGeologicalRings: show }),
    onToggleLabels: show => renderer.setOptions({ showLabels: show }),
    onToggleDeltas: show => {
      userPreferences.setHighlightRecentDeltas(show);
      renderer.setOptions({ highlightRecentDeltas: show });
    }
  });

  // Attach components to DOM
  appContainer.appendChild(navbar.getElement() as any);
  appContainer.appendChild(treeControls.getElement() as any);
  documentMock.body.appendChild(nodeInspector.getBackdrop() as any);
  documentMock.body.appendChild(nodeInspector.getElement() as any);
  documentMock.body.appendChild(searchModal.getElement() as any);
  documentMock.body.appendChild(mrcaExplorer.getElement() as any);
  documentMock.body.appendChild(preferencesModal.getElement() as any);
  documentMock.body.appendChild(recentChangesModal.getElement() as any);

  assert(navbar.getElement().querySelector('#nav-search-trigger') !== null, 'Bootstrap', 'Navbar mounted with search trigger');
  assert(navbar.getElement().querySelector('#btn-mrca-trigger') !== null, 'Bootstrap', 'Navbar mounted with MRCA trigger');

  // --------------------------------------------------------------------------
  // STEP 2: Search & Taxon Inspection
  // --------------------------------------------------------------------------
  logHeader('Step 2: Search & Taxon Inspection Walkthrough');

  // 2.1 Trigger search modal
  const searchTrigger = navbar.getElement().querySelector('#nav-search-trigger') as any;
  searchTrigger?.click();
  assert(searchModal.getElement().classList.contains('active'), 'Search', 'Search modal opened on #nav-search-trigger click');

  // 2.2 Search 'Tyrannosaurus'
  const searchInput = searchModal.getElement().querySelector('.search-input') as unknown as MockElement;
  searchInput.value = 'Tyrannosaurus';
  searchInput.dispatchEvent({ type: 'input', target: searchInput });

  let resultItems = searchModal.getElement().querySelectorAll('.search-result-item') as unknown as MockElement[];
  assert(resultItems.length > 0, 'Search', `Searching 'Tyrannosaurus' returned ${resultItems.length} result(s)`);
  assert(resultItems[0].getAttribute('data-id') === 'tax_tyrannosaurus', 'Search', `First result matches tax_tyrannosaurus`);

  // Click first result
  resultItems[0].click();
  assert(!searchModal.getElement().classList.contains('active'), 'Search', 'Search modal closes on result selection');
  assert(pannedNodeId === 'tax_tyrannosaurus', 'Search', 'Camera panned to selected taxon (tax_tyrannosaurus)');
  assert(nodeInspector.getElement().classList.contains('open'), 'Search', 'NodeInspector drawer opened for Tyrannosaurus rex');

  // 2.3 Search 'Lion' (Panthera leo)
  searchModal.open();
  searchInput.value = 'Lion';
  searchInput.dispatchEvent({ type: 'input', target: searchInput });
  resultItems = searchModal.getElement().querySelectorAll('.search-result-item') as unknown as MockElement[];
  assert(resultItems.some((item: MockElement) => item.getAttribute('data-id') === 'tax_panthera_leo'), 'Search', `Searching 'Lion' returned Panthera leo (tax_panthera_leo)`);

  // 2.4 Search 'Amanita' (Fly Agaric Fungi)
  searchInput.value = 'Amanita';
  searchInput.dispatchEvent({ type: 'input', target: searchInput });
  resultItems = searchModal.getElement().querySelectorAll('.search-result-item') as unknown as MockElement[];
  assert(resultItems.some((item: MockElement) => item.getAttribute('data-id') === 'tax_amanita_muscaria'), 'Search', `Searching 'Amanita' returned Amanita muscaria (Fungi)`);

  // 2.5 Search 'E. coli' (Escherichia coli Bacteria)
  searchInput.value = 'coli';
  searchInput.dispatchEvent({ type: 'input', target: searchInput });
  resultItems = searchModal.getElement().querySelectorAll('.search-result-item') as unknown as MockElement[];
  assert(resultItems.some((item: MockElement) => item.getAttribute('data-id') === 'tax_escherichia_coli'), 'Search', `Searching 'coli' returned Escherichia coli (Bacteria)`);

  // 2.6 Domain filter testing
  searchInput.value = '';
  searchInput.dispatchEvent({ type: 'input', target: searchInput });
  const fungiFilter = searchModal.getElement().querySelector('.domain-chip[data-domain="Fungi"]') as any;
  fungiFilter?.click();
  resultItems = searchModal.getElement().querySelectorAll('.search-result-item') as unknown as MockElement[];
  assert(resultItems.length === 4, 'Search Filter', `Fungi domain filter returned all 4 fungi taxa (found: ${resultItems.length})`);

  searchModal.close();

  // --------------------------------------------------------------------------
  // STEP 3: Most Recent Common Ancestor (MRCA) Explorer
  // --------------------------------------------------------------------------
  logHeader('Step 3: MRCA Explorer & Evolutionary Divergence Pathfinding');

  const mrcaTrigger = navbar.getElement().querySelector('#btn-mrca-trigger') as any;
  mrcaTrigger?.click();
  assert(mrcaExplorer.getElement().classList.contains('active'), 'MRCA Explorer', 'MRCA Explorer opened on #btn-mrca-trigger click');

  // Test 3.1: Homo sapiens vs Panthera leo (Human & Lion)
  const selectA = mrcaExplorer.getElement().querySelector('#select-species-a') as unknown as MockElement;
  const selectB = mrcaExplorer.getElement().querySelector('#select-species-b') as unknown as MockElement;

  selectA.value = 'tax_homo_sapiens';
  selectA.dispatchEvent({ type: 'change', target: selectA });
  selectB.value = 'tax_panthera_leo';
  selectB.dispatchEvent({ type: 'change', target: selectB });

  const humanLionMRCA = graphStore.findMRCA('tax_homo_sapiens', 'tax_panthera_leo');
  assert(humanLionMRCA !== null, 'MRCA Explorer', 'MRCA computed between Homo sapiens and Panthera leo');
  assert(humanLionMRCA!.mrca_node.id === 'div_placentalia_orders', 'MRCA Explorer', `Human/Lion MRCA is Placentalia divergence (div_placentalia_orders)`);
  assert(humanLionMRCA!.divergence_mya === 95, 'MRCA Explorer', `Human/Lion divergence age is 95 Ma (Late Cretaceous)`);
  assert(humanLionMRCA!.geological_era === 'Mesozoic', 'MRCA Explorer', `Geological era is Mesozoic`);
  assert(humanLionMRCA!.full_path.includes('div_placentalia_orders'), 'MRCA Explorer', 'Full divergence path includes MRCA node');

  // Test 3.2: Path Highlighting Button
  const highlightBtn = mrcaExplorer.getElement().querySelector('#btn-highlight-mrca') as any;
  highlightBtn?.click();
  assert(!mrcaExplorer.getElement().classList.contains('active'), 'MRCA Explorer', 'MRCA modal closes on Trace Path activation');
  assert(nodeInspector.getElement().classList.contains('open'), 'MRCA Explorer', 'NodeInspector inspected MRCA node upon path trace');

  // Test 3.3: Cross-Domain MRCA Calculations
  const humanFungusMRCA = graphStore.findMRCA('tax_homo_sapiens', 'tax_amanita_muscaria');
  assert(humanFungusMRCA!.mrca_node.id === 'div_opisthokonta', 'MRCA Cross-Domain', `Human & Fly Agaric MRCA is Opisthokonta (1500 Ma, Proterozoic)`);

  const humanPlantMRCA = graphStore.findMRCA('tax_homo_sapiens', 'tax_arabidopsis');
  assert(humanPlantMRCA!.mrca_node.id === 'div_eukaryogenesis', 'MRCA Cross-Domain', `Human & Arabidopsis MRCA is Eukaryogenesis (2100 Ma, Proterozoic)`);

  const humanBacteriumMRCA = graphStore.findMRCA('tax_homo_sapiens', 'tax_escherichia_coli');
  assert(humanBacteriumMRCA!.mrca_node.id === 'div_luca', 'MRCA Cross-Domain', `Human & E. coli MRCA is LUCA (4200 Ma, Hadean)`);

  // --------------------------------------------------------------------------
  // STEP 4: NodeInspector Tabs & Media Integration
  // --------------------------------------------------------------------------
  logHeader('Step 4: NodeInspector Tabs, Morphology, Lineage & Media Packages');

  const humanNode = graphStore.getNode('tax_homo_sapiens')!;
  await nodeInspector.inspect(humanNode);

  // 4.1 Overview Tab
  const overviewTitle = nodeInspector.getElement().querySelector('.taxon-scientific-name');
  assert(overviewTitle?.textContent?.includes('Homo sapiens') === true, 'NodeInspector', `Overview displays scientific name Homo sapiens (found: ${overviewTitle?.textContent})`);
  assert(nodeInspector.getElement().querySelector('.badge-extant') !== null, 'NodeInspector', 'Extant (Living) badge rendered');

  // 4.2 Species & Member Taxa Tab (Drill-Down)
  const speciesTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="species"]') as any;
  speciesTabBtn?.click();
  const humanSisterCards = nodeInspector.getElement().querySelectorAll('.species-drilldown-card') as unknown as MockElement[];
  assert(humanSisterCards.length >= 5, 'NodeInspector Species Tab', `Hominini species tab displays ${humanSisterCards.length} hominin & great ape species (Neanderthal, Denisovan, Australopithecus, Chimp)`);

  // Inspect Tyrannosauroidea Clade for dense species drill-down
  const rexClade = graphStore.getNode('div_tyrannosauroidea')!;
  await nodeInspector.inspect(rexClade);
  const rexSpeciesTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="species"]') as any;
  rexSpeciesTabBtn?.click();
  const rexCards = nodeInspector.getElement().querySelectorAll('.species-drilldown-card') as unknown as MockElement[];
  assert(rexCards.length >= 10, 'NodeInspector Species Drill-Down', `Tyrannosauroidea clade displays all ${rexCards.length} member species (T-Rex, Tarbosaurus, Albertosaurus, Yutyrannus, etc.)`);

  // 4.3 Videos Tab
  await nodeInspector.inspect(humanNode);
  const videosTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="videos"]') as any;
  videosTabBtn?.click();
  const videoLinks = nodeInspector.getElement().querySelectorAll('.media-card-link') as unknown as MockElement[];
  assert(videoLinks.length >= 3, 'NodeInspector Videos', `Videos tab contains ${videoLinks.length} educational video recommendations`);
  assert(videoLinks.some((link: MockElement) => link.getAttribute('href')?.includes('youtube.com') === true), 'NodeInspector Videos', 'YouTube deep search queries generated properly');

  // 4.4 Podcasts Tab
  const podcastsTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="podcasts"]') as any;
  podcastsTabBtn?.click();
  const podcastLinks = nodeInspector.getElement().querySelectorAll('.media-card-link') as unknown as MockElement[];
  assert(podcastLinks.length >= 2, 'NodeInspector Podcasts', `Podcasts tab contains ${podcastLinks.length} audio episodes (Ologies, Common Descent, Radiolab)`);

  // 4.5 Photos Tab
  const photosTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="media"]') as any;
  photosTabBtn?.click();
  const photoImages = nodeInspector.getElement().querySelectorAll('img') as unknown as MockElement[];
  assert(photoImages.length > 0, 'NodeInspector Photos', 'Photos tab loaded media items and image galleries');

  // 4.6 Lineage Tab
  const lineageTabBtn = nodeInspector.getElement().querySelector('.tab-btn[data-tab="lineage"]') as any;
  lineageTabBtn?.click();
  const lineageChips = nodeInspector.getElement().querySelectorAll('.lineage-chip') as unknown as MockElement[];
  assert(lineageChips.length >= 7, 'NodeInspector Lineage', `Lineage tab displays ${lineageChips.length} ancestral hierarchy nodes from LUCA to Species`);

  // Click lineage chip to navigate up the tree
  lineageChips[0].click(); // LUCA
  assert(pannedNodeId === 'div_luca', 'NodeInspector Lineage', 'Clicking lineage breadcrumb pans camera to ancestral node (div_luca)');

  // --------------------------------------------------------------------------
  // STEP 5: On-Demand Clade Expansion & Clade Focus Mode
  // --------------------------------------------------------------------------
  logHeader('Step 5: On-Demand Clade Expansion & Local Graph Grafting');

  const nodesBeforeFeliformia = graphStore.getAllNodes().length;
  await nodeInspector.inspect(graphStore.getNode('div_carnivora_feliformia_caniformia')!);

  const expandBtn = nodeInspector.getElement().querySelector('#btn-expand-clade') as any;
  expandBtn?.click();

  const nodesAfterFeliformia = graphStore.getAllNodes().length;
  assert(nodesAfterFeliformia === nodesBeforeFeliformia + 2, 'Clade Expansion', `Feliformia expansion grafted 2 new sister taxa: Leopard & Cougar`);
  assert(graphStore.getNode('tax_panthera_pardus') !== undefined, 'Clade Expansion', 'Leopard (tax_panthera_pardus) node added to graphStore');
  assert(graphStore.getNode('tax_puma_concolor') !== undefined, 'Clade Expansion', 'Cougar (tax_puma_concolor) node added to graphStore');

  // Expand Dinosauria clade
  await nodeInspector.inspect(graphStore.getNode('div_dinosauria_aves')!);
  const expandDinoBtn = nodeInspector.getElement().querySelector('#btn-expand-clade') as any;
  expandDinoBtn?.click();

  const nodesAfterDino = graphStore.getAllNodes().length;
  assert(nodesAfterDino === nodesAfterFeliformia + 2, 'Clade Expansion', `Dinosauria expansion grafted 2 exotic species: Therizinosaurus & Pachycephalosaurus`);
  assert(graphStore.getNode('tax_therizinosaurus') !== undefined, 'Clade Expansion', 'Therizinosaurus (tax_therizinosaurus) added to graphStore');
  assert(graphStore.getNode('tax_pachycephalosaurus') !== undefined, 'Clade Expansion', 'Pachycephalosaurus (tax_pachycephalosaurus) added to graphStore');

  // Clade Focus Mode Test
  renderer.focusClade('div_tyrannosauroidea');
  assert(renderer.getFocusedCladeId() === 'div_tyrannosauroidea', 'Clade Focus Mode', 'Canvas renderer re-rooted and focused on Tyrannosauroidea clade');
  renderer.focusClade(null);
  assert(renderer.getFocusedCladeId() === null, 'Clade Focus Mode', 'Canvas renderer reset to full tree of life');


  // --------------------------------------------------------------------------
  // STEP 6: Creator Preferences & Media Prioritization
  // --------------------------------------------------------------------------
  logHeader('Step 6: Creator Preferences & Dynamic Media Prioritization');

  const prefsTrigger = navbar.getElement().querySelector('#btn-prefs-trigger') as any;
  prefsTrigger?.click();
  assert(preferencesModal.getElement().classList.contains('active'), 'Preferences', 'UserPreferencesModal opened on #btn-prefs-trigger click');

  // 6.1 Toggle existing creator
  const initialAttenborough = userPreferences.isCreatorSelected('david_attenborough');
  const attenboroughCard = preferencesModal.getElement().querySelector('.creator-card[data-creator-id="david_attenborough"]') as any;
  attenboroughCard?.click();
  assert(userPreferences.isCreatorSelected('david_attenborough') !== initialAttenborough, 'Preferences', 'Toggled Sir David Attenborough preference');
  attenboroughCard?.click(); // restore
  assert(userPreferences.isCreatorSelected('david_attenborough') === initialAttenborough, 'Preferences', 'Restored Sir David Attenborough preference');

  // 6.2 Add custom creator
  const customInput = preferencesModal.getElement().querySelector('#custom-creator-input') as unknown as MockElement;
  const addCreatorBtn = preferencesModal.getElement().querySelector('#btn-add-custom-creator') as any;
  customInput.value = 'Neil deGrasse Tyson';
  addCreatorBtn?.click();

  const allCreators = userPreferences.getAllCreators();
  const tyson = allCreators.find(c => c.name === 'Neil deGrasse Tyson');
  assert(tyson !== undefined, 'Preferences', 'Custom creator Neil deGrasse Tyson successfully added');
  assert(userPreferences.isCreatorSelected(tyson!.id), 'Preferences', 'Newly added custom creator is automatically selected');

  // 6.3 Verify media ranking prioritizes creator matches
  const samplePkg = await mediaFetcher.fetchCompleteMediaPackage(graphStore.getNode('tax_homo_sapiens') as any);
  assert(samplePkg.videos.length > 0, 'Preferences Media', 'Fetched media package for Homo sapiens');
  assert(samplePkg.videos[0].isCreatorMatch === true, 'Preferences Media', 'Top-ranked video matches user favorite creator (PBS Eons / David Attenborough)');

  // 6.4 Clean up custom creator
  userPreferences.removeCustomCreator(tyson!.id);
  assert(!userPreferences.getAllCreators().some(c => c.name === 'Neil deGrasse Tyson'), 'Preferences', 'Custom creator successfully deleted');

  preferencesModal.close();

  // --------------------------------------------------------------------------
  // STEP 7: Recent Updates & Delta Sync (2026 Phylogenomics)
  // --------------------------------------------------------------------------
  logHeader('Step 7: Recent Updates & 2026 Phylogenomic Delta Sync');

  const recentTrigger = navbar.getElement().querySelector('#btn-recent-trigger') as any;
  recentTrigger?.click();
  assert(recentChangesModal.getElement().classList.contains('active'), 'Delta Sync', 'RecentChangesModal opened on #btn-recent-trigger click');

  const patchBtn = recentChangesModal.getElement().querySelector('#btn-apply-2026-delta') as any;
  assert(patchBtn !== null, 'Delta Sync', 'Apply 2026 Phylogenomic Delta button found (#btn-apply-2026-delta)');

  patchBtn?.click();

  // Verify delta nodes added to graphStore
  const denisovan = graphStore.getNode('tax_homo_denisova');
  assert(denisovan !== undefined, 'Delta Sync', 'Homo sp. Denisova (tax_homo_denisova) added to graphStore via 2026 patch');
  assert(denisovan!.delta_status === 'new', 'Delta Sync', 'Denisovan marked with delta_status: new');
  assert(denisovan!.is_recently_updated === true, 'Delta Sync', 'Denisovan flagged as is_recently_updated: true');

  const loki = graphStore.getNode('tax_lokiarchaeum');
  assert(loki !== undefined, 'Delta Sync', 'Lokiarchaeum ossiferum (tax_lokiarchaeum) added to graphStore via 2026 patch');
  assert(loki!.delta_status === 'new', 'Delta Sync', 'Lokiarchaeum marked with delta_status: new');

  const rex = graphStore.getNode('tax_tyrannosaurus');
  assert(rex !== undefined && rex.recent_discovery_note?.includes('2026 Biomechanical Density') === true, 'Delta Sync', 'Tyrannosaurus rex updated with 2026 biomechanical cranial kinetic study note');

  const neanderthal = graphStore.getNode('tax_neanderthal');
  assert(neanderthal !== undefined && neanderthal.recent_discovery_note?.includes('2026 Ancient Genomics') === true, 'Delta Sync', 'Neanderthal updated with 2026 Denisovan shared lineage genomics note');

  const archaeaDiv = graphStore.getNode('div_archaea_eukarya');
  assert(archaeaDiv !== undefined && (archaeaDiv as any).evolutionary_milestone?.includes('2026 phylogenomic') === true, 'Delta Sync', 'Archaea/Eukaryote divergence updated with 2026 Asgardarchaeota milestone');

  const summary = deltaSyncEngine.getRecentChangesSummary(graphStore);
  assert(summary.newTaxaCount >= 2, 'Delta Sync', `Summary metrics report ${summary.newTaxaCount} new taxa added`);
  assert(summary.modifiedNodesCount >= 2, 'Delta Sync', `Summary metrics report ${summary.modifiedNodesCount} modified clades`);

  // Verify clicking recent change item inspects node
  const recentItems = recentChangesModal.getElement().querySelectorAll('.recent-change-item') as unknown as MockElement[];
  assert(recentItems.length >= 2, 'Delta Sync', `Recent changes list renders ${recentItems.length} update cards`);
  recentItems[0].click();
  assert(!recentChangesModal.getElement().classList.contains('active'), 'Delta Sync', 'RecentChangesModal closes when selecting an item');
  assert(nodeInspector.getElement().classList.contains('open'), 'Delta Sync', 'NodeInspector opens for clicked recent delta item');

  // --------------------------------------------------------------------------
  // STEP 8: Theme & Layout Switcher
  // --------------------------------------------------------------------------
  logHeader('Step 8: Theme & Layout Switcher Walkthrough');

  // 8.1 Layout switcher
  const dendroBtn = navbar.getElement().querySelector('#btn-layout-dendro') as any;
  dendroBtn?.click();
  assert(renderer.getLayoutMode() === 'dendrogram', 'Layout Switcher', 'Tree renderer switched to Dendrogram layout');
  assert(navbar.getLayout() === 'dendrogram', 'Layout Switcher', 'Navbar layout state updated to Dendrogram');

  const radialBtn = navbar.getElement().querySelector('#btn-layout-radial') as any;
  radialBtn?.click();
  assert(renderer.getLayoutMode() === 'radial', 'Layout Switcher', 'Tree renderer switched back to Radial layout');
  assert(navbar.getLayout() === 'radial', 'Layout Switcher', 'Navbar layout state updated to Radial');

  // 8.2 Theme switcher
  const themeSelect = navbar.getElement().querySelector('#theme-selector') as unknown as MockElement;

  themeSelect.value = 'bioluminescent';
  themeSelect.dispatchEvent({ type: 'change', target: themeSelect });
  assert(themeManager.getTheme() === 'bioluminescent', 'Theme Switcher', 'Theme updated to bioluminescent');
  assert(documentMock.body.getAttribute('data-theme') === 'bioluminescent', 'Theme Switcher', 'data-theme on body is bioluminescent');
  assert(mockLocalStorage.getItem('phylife_theme') === 'bioluminescent', 'Theme Switcher', 'Theme persisted in localStorage');

  themeSelect.value = 'academic-light';
  themeSelect.dispatchEvent({ type: 'change', target: themeSelect });
  assert(themeManager.getTheme() === 'academic-light', 'Theme Switcher', 'Theme updated to academic-light');
  assert(documentMock.body.getAttribute('data-theme') === 'academic-light', 'Theme Switcher', 'data-theme on body is academic-light');

  themeSelect.value = 'modern-dark';
  themeSelect.dispatchEvent({ type: 'change', target: themeSelect });
  assert(themeManager.getTheme() === 'modern-dark', 'Theme Switcher', 'Theme restored to modern-dark');

  // --------------------------------------------------------------------------
  // STEP 9: Keyboard Navigation & Accessibility (a11y)
  // --------------------------------------------------------------------------
  logHeader('Step 9: Keyboard Navigation & Accessibility (ARIA & Keybindings)');

  // 9.1 Escape key closes SearchModal
  searchModal.open();
  assert(searchModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'SearchModal opened');
  windowMock.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!searchModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'Escape key closed SearchModal');

  // 9.2 Escape key closes MRCAExplorer
  mrcaExplorer.open();
  assert(mrcaExplorer.getElement().classList.contains('active'), 'Keyboard Navigation', 'MRCAExplorer opened');
  windowMock.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!mrcaExplorer.getElement().classList.contains('active'), 'Keyboard Navigation', 'Escape key closed MRCAExplorer');

  // 9.3 Escape key closes NodeInspector
  nodeInspector.open();
  assert(nodeInspector.getElement().classList.contains('open'), 'Keyboard Navigation', 'NodeInspector opened');
  windowMock.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!nodeInspector.getElement().classList.contains('open'), 'Keyboard Navigation', 'Escape key closed NodeInspector');

  // 9.4 Escape key closes UserPreferencesModal
  preferencesModal.open();
  assert(preferencesModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'UserPreferencesModal opened');
  windowMock.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!preferencesModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'Escape key closed UserPreferencesModal');

  // 9.5 Escape key closes RecentChangesModal
  recentChangesModal.open();
  assert(recentChangesModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'RecentChangesModal opened');
  windowMock.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!recentChangesModal.getElement().classList.contains('active'), 'Keyboard Navigation', 'Escape key closed RecentChangesModal');

  // 9.6 ARIA Attributes verification
  assert(navbar.getElement().getAttribute('role') === 'banner', 'Accessibility', 'Navbar has role="banner"');
  assert(searchModal.getElement().getAttribute('role') === 'dialog', 'Accessibility', 'SearchModal has role="dialog"');
  assert(searchModal.getElement().getAttribute('aria-modal') === 'true', 'Accessibility', 'SearchModal has aria-modal="true"');
  assert(mrcaExplorer.getElement().getAttribute('role') === 'dialog', 'Accessibility', 'MRCAExplorer has role="dialog"');
  assert(nodeInspector.getElement().getAttribute('role') === 'region', 'Accessibility', 'NodeInspector has role="region"');
  assert(treeControls.getElement().getAttribute('role') === 'toolbar', 'Accessibility', 'TreeControls floating dock has role="toolbar"');

  // ==========================================
  // FINAL REPORT
  // ==========================================
  console.log(`\n================================================================================`);
  console.log(`🎉 WALKTHROUGH TEST SUITE COMPLETE: 100% PASS`);
  console.log(`Total Assertions Verified: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`================================================================================\n`);

  process.exit(0);
}

runTestSuite().catch(err => {
  console.error('\n❌ Test Suite Aborted due to error:', err);
  process.exit(1);
});
