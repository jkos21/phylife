import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import type {
  RenderNode,
  RenderEdge,
  GeologicalRing,
  CameraState,
  RendererOptions,
  LayoutMode
} from './types.ts';
import { computeRadialLayout, myaToRadius } from './layoutRadial.ts';
import { computeDendrogramLayout, myaToX } from './layoutDendrogram.ts';

export class TreeCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private store: PhyGraphStore;

  private options: RendererOptions = {
    layoutMode: 'radial',
    showLabels: true,
    showGeologicalRings: true,
    showExtinctBadges: true,
    showThumbnails: true
  };

  private camera: CameraState = {
    x: 0,
    y: 0,
    zoom: 0.85,
    targetX: 0,
    targetY: 0,
    targetZoom: 0.85,
    isAnimating: false
  };

  private nodes: RenderNode[] = [];
  private edges: RenderEdge[] = [];
  private rings: GeologicalRing[] = [];

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private animationFrameId: number | null = null;
  private mrcaPulsePhase = 0;

  // Callbacks
  private onNodeClickCallback?: (node: RenderNode) => void;
  private onNodeHoverCallback?: (node: RenderNode | null) => void;

  constructor(canvas: HTMLCanvasElement, store: PhyGraphStore) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.store = store;

    this.initEvents();
    this.resize();
    this.recomputeLayout();
    this.startRenderLoop();
  }

  public setCallbacks(
    onNodeClick: (node: RenderNode) => void,
    onNodeHover: (node: RenderNode | null) => void
  ): void {
    this.onNodeClickCallback = onNodeClick;
    this.onNodeHoverCallback = onNodeHover;
  }

  public setOptions(newOptions: Partial<RendererOptions>): void {
    const layoutChanged = newOptions.layoutMode && newOptions.layoutMode !== this.options.layoutMode;
    const mrcaChanged = newOptions.activeMRCAIds !== this.options.activeMRCAIds;

    this.options = { ...this.options, ...newOptions };

    if (layoutChanged || mrcaChanged) {
      this.recomputeLayout();
    }
  }

  public setLayoutMode(mode: LayoutMode): void {
    if (this.options.layoutMode !== mode) {
      this.options.layoutMode = mode;
      this.recomputeLayout();
      this.resetCamera();
    }
  }

  public getLayoutMode(): LayoutMode {
    return this.options.layoutMode;
  }

  public recomputeLayout(): void {
    if (this.options.layoutMode === 'radial') {
      const { nodes, edges, rings } = computeRadialLayout(this.store, this.options);
      this.nodes = nodes;
      this.edges = edges;
      this.rings = rings;
    } else {
      const { nodes, edges, rings } = computeDendrogramLayout(this.store, this.options);
      this.nodes = nodes;
      this.edges = edges;
      this.rings = rings;
    }
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  public resetCamera(): void {
    this.camera.targetX = 0;
    this.camera.targetY = 0;
    this.camera.targetZoom = this.options.layoutMode === 'radial' ? 0.85 : 0.65;
    this.camera.isAnimating = true;
  }

  public zoomIn(): void {
    this.camera.targetZoom = Math.min(6.0, this.camera.targetZoom * 1.35);
    this.camera.isAnimating = true;
  }

  public zoomOut(): void {
    this.camera.targetZoom = Math.max(0.15, this.camera.targetZoom / 1.35);
    this.camera.isAnimating = true;
  }

  public panToNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      this.camera.targetX = -node.x;
      this.camera.targetY = -node.y;
      this.camera.targetZoom = Math.max(1.5, this.camera.zoom);
      this.camera.isAnimating = true;
    }
  }

  public focusMRCAPath(nodeIds: string[]): void {
    const matching = this.nodes.filter(n => nodeIds.includes(n.id));
    if (matching.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const n of matching) {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const spanX = Math.max(200, maxX - minX);
    const spanY = Math.max(200, maxY - minY);

    const rect = this.canvas.getBoundingClientRect();
    const desiredZoom = Math.min(2.5, Math.max(0.4, Math.min(rect.width / (spanX * 1.6), rect.height / (spanY * 1.6))));

    this.camera.targetX = -centerX;
    this.camera.targetY = -centerY;
    this.camera.targetZoom = desiredZoom;
    this.camera.isAnimating = true;
  }

  private initEvents(): void {
    window.addEventListener('resize', () => {
      this.resize();
    });

    this.canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (this.isDragging) {
        const dx = (e.clientX - this.lastMouseX) / this.camera.zoom;
        const dy = (e.clientY - this.lastMouseY) / this.camera.zoom;
        this.camera.x += dx;
        this.camera.y += dy;
        this.camera.targetX = this.camera.x;
        this.camera.targetY = this.camera.y;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        // Hover detection
        const worldPos = this.screenToWorld(clientX, clientY);
        const hovered = this.findNodeAt(worldPos.x, worldPos.y);

        const prevHover = this.options.hoveredNodeId;
        const newHover = hovered ? hovered.id : null;

        if (prevHover !== newHover) {
          this.options.hoveredNodeId = newHover;
          this.canvas.style.cursor = hovered ? 'pointer' : 'default';
          if (this.onNodeHoverCallback) {
            this.onNodeHoverCallback(hovered);
          }
        }
      }
    });

    window.addEventListener('mouseup', e => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';

        const totalDrag = Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
        if (totalDrag < 6) {
          // Click event
          const rect = this.canvas.getBoundingClientRect();
          const clientX = e.clientX - rect.left;
          const clientY = e.clientY - rect.top;
          const worldPos = this.screenToWorld(clientX, clientY);
          const clicked = this.findNodeAt(worldPos.x, worldPos.y);

          if (clicked) {
            this.options.selectedNodeId = clicked.id;
            if (this.onNodeClickCallback) {
              this.onNodeClickCallback(clicked);
            }
          }
        }
      }
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldBefore = this.screenToWorld(mouseX, mouseY);
      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newZoom = Math.max(0.15, Math.min(6.0, this.camera.zoom * zoomFactor));

      this.camera.zoom = newZoom;
      this.camera.targetZoom = newZoom;

      // Adjust camera so mouse position stays fixed in world coords
      const worldAfter = this.screenToWorld(mouseX, mouseY);
      this.camera.x += (worldAfter.x - worldBefore.x);
      this.camera.y += (worldAfter.y - worldBefore.y);
      this.camera.targetX = this.camera.x;
      this.camera.targetY = this.camera.y;
    }, { passive: false });
  }

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const x = (sx - cx) / this.camera.zoom - this.camera.x;
    const y = (sy - cy) / this.camera.zoom - this.camera.y;
    return { x, y };
  }

  private findNodeAt(wx: number, wy: number): RenderNode | null {
    const hitRadius = Math.max(12, 18 / this.camera.zoom);

    // Search leaves first, then internal nodes
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dist = Math.hypot(node.x - wx, node.y - wy);
      if (dist <= hitRadius) {
        return node;
      }
    }
    return null;
  }

  private startRenderLoop(): void {
    const render = () => {
      this.updateCamera();
      this.draw();
      this.animationFrameId = requestAnimationFrame(render);
    };
    this.animationFrameId = requestAnimationFrame(render);
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private updateCamera(): void {
    if (this.camera.isAnimating) {
      const ease = 0.12;
      this.camera.x += (this.camera.targetX - this.camera.x) * ease;
      this.camera.y += (this.camera.targetY - this.camera.y) * ease;
      this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * ease;

      if (
        Math.abs(this.camera.targetX - this.camera.x) < 0.1 &&
        Math.abs(this.camera.targetY - this.camera.y) < 0.1 &&
        Math.abs(this.camera.targetZoom - this.camera.zoom) < 0.001
      ) {
        this.camera.x = this.camera.targetX;
        this.camera.y = this.camera.targetY;
        this.camera.zoom = this.camera.targetZoom;
        this.camera.isAnimating = false;
      }
    }

    this.mrcaPulsePhase = (this.mrcaPulsePhase + 0.04) % (Math.PI * 2);
  }

  private draw(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Get theme background color from document body or CSS variable
    const themeBg = (typeof getComputedStyle !== 'undefined' && typeof document !== 'undefined' && document.body)
      ? (getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#0f172a')
      : '#0f172a';
    this.ctx.fillStyle = themeBg;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.save();
    // Center viewport and apply camera transform
    this.ctx.translate(width / 2, height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(this.camera.x, this.camera.y);

    // 1. Draw Geological Rings / Bands
    if (this.options.showGeologicalRings) {
      this.drawGeologicalRings();
    }

    // 2. Draw Branch Edges
    this.drawEdges();

    // 3. Draw Nodes (with dynamic Level of Detail and Time Slicing)
    this.drawNodes();

    // 4. Draw Chronogram Isochrone Horizon (if time cutoff is active)
    if (this.options.timeCutoffMya !== undefined && this.options.timeCutoffMya > 0) {
      this.drawIsochroneHorizon(this.options.timeCutoffMya);
    }

    this.ctx.restore();
  }

  public getEraForMya(mya: number): string {
    if (mya >= 4000) return 'Hadean';
    if (mya >= 2500) return 'Archean';
    if (mya >= 541) return 'Proterozoic';
    if (mya >= 252) return 'Paleozoic';
    if (mya >= 66) return 'Mesozoic';
    return 'Cenozoic';
  }

  public getActiveLineagesAtTime(mya: number): number {
    if (mya <= 0) {
      return this.nodes.filter(n => n.isLeaf).length;
    }
    let activeCount = 0;
    for (const edge of this.edges) {
      const srcMya = edge.source.divergenceMya ?? 0;
      const tgtMya = edge.target.divergenceMya ?? 0;
      if (srcMya >= mya && tgtMya < mya) {
        activeCount++;
      }
    }
    return Math.max(activeCount, 1);
  }

  private drawGeologicalRings(): void {
    const cutoff = this.options.timeCutoffMya ?? 0;

    if (this.options.layoutMode === 'radial') {
      for (const ring of this.rings) {
        const isEraActive = cutoff > 0 && cutoff <= ring.startMya && cutoff >= ring.endMya;

        this.ctx.beginPath();
        this.ctx.arc(0, 0, ring.outerRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = isEraActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)';
        this.ctx.lineWidth = (isEraActive ? 1.8 : 1) / this.camera.zoom;
        this.ctx.stroke();

        // Era background band
        this.ctx.beginPath();
        this.ctx.arc(0, 0, ring.outerRadius, 0, Math.PI * 2);
        this.ctx.arc(0, 0, ring.innerRadius, Math.PI * 2, 0, true);
        this.ctx.fillStyle = isEraActive ? 'rgba(56, 189, 248, 0.16)' : ring.color;
        this.ctx.fill();

        // Ring Label
        if (this.camera.zoom > 0.4) {
          this.ctx.save();
          this.ctx.fillStyle = isEraActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
          this.ctx.font = `${isEraActive ? '700' : '600'} ${Math.max(10, 12 / this.camera.zoom)}px 'Inter', sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.fillText(ring.label, 0, -ring.outerRadius + 18 / this.camera.zoom);
          this.ctx.restore();
        }
      }
    } else {
      // Dendrogram vertical bands
      for (const band of this.rings) {
        const isEraActive = cutoff > 0 && cutoff <= band.startMya && cutoff >= band.endMya;
        const bandWidth = band.outerRadius - band.innerRadius;

        this.ctx.fillStyle = isEraActive ? 'rgba(56, 189, 248, 0.16)' : band.color;
        this.ctx.fillRect(band.innerRadius, -2000, bandWidth, 4000);

        this.ctx.strokeStyle = isEraActive ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)';
        this.ctx.lineWidth = (isEraActive ? 1.8 : 1) / this.camera.zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(band.outerRadius, -2000);
        this.ctx.lineTo(band.outerRadius, 2000);
        this.ctx.stroke();

        // Band Label
        this.ctx.save();
        this.ctx.fillStyle = isEraActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
        this.ctx.font = `${isEraActive ? '700' : '600'} ${Math.max(11, 13 / this.camera.zoom)}px 'Inter', sans-serif`;
        this.ctx.fillText(band.label, band.innerRadius + 8, -600);
        this.ctx.restore();
      }
    }
  }

  private drawIsochroneHorizon(cutoff: number): void {
    const pulse = 0.5 + 0.5 * Math.sin(this.mrcaPulsePhase * 2);
    const eraName = this.getEraForMya(cutoff);
    const eraText = cutoff === 0 ? 'Present Day (0 Ma)' : `${cutoff.toLocaleString()} Ma • ${eraName}`;

    this.ctx.save();

    if (this.options.layoutMode === 'radial') {
      const rIso = myaToRadius(cutoff, 750);

      // Glowing outer halo
      this.ctx.beginPath();
      this.ctx.arc(0, 0, rIso, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.35})`;
      this.ctx.lineWidth = Math.max(2, 2.5 / this.camera.zoom);
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 14;
      this.ctx.setLineDash([8 / this.camera.zoom, 6 / this.camera.zoom]);
      this.ctx.stroke();

      // Solid hairline core
      this.ctx.beginPath();
      this.ctx.arc(0, 0, rIso, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.lineWidth = Math.max(1, 1.2 / this.camera.zoom);
      this.ctx.setLineDash([]);
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();

      // Isochrone Pill Badge at top
      if (this.camera.zoom > 0.3) {
        this.drawIsochroneBadge(0, -rIso, eraText);
      }
    } else {
      // Dendrogram vertical isochrone line
      const xIso = myaToX(cutoff, 1400);

      // Glowing line
      this.ctx.beginPath();
      this.ctx.moveTo(xIso, -2000);
      this.ctx.lineTo(xIso, 2000);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 + pulse * 0.35})`;
      this.ctx.lineWidth = Math.max(2, 2.5 / this.camera.zoom);
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 14;
      this.ctx.setLineDash([8 / this.camera.zoom, 6 / this.camera.zoom]);
      this.ctx.stroke();

      // Solid core
      this.ctx.beginPath();
      this.ctx.moveTo(xIso, -2000);
      this.ctx.lineTo(xIso, 2000);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.lineWidth = Math.max(1, 1.2 / this.camera.zoom);
      this.ctx.setLineDash([]);
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();

      // Isochrone Pill Badge at top
      if (this.camera.zoom > 0.3) {
        this.drawIsochroneBadge(xIso, -680, eraText);
      }
    }

    this.ctx.restore();
  }

  private drawIsochroneBadge(x: number, y: number, text: string): void {
    const fontSize = Math.max(10, 11 / this.camera.zoom);
    this.ctx.font = `700 ${fontSize}px 'Inter', sans-serif`;
    const textMetrics = this.ctx.measureText(text);
    const paddingX = 10 / this.camera.zoom;
    const paddingY = 5 / this.camera.zoom;
    const badgeW = textMetrics.width + paddingX * 2;
    const badgeH = fontSize + paddingY * 2;
    const rx = x - badgeW / 2;
    const ry = y - badgeH / 2;

    this.ctx.save();
    this.ctx.fillStyle = '#0284c7';
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.5 / this.camera.zoom;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 8;

    // Draw rounded rect
    const r = 4 / this.camera.zoom;
    this.ctx.beginPath();
    this.ctx.roundRect(rx, ry, badgeW, badgeH, r);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  private drawEdges(): void {
    const cutoff = this.options.timeCutoffMya ?? 0;
    const isTimeScrubbing = cutoff > 0;
    const isRadial = this.options.layoutMode === 'radial';
    const rIso = isRadial ? myaToRadius(cutoff, 750) : 0;
    const xIso = !isRadial ? myaToX(cutoff, 1400) : 0;

    // 1. Draw regular edges
    for (const edge of this.edges) {
      if (edge.isMRCAPath) continue; // Draw MRCA paths in second pass

      const srcMya = edge.source.divergenceMya ?? 0;
      const tgtMya = edge.target.divergenceMya ?? 0;

      if (!isTimeScrubbing) {
        // Normal mode (0 Ma / Present Day): all edges active
        this.ctx.beginPath();
        this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);

        if (isRadial) {
          this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, edge.pathPoints[2].x, edge.pathPoints[2].y);
        } else {
          this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
          this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
        }

        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        this.ctx.lineWidth = Math.max(1.2, 1.6 / this.camera.zoom);
        this.ctx.stroke();
      } else {
        // Time scrubbing mode
        if (srcMya < cutoff) {
          // Future edge (not diverged yet): ghosted
          this.ctx.beginPath();
          this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);
          if (isRadial) {
            this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, edge.pathPoints[2].x, edge.pathPoints[2].y);
          } else {
            this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
          }
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
          this.ctx.lineWidth = Math.max(0.8, 1.0 / this.camera.zoom);
          this.ctx.stroke();
        } else if (srcMya >= cutoff && tgtMya >= cutoff) {
          // Past edge (already fully diverged): active
          this.ctx.beginPath();
          this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);
          if (isRadial) {
            this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, edge.pathPoints[2].x, edge.pathPoints[2].y);
          } else {
            this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
          }
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
          this.ctx.lineWidth = Math.max(1.4, 1.8 / this.camera.zoom);
          this.ctx.stroke();
        } else {
          // Crossing edge (actively living lineage at epoch cutoff!)
          if (isRadial) {
            const tgtAngle = edge.target.angle || 0;
            const isoX = rIso * Math.cos(tgtAngle);
            const isoY = rIso * Math.sin(tgtAngle);

            // Active segment up to horizon
            this.ctx.beginPath();
            this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);
            this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, isoX, isoY);
            this.ctx.strokeStyle = edge.source.color || '#38bdf8';
            this.ctx.lineWidth = Math.max(1.8, 2.2 / this.camera.zoom);
            this.ctx.stroke();

            // Ghosted remaining segment to child
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(isoX, isoY);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
            this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
            this.ctx.setLineDash([4 / this.camera.zoom, 4 / this.camera.zoom]);
            this.ctx.lineWidth = Math.max(0.8, 1.0 / this.camera.zoom);
            this.ctx.stroke();
            this.ctx.restore();

            // Extant Horizon Node dot
            this.drawHorizonDot(isoX, isoY, edge.source.color);
          } else {
            const isoX = xIso;
            const isoY = edge.target.y;

            // Active segment up to horizon
            this.ctx.beginPath();
            this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);
            this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
            this.ctx.lineTo(isoX, isoY);
            this.ctx.strokeStyle = edge.source.color || '#38bdf8';
            this.ctx.lineWidth = Math.max(1.8, 2.2 / this.camera.zoom);
            this.ctx.stroke();

            // Ghosted remaining segment
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(isoX, isoY);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
            this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
            this.ctx.setLineDash([4 / this.camera.zoom, 4 / this.camera.zoom]);
            this.ctx.lineWidth = Math.max(0.8, 1.0 / this.camera.zoom);
            this.ctx.stroke();
            this.ctx.restore();

            // Extant Horizon Node dot
            this.drawHorizonDot(isoX, isoY, edge.source.color);
          }
        }
      }
    }

    // 2. Draw MRCA highlighted edges with glowing bioluminescent pulse
    const hasMRCA = this.edges.some(e => e.isMRCAPath);
    if (hasMRCA) {
      const pulse = 0.5 + 0.5 * Math.sin(this.mrcaPulsePhase);
      const glowWidth = 3 + pulse * 3;

      this.ctx.save();
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#f43f5e';
      this.ctx.strokeStyle = '#f43f5e';
      this.ctx.lineWidth = Math.max(3, glowWidth / this.camera.zoom);

      for (const edge of this.edges) {
        if (!edge.isMRCAPath) continue;

        const srcMya = edge.source.divergenceMya ?? 0;

        if (isTimeScrubbing && srcMya < cutoff) {
          // MRCA edge is in future: faint glow
          this.ctx.save();
          this.ctx.shadowBlur = 4;
          this.ctx.strokeStyle = 'rgba(244, 63, 94, 0.2)';
          this.ctx.beginPath();
          this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);
          if (isRadial) {
            this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, edge.pathPoints[2].x, edge.pathPoints[2].y);
          } else {
            this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
          }
          this.ctx.stroke();
          this.ctx.restore();
        } else {
          this.ctx.beginPath();
          this.ctx.moveTo(edge.pathPoints[0].x, edge.pathPoints[0].y);

          if (isRadial) {
            this.ctx.quadraticCurveTo(edge.pathPoints[1].x, edge.pathPoints[1].y, edge.pathPoints[2].x, edge.pathPoints[2].y);
          } else {
            this.ctx.lineTo(edge.pathPoints[1].x, edge.pathPoints[1].y);
            this.ctx.lineTo(edge.pathPoints[2].x, edge.pathPoints[2].y);
          }
          this.ctx.stroke();
        }
      }
      this.ctx.restore();
    }
  }

  private drawHorizonDot(x: number, y: number, color: string): void {
    const r = Math.max(3, 4 / this.camera.zoom);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, r + 2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 8;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = color || '#38bdf8';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = Math.max(1, 1.2 / this.camera.zoom);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawNodes(): void {
    const zoom = this.camera.zoom;
    const isHighZoom = zoom >= 1.2;
    const isMediumZoom = zoom >= 0.5;
    const cutoff = this.options.timeCutoffMya ?? 0;
    const isTimeScrubbing = cutoff > 0;

    for (const node of this.nodes) {
      const nodeMya = node.divergenceMya ?? 0;
      const isFuture = isTimeScrubbing && nodeMya < cutoff;
      const isSelected = this.options.selectedNodeId === node.id;
      const isHovered = this.options.hoveredNodeId === node.id;

      if (isFuture) {
        if (!isSelected && !isHovered) {
          // Render faint ghost dot for future nodes
          this.ctx.beginPath();
          this.ctx.arc(node.x, node.y, 2 / zoom, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
          this.ctx.fill();
          continue;
        }
      }

      // Dynamic Level of Detail (LoD)
      if (!isHighZoom && node.lodLevel === 3 && !node.isMRCAPath && !node.isHighlighted) {
        // Draw miniature dot at lower zooms
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, 2.5 / zoom, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color;
        this.ctx.fill();
        continue;
      }

      const isMRCA = node.isMRCANode;
      const isDelta = (node.isRecentlyUpdated || node.deltaStatus === 'new' || node.deltaStatus === 'modified') && (this.options.highlightRecentDeltas !== false);

      let radius = node.radius;
      if (isSelected || isHovered) radius += 3;
      if (isMRCA) radius += 4;
      if (isDelta && !isMRCA && !isSelected) radius += 1.5;

      // Draw Node Outer Halo / Glow (MRCA, Hover, or Delta Updates)
      if (isMRCA || isSelected || isHovered || isDelta) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius + (isMRCA ? 6 : (isDelta ? 5 : 4)), 0, Math.PI * 2);
        
        if (isMRCA) {
          this.ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#f43f5e';
        } else if (isDelta) {
          const deltaPulse = 0.5 + 0.5 * Math.sin(this.mrcaPulsePhase * 1.5);
          this.ctx.fillStyle = node.deltaStatus === 'new' ? `rgba(16, 185, 129, ${0.25 + deltaPulse * 0.25})` : `rgba(56, 189, 248, ${0.25 + deltaPulse * 0.25})`;
          this.ctx.shadowBlur = 12;
          this.ctx.shadowColor = node.deltaStatus === 'new' ? '#10b981' : '#38bdf8';
        } else {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = node.color;
        }

        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Node Circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = isMRCA ? '#f43f5e' : (isDelta && !isSelected ? (node.deltaStatus === 'new' ? '#10b981' : '#38bdf8') : node.color);
      this.ctx.strokeStyle = isDelta ? '#ffffff' : '#ffffff';
      this.ctx.lineWidth = isDelta ? 2 : 1.5;
      this.ctx.fill();
      this.ctx.stroke();

      // Delta sparkle badge
      if (isDelta && (isMediumZoom || isHovered || isSelected)) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(node.x - radius + 2, node.y - radius + 2, 3.5, 0, Math.PI * 2);
        this.ctx.fillStyle = node.deltaStatus === 'new' ? '#10b981' : '#38bdf8';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Extinction skull/marker badge
      if (node.isExtinct && this.options.showExtinctBadges && (isMediumZoom || isHovered || isSelected)) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(node.x + radius - 2, node.y - radius + 2, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Text Labels
      if (this.options.showLabels) {
        const isPriority = isSelected || isHovered || node.isMRCAPath || node.isMRCANode;
        let shouldShowLabel = isPriority;

        if (!shouldShowLabel) {
          if (node.isLeaf) {
            shouldShowLabel = isHighZoom || (isMediumZoom && node.lodLevel <= 2) || (zoom >= 0.7 && node.lodLevel <= 1);
          } else {
            // Internal divergence nodes: show when zoomed in or if major root at medium zoom
            shouldShowLabel = isHighZoom || (isMediumZoom && node.lodLevel === 0);
          }
        }

        if (shouldShowLabel) {
          this.drawNodeLabel(node, radius, isPriority);
        }
      }
    }
  }

  private drawNodeLabel(node: RenderNode, radius: number, isPriority: boolean): void {
    const isRadial = this.options.layoutMode === 'radial';
    this.ctx.save();

    let fontSize = isPriority ? 13 : (node.isLeaf ? 11 : 12);
    if (node.lodLevel === 0) fontSize = 14;

    this.ctx.font = `${isPriority || node.lodLevel <= 1 ? '700' : '500'} ${fontSize}px 'Inter', sans-serif`;

    if (isRadial) {
      const angle = node.angle || 0;
      const isRightSide = Math.cos(angle) >= 0;
      const distFromCenter = Math.hypot(node.x, node.y);

      this.ctx.translate(node.x, node.y);

      if (node.isLeaf) {
        this.ctx.rotate(angle);
        if (!isRightSide) {
          this.ctx.rotate(Math.PI);
          this.ctx.textAlign = 'right';
          this.ctx.translate(-radius - 8, 4);
        } else {
          this.ctx.textAlign = 'left';
          this.ctx.translate(radius + 8, 4);
        }
      } else {
        // Internal divergence node
        if (distFromCenter < 10) {
          // LUCA root at center: display above
          this.ctx.textAlign = 'center';
          this.ctx.translate(0, -radius - 8);
        } else {
          // Radiate label outward along node's branch angle to prevent overlap
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          this.ctx.textAlign = isRightSide ? 'left' : 'right';
          this.ctx.translate(cos * (radius + 8), sin * (radius + 8) + 3);
        }
      }
    } else {
      // Dendrogram labels
      this.ctx.translate(node.x, node.y);
      if (node.isLeaf) {
        this.ctx.textAlign = 'left';
        this.ctx.translate(radius + 8, 4);
      } else {
        this.ctx.textAlign = 'right';
        this.ctx.translate(-radius - 8, 4);
      }
    }

    // Label Text Shadow for readability
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    this.ctx.shadowBlur = 5;

    this.ctx.fillStyle = isPriority ? '#ffffff' : (node.isMRCAPath ? '#fda4af' : (node.isLeaf ? '#e2e8f0' : '#cbd5e1'));
    this.ctx.fillText(node.label, 0, 0);

    // Subtitle (Common Name or Divergence Age)
    if (node.subLabel && (isPriority || this.camera.zoom > 1.4)) {
      this.ctx.font = `400 9.5px 'Inter', sans-serif`;
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText(node.subLabel, 0, 13);
    }

    this.ctx.restore();
  }
}
