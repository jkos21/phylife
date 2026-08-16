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
    if (targetNodeId === 'div_carnivora_feliformia_caniformia' || targetNodeId === 'clade_feliformia' || targetNodeId === 'div_felidae' || targetNodeId === 'tax_panthera_leo') {
      // Expand Felidae / Feliformia sister taxa
      const felidTaxa: TaxonNode[] = [
        {
          id: 'tax_panthera_pardus',
          scientific_name: 'Panthera pardus',
          common_name: 'Leopard',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&auto=format&fit=crop&q=80',
          description: 'Adept tree-climbing big cat known for hauling heavy prey into high branches and opportunistic hunting.',
          temporal_range: 'Pleistocene - Present',
          traits: ['Arboreal strength', 'Rosette camouflage', 'High adaptability'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: 'tax_puma_concolor',
          scientific_name: 'Puma concolor',
          common_name: 'Cougar / Mountain Lion',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: false,
          thumbnail_url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600&auto=format&fit=crop&q=80',
          description: 'Solitary, secretive felid having the largest geographical range of any native land mammal in the Western Hemisphere.',
          temporal_range: 'Late Pliocene - Present',
          traits: ['Immense jumping vertical leap', 'Wide geographic range', 'Ambush predator'],
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
    } else if (targetNodeId === 'div_dinosauria_aves' || targetNodeId === 'div_dinosauria' || targetNodeId === 'div_theropoda' || targetNodeId === 'tax_tyrannosaurus' || targetNodeId === 'tax_velociraptor') {
      // Expand Theropoda & Ornithischia with exotic clades
      const dinoTaxa: TaxonNode[] = [
        {
          id: 'tax_therizinosaurus',
          scientific_name: 'Therizinosaurus cheloniformis',
          common_name: 'Therizinosaurus (Scythe-Clawed Giant)',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: true,
          extinction_era: 'Late Cretaceous (70 Ma)',
          temporal_range: '70 Ma',
          thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          description: 'Enormous 10-meter herbivorous theropod armed with giant 1-meter scythe-like hand claws, wide pot belly, and feathered coat.',
          traits: ['1-meter scythe hand claws', 'Herbivorous theropod transition', 'Pot-bellied plant fermenter'],
          parent_id: targetNodeId,
          delta_status: 'synced'
        },
        {
          id: 'tax_pachycephalosaurus',
          scientific_name: 'Pachycephalosaurus wyomingensis',
          common_name: 'Pachycephalosaurus (Dome-Headed Dinosaur)',
          rank: 'species',
          kingdom: 'Metazoa',
          extinct: true,
          extinction_era: 'Late Cretaceous (68 - 66 Ma)',
          temporal_range: '68 - 66 Ma',
          thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          description: 'Thick-skulled bipedal herbivore with a 25 cm solid bone dome skull roof and bony spikes around the snout and occiput.',
          traits: ['25 cm solid bone skull dome', 'Head-butting / flank-butting combat', 'Herbivorous/omnivorous diet'],
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

    // Record auditable transaction
    store.recordAudit({
      action: 'node_expanded',
      target_id: targetNodeId,
      actor: 'clade_expansion',
      details: `Expanded clade "${targetName}", grafting ${addedNodes.length} nodes and ${addedEdges.length} edges into the knowledge graph.`
    });

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
