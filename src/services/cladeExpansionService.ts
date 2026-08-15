import { PhyGraphStore } from '../graph/PhyGraphStore.ts';
import type { TaxonNode, DivergenceNode, BranchEdge } from '../graph/types.ts';
import { isTaxonNode } from '../graph/types.ts';

export interface ExpansionResult {
  cladeId: string;
  cladeName: string;
  nodesAddedCount: number;
  edgesAddedCount: number;
  addedNodeIds: string[];
}

export class CladeExpansionService {
  /**
   * Expands a dense clade or species node on-demand, fetching/generating its sister lineages and deep sub-taxa.
   */
  public expandClade(store: PhyGraphStore, targetNodeId: string): ExpansionResult {
    const target = store.getNode(targetNodeId);
    if (!target) {
      throw new Error(`Node ${targetNodeId} not found in graph store.`);
    }

    const addedNodes: (TaxonNode | DivergenceNode)[] = [];
    const addedEdges: BranchEdge[] = [];
    const targetName = isTaxonNode(target) ? target.scientific_name : target.name;

    // Check specific known clades to expand
    if (targetNodeId === 'div_carnivora_feliformia_caniformia' || targetNodeId === 'clade_feliformia' || targetNodeId === 'tax_panthera_leo') {
      // Expand Felidae / Feliformia sister taxa (Cheetah, Snow Leopard, Jaguar)
      const felidTaxa: TaxonNode[] = [
        {
          id: 'tax_acinonyx_jubatus',
          scientific_name: 'Acinonyx jubatus',
          common_name: 'Cheetah',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600&auto=format&fit=crop&q=80',
          description: 'Fastest land mammal on Earth, specializing in high-speed visual hunting with semi-retractile claws and flexible spine.',
          temporal_range: 'Late Pliocene - Present',
          traits: ['Semi-retractable claws', 'Enlarged nasal passages', 'High-speed flexible lumbar spine'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: 'tax_panthera_uncia',
          scientific_name: 'Panthera uncia',
          common_name: 'Snow Leopard',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=600&auto=format&fit=crop&q=80',
          description: 'High-altitude felid native to mountain ranges of Central and South Asia, adapted to rugged, freezing environments.',
          temporal_range: 'Pleistocene - Present',
          traits: ['Dense thick woolly fur', 'Wide paws acting as natural snowshoes', 'Long thick tail for balance'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: 'tax_panthera_onca',
          scientific_name: 'Panthera onca',
          common_name: 'Jaguar',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&auto=format&fit=crop&q=80',
          description: 'Largest cat species in the Americas with exceptionally powerful bite force capable of piercing turtle shells.',
          temporal_range: 'Early Pleistocene - Present',
          traits: ['Crushing bite force', 'Rosette camouflage coats', 'Adept swimmer'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        }
      ];

      for (const t of felidTaxa) {
        if (!store.getNode(t.id)) {
          addedNodes.push(t);
          addedEdges.push({
            id: `edge_${t.id}`,
            source_id: targetNodeId,
            target_id: t.id,
            branch_length_mya: 4.5,
            confidence_score: 0.98
          });
        }
      }
    } else if (targetNodeId === 'div_dinosauria_aves' || targetNodeId === 'div_dinosauria' || targetNodeId === 'tax_tyrannosaurus' || targetNodeId === 'tax_velociraptor') {
      // Expand Theropoda & Sauropoda
      const dinoTaxa: TaxonNode[] = [
        {
          id: 'tax_carnotaurus',
          scientific_name: 'Carnotaurus sastrei',
          common_name: 'Carnotaurus',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: true,
          extinction_era: 'Late Cretaceous (72 - 69.9 Ma)',
          temporal_range: '72 - 69.9 Ma',
          thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          description: 'Abelisaurid theropod with thick brow horns, extremely reduced forelimbs, and massive caudofemoralis leg muscles built for rapid sprinting.',
          traits: ['Frontal brow horns', 'Vestigial four-fingered forelimbs', 'Fast sprint stride'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: 'tax_ankylosaurus',
          scientific_name: 'Ankylosaurus magniventris',
          common_name: 'Ankylosaurus',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: true,
          extinction_era: 'Late Cretaceous (68 - 66 Ma)',
          temporal_range: '68 - 66 Ma',
          thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          description: 'Heavily armored herbivorous dinosaur bearing thick osteoderm plates, fused vertebrae armor, and a massive terminal tail club.',
          traits: ['Bone tail club', 'Fused dorsal osteoderms', 'Low-slung quadrupedal posture'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        }
      ];

      for (const t of dinoTaxa) {
        if (!store.getNode(t.id)) {
          addedNodes.push(t);
          addedEdges.push({
            id: `edge_${t.id}`,
            source_id: targetNodeId,
            target_id: t.id,
            branch_length_mya: 70.0,
            confidence_score: 0.95
          });
        }
      }
    } else if (targetNodeId.includes('plant') || target.kingdom === 'Viridiplantae') {
      // Expand Flora / Plantae
      const plantTaxa: TaxonNode[] = [
        {
          id: `tax_expanded_${targetNodeId}_fern`,
          scientific_name: 'Adiantum capillus-veneris',
          common_name: 'Maidenhair Fern',
          rank: 'species',
          kingdom: 'Viridiplantae',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
          description: 'Delicate leptosporangiate fern with fan-like leaf segments and creeping rhizomes thriving in damp rock crevices.',
          traits: ['Spore-bearing sori', 'Alternation of generations', 'Shade tolerance'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: `tax_expanded_${targetNodeId}_orchid`,
          scientific_name: 'Vanilla planifolia',
          common_name: 'Flat-leaved Vanilla Orchid',
          rank: 'species',
          kingdom: 'Viridiplantae',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
          description: 'Climbing epiphytic tropical orchid producing elongated seed pods containing natural vanillin.',
          traits: ['Aerial root clinging system', 'Zygomorphic specialized flowers', 'High vanillin concentration'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        }
      ];

      for (const t of plantTaxa) {
        if (!store.getNode(t.id)) {
          addedNodes.push(t);
          addedEdges.push({
            id: `edge_${t.id}`,
            source_id: targetNodeId,
            target_id: t.id,
            branch_length_mya: 120.0,
            confidence_score: 0.92
          });
        }
      }
    } else {
      // Generic high-order clade expansion
      const sisterTaxon: TaxonNode = {
        id: `tax_sister_${targetNodeId}_1`,
        scientific_name: `${targetName} Sister Clade A`,
        common_name: `Expanded Sister Taxon to ${targetName}`,
        rank: isTaxonNode(target) ? 'species' : 'genus',
        kingdom: target.kingdom || 'Metazoa',
        extinct: false,
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        description: `Dynamically resolved sibling taxon expanding the fine-grained resolution of clade ${targetName}.`,
        traits: ['On-demand synthesized lineage', 'Morphological sister clade'],
        parent_id: targetNodeId,
        delta_status: 'new',
        is_recently_updated: true
      };

      if (!store.getNode(sisterTaxon.id)) {
        addedNodes.push(sisterTaxon);
        addedEdges.push({
          id: `edge_${sisterTaxon.id}`,
          source_id: targetNodeId,
          target_id: sisterTaxon.id,
          branch_length_mya: 15.0,
          confidence_score: 0.9
        });
      }
    }

    // Insert into graph store
    for (const node of addedNodes) {
      store.addNode(node);
    }
    for (const edge of addedEdges) {
      store.addEdge(edge);
    }

    // Mark target as expanded
    (target as any).is_expanded = true;
    (target as any).can_expand = false;

    return {
      cladeId: targetNodeId,
      cladeName: targetName,
      nodesAddedCount: addedNodes.length,
      edgesAddedCount: addedEdges.length,
      addedNodeIds: addedNodes.map(n => n.id)
    };
  }
}

export const cladeExpansionService = new CladeExpansionService();
