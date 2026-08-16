import type { TaxonNode, DivergenceNode, BranchEdge, SynonymEdge } from '../graph/types.ts';

export interface SeedDataPayload {
  divergences: DivergenceNode[];
  taxa: TaxonNode[];
  edges: BranchEdge[];
  synonyms: SynonymEdge[];
}

export const SEED_DATA: SeedDataPayload = {
  divergences: [
    // --- LUCA & Deep Cellular Roots ---
    {
      id: 'div_luca',
      name: 'Last Universal Common Ancestor (LUCA)',
      common_name: 'Origin of Cellular Life',
      divergence_mya: 4200,
      confidence_interval: [4000, 4350],
      geological_era: 'Hadean',
      evolutionary_milestone: 'First self-replicating cellular entity with DNA, RNA, ribosomes, and ATP synthase.'
    },
    {
      id: 'div_archaea_eukarya',
      name: 'Archaea - Asgardarchaeota / Proto-Eukaryote Split',
      common_name: 'Ancestors of Complex Cells',
      divergence_mya: 2700,
      confidence_interval: [2500, 2900],
      geological_era: 'Archean',
      evolutionary_milestone: 'Emergence of Asgard archaea with proto-cytoskeletal elements and membrane remodeling capabilities.'
    },
    {
      id: 'div_eukaryogenesis',
      name: 'Eukaryogenesis (LECA)',
      common_name: 'Last Eukaryotic Common Ancestor',
      divergence_mya: 2100,
      confidence_interval: [1900, 2300],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Endosymbiosis of alphaproteobacterium giving rise to mitochondria and nucleus.'
    },
    {
      id: 'div_bacteria_major',
      name: 'Bacterial Crown Divergence',
      common_name: 'Radiation of Major Bacterial Phyla',
      divergence_mya: 3500,
      confidence_interval: [3300, 3700],
      geological_era: 'Archean',
      evolutionary_milestone: 'Divergence of Cyanobacteria (photosynthesis), Proteobacteria, and Firmicutes.'
    },

    // --- Domain Viridiplantae (Archaeplastida) ---
    {
      id: 'div_archaeplastida',
      name: 'Archaeplastida Primary Endosymbiosis',
      common_name: 'Origin of Plants and Algae',
      divergence_mya: 1600,
      confidence_interval: [1500, 1750],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Primary endosymbiosis of a cyanobacterium creating the first photosynthetic plastids/chloroplasts.'
    },
    {
      id: 'div_embryophyta',
      name: 'Embryophyta Land Plant Colonization',
      common_name: 'Colonization of Land by Plants',
      divergence_mya: 480,
      confidence_interval: [460, 505],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Cuticle, stomata, and alternation of generations enabling survival on terrestrial land.'
    },
    {
      id: 'div_tracheophyta',
      name: 'Tracheophyta (Vascular Plants)',
      common_name: 'Origin of Vascular Tissue',
      divergence_mya: 430,
      confidence_interval: [415, 445],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Lignified xylem and phloem enabling upright vertical growth and transport of water/nutrients.'
    },
    {
      id: 'div_spermatophyta',
      name: 'Spermatophyta (Seed Plants)',
      common_name: 'Origin of Seeds and Pollen',
      divergence_mya: 360,
      confidence_interval: [345, 375],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Evolution of seeds and pollen grains, freeing plant reproduction from standing water.'
    },
    {
      id: 'div_angiosperms',
      name: 'Angiospermae (Flowering Plants)',
      common_name: 'Origin of Flowers and Fruit',
      divergence_mya: 160,
      confidence_interval: [140, 180],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Flowers, double fertilization, and fruit encasing seeds for animal/wind dispersal.'
    },

    // --- Amorphea / Opisthokonta (Animals + Fungi) ---
    {
      id: 'div_opisthokonta',
      name: 'Opisthokonta Divergence',
      common_name: 'Split between Animalia and Fungi',
      divergence_mya: 1500,
      confidence_interval: [1400, 1600],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Posterior single flagellum and synthesis of chitin in cell walls / exoskeletons.'
    },

    // --- Fungi Clades ---
    {
      id: 'div_fungi_crown',
      name: 'Crown Fungi (Eumycota)',
      common_name: 'Radiation of True Fungi',
      divergence_mya: 1000,
      confidence_interval: [900, 1150],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Hyphal absorptive heterotrophy and specialized fungal spore dispersal mechanisms.'
    },
    {
      id: 'div_dikarya',
      name: 'Dikarya Subkingdom Split',
      common_name: 'Ascomycota & Basidiomycota Split',
      divergence_mya: 600,
      confidence_interval: [550, 680],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Dikaryotic stage (n+n) in life cycle and complex fruiting body (mushroom) evolution.'
    },

    // --- Metazoa (Animalia) Clades ---
    {
      id: 'div_metazoa_crown',
      name: 'Metazoan Crown Radiation',
      common_name: 'Origin of Multicellular Animals',
      divergence_mya: 800,
      confidence_interval: [750, 850],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Multicellularity, extracellular matrix (collagen), cell-cell adhesion, and nerve/muscle precursor genes.'
    },
    {
      id: 'div_eumetazoa',
      name: 'Eumetazoa (True Tissues)',
      common_name: 'Cnidaria & Bilateria Split',
      divergence_mya: 680,
      confidence_interval: [650, 720],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'True germ layers (diploblasty/triploblasty), gut cavity, and synaptic nervous systems.'
    },
    {
      id: 'div_bilateria',
      name: 'Bilateria (Cambrian Explosion Clade)',
      common_name: 'Protostome - Deuterostome Split',
      divergence_mya: 600,
      confidence_interval: [570, 630],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Bilateral symmetry, triploblastic development (endoderm, mesoderm, ectoderm), and cephalization.'
    },
    {
      id: 'div_protostomia',
      name: 'Protostomia Radiation',
      common_name: 'Ecdysozoa & Spiralia Split',
      divergence_mya: 560,
      confidence_interval: [540, 590],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Blastopore becomes mouth; divergence into molting animals (Arthropoda) and lophotrochozoans (Mollusca).'
    },
    {
      id: 'div_stem_arthropoda',
      name: 'Panarthropoda & Radiodonta Radiation',
      common_name: 'Origin of Arthropods & Anomalocaridids',
      divergence_mya: 525,
      confidence_interval: [515, 540],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Segmented exoskeletons, compound eyes, and specialized predatory appendages.'
    },
    {
      id: 'div_deuterostomia',
      name: 'Deuterostomia Radiation',
      common_name: 'Echinoderm & Chordate Split',
      divergence_mya: 560,
      confidence_interval: [540, 580],
      geological_era: 'Proterozoic',
      evolutionary_milestone: 'Blastopore becomes anus, radial cleavage, and enterocoelous coelom formation.'
    },
    {
      id: 'div_chordata_origin',
      name: 'Chordata Origin & Cranium Evolution',
      common_name: 'Vertebrate Precursors',
      divergence_mya: 535,
      confidence_interval: [520, 550],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Notochord, dorsal hollow nerve cord, pharyngeal slits, and post-anal tail.'
    },
    {
      id: 'div_gnathostomata',
      name: 'Gnathostomata (Jawed Vertebrates)',
      common_name: 'Chondrichthyes & Osteichthyes Split',
      divergence_mya: 465,
      confidence_interval: [450, 480],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Hinged jaws modified from gill arches and paired pelvic/pectoral fins.'
    },
    {
      id: 'div_selachimorpha',
      name: 'Chondrichthyes (Sharks & Rays)',
      common_name: 'Evolution of Apex Cartilaginous Fishes',
      divergence_mya: 420,
      confidence_interval: [400, 440],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Cartilaginous skeleton, placoid dermal denticles, and ampullae of Lorenzini electroreceptors.'
    },
    {
      id: 'div_tetrapoda',
      name: 'Tetrapoda Land Transition',
      common_name: 'Transition from Sarcopterygii to Tetrapods',
      divergence_mya: 385,
      confidence_interval: [375, 395],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Four-limbed locomotion, digits, lungs, and neck mobility enabling terrestrial invasion.'
    },
    {
      id: 'div_amniota',
      name: 'Amniota Divergence',
      common_name: 'Synapsid (Mammal-line) & Sauropsid (Reptile/Bird-line) Split',
      divergence_mya: 320,
      confidence_interval: [310, 335],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Amniotic egg with waterproof membranes (amnion, chorion, allantois) for dry-land incubation.'
    },
    {
      id: 'div_synapsida_stem',
      name: 'Synapsida (Stem Mammals / Pelycosaurs)',
      common_name: 'Sail-backed Synapsids & Therapsids',
      divergence_mya: 295,
      confidence_interval: [285, 305],
      geological_era: 'Paleozoic',
      evolutionary_milestone: 'Single lower temporal fenestra and differentiated dentition.'
    },

    // --- Sauropsida, Dinosaurs, Pterosaurs, Marine Reptiles & Birds ---
    {
      id: 'div_dinosauria_aves',
      name: 'Archosauria & Dinosauria Radiation',
      common_name: 'Origin of Dinosaurs and Birds',
      divergence_mya: 245,
      confidence_interval: [235, 255],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Erect gait, bipedal agility, proto-feathers, and efficient unidirectional air-sac respiration.'
    },
    {
      id: 'div_marine_reptiles',
      name: 'Mesozoic Marine Reptiles (Mosasaurs, Plesiosaurs, Ichthyosaurs)',
      common_name: 'Secondary Marine Invasion of Reptiles',
      divergence_mya: 240,
      confidence_interval: [230, 250],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Hydrodynamic flippers, viviparity, and specialized macro-predatory jaws.'
    },
    {
      id: 'div_pterosauria',
      name: 'Pterosauria (Winged Reptiles)',
      common_name: 'First Vertebrates to Evolve Powered Flight',
      divergence_mya: 228,
      confidence_interval: [220, 235],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Wing membranes supported by elongated fourth digit and hollow pneumatic bones.'
    },
    {
      id: 'div_theropoda',
      name: 'Theropoda (Bipedal Carnivorous Dinosaurs & Birds)',
      common_name: 'Theropod Dinosaurs',
      divergence_mya: 231,
      confidence_interval: [225, 238],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Hollow thin-walled bones, three-toed pes with sickle claws, and filamentous plumage.'
    },
    {
      id: 'div_tyrannosauroidea',
      name: 'Tyrannosauroidea (Tyrant Dinosaurs)',
      common_name: 'Tyrannosaurs & Apex Apex Predators',
      divergence_mya: 165,
      confidence_interval: [155, 175],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Fused nasal bones, massive crushing jaws with incisiform premaxillary teeth, and reduced forelimbs.'
    },
    {
      id: 'div_dromaeosauridae',
      name: 'Dromaeosauridae (Raptor Dinosaurs)',
      common_name: 'Feathered Sickle-clawed Raptors',
      divergence_mya: 145,
      confidence_interval: [135, 155],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Hyper-extensible second toe with giant sickle claw, ossified tail rods, and pennaceous wing feathers.'
    },
    {
      id: 'div_spinosauridae_carnosauria',
      name: 'Spinosauridae & Allosauroidea',
      common_name: 'Giant Sail-backed & Apex Carnosaurs',
      divergence_mya: 155,
      confidence_interval: [145, 165],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Elongated conical crocodile-like snouts, neural spine sails, and semi-aquatic adaptations.'
    },
    {
      id: 'div_sauropodomorpha',
      name: 'Sauropodomorpha (Long-necked Giants)',
      common_name: 'Colossal Herbivorous Dinosaurs',
      divergence_mya: 228,
      confidence_interval: [220, 235],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Elongated cervical vertebrae, pillar-like columnar limbs, and immense gigantism (up to 70+ tonnes).'
    },
    {
      id: 'div_ornithischia',
      name: 'Ornithischia (Beaked, Armored & Horned Dinosaurs)',
      common_name: 'Ceratopsians, Ankylosaurs & Stegosaurs',
      divergence_mya: 228,
      confidence_interval: [220, 235],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Predentary bone forming cropping beak, backward-pointing pubis, and defensive dermal armor/horns.'
    },
    {
      id: 'div_avialae_birds',
      name: 'Avialae & Crown Neornithes',
      common_name: 'Avian Dinosaurs & Modern Birds',
      divergence_mya: 150,
      confidence_interval: [145, 155],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Powered aerodynamic flight, pygostyle tail fusion, furcula (wishbone), and toothless keratinous beaks.'
    },

    // --- Mammalia & Cenozoic Radiations ---
    {
      id: 'div_mammalia_crown',
      name: 'Mammalia Crown Radiation',
      common_name: 'Monotreme, Marsupial & Placental Split',
      divergence_mya: 180,
      confidence_interval: [165, 195],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Mammary glands, three middle ear ossicles (malleus, incus, stapes), fur/hair, and endothermy.'
    },
    {
      id: 'div_placentalia_orders',
      name: 'Boreoeutheria & Placental Mammals',
      common_name: 'Placental Mammalian Diversification',
      divergence_mya: 95,
      confidence_interval: [88, 102],
      geological_era: 'Mesozoic',
      evolutionary_milestone: 'Placental reproduction giving birth to developed young and rapid post-K-Pg radiation.'
    },
    {
      id: 'div_carnivora_feliformia_caniformia',
      name: 'Carnivora (Cats, Dogs, Bears & Pinnipeds)',
      common_name: 'Cat-line and Dog-line Divergence',
      divergence_mya: 55,
      confidence_interval: [51, 59],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Specialized carnassial shear teeth (P4/M1) for hyper-carnivorous diet.'
    },
    {
      id: 'div_felidae',
      name: 'Felidae & Machairodontinae (Cats & Sabertooths)',
      common_name: 'Pantherines, Felines and Saber-toothed Predators',
      divergence_mya: 25,
      confidence_interval: [22, 28],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Retractile claws, binocular ambush vision, and elongated maxillary canines.'
    },
    {
      id: 'div_canidae_ursidae',
      name: 'Canidae & Ursidae (Dogs, Wolves & Bears)',
      common_name: 'Caniform Carnivores',
      divergence_mya: 42,
      confidence_interval: [38, 46],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Endurance cursorial hunting limbs and exceptional olfactory acuity.'
    },
    {
      id: 'div_cetacea',
      name: 'Cetacea (Whales & Dolphins)',
      common_name: 'Marine Mammal Evolution from Artiodactyls',
      divergence_mya: 52,
      confidence_interval: [48, 56],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Secondary marine adaptation with blowhole migration, loss of hindlimbs, echolocation, and baleen filtration.'
    },
    {
      id: 'div_proboscidea',
      name: 'Proboscidea (Elephants & Mammoths)',
      common_name: 'Trunked Mega-Herbivores',
      divergence_mya: 35,
      confidence_interval: [30, 40],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Prehensile muscular proboscis (trunk), columnar graviportal limbs, and elongated ivory incisor tusks.'
    },
    {
      id: 'div_hominidae_crown',
      name: 'Hominidae (Great Apes & Humans)',
      common_name: 'Chimpanzee - Human Last Common Ancestor (CHLCA)',
      divergence_mya: 6.8,
      confidence_interval: [6.0, 7.6],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Bipedal adaptation, enlarged neocortex, tool use, and complex vocal communication.'
    },
    {
      id: 'div_hominini',
      name: 'Hominini Lineage (Australopiths & Genus Homo)',
      common_name: 'Human Evolutionary Branch',
      divergence_mya: 4.2,
      confidence_interval: [3.8, 4.6],
      geological_era: 'Cenozoic',
      evolutionary_milestone: 'Obligate bipedalism, stone tool manufacture (Oldowan/Acheulean), fire control, and brain encephalization.'
    }
  ],

  taxa: [
    // ==========================================
    // DOMAIN: ARCHAEA
    // ==========================================
    {
      id: 'tax_archaea_phylum_euryarchaeota',
      scientific_name: 'Euryarchaeota',
      common_name: 'Methanogens & Extreme Halophiles',
      rank: 'phylum',
      kingdom: 'Archaea',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60',
      description: 'Major archaeal lineage encompassing methane producers and extreme salt-tolerant organisms.',
      temporal_range: '3.5 Ga - Present',
      traits: ['Ether-linked isoprenoid membrane lipids', 'Methanogenesis pathways', 'High osmolarity tolerance'],
      ott_id: 'ott_102931',
      gbif_key: '144'
    },
    {
      id: 'tax_methanocaldococcus',
      scientific_name: 'Methanocaldococcus jannaschii',
      common_name: 'Hydrothermal Vent Methanogen',
      rank: 'species',
      kingdom: 'Archaea',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=60',
      description: 'Extremely thermophilic methanogenic archaeon isolated from a deep-sea hydrothermal chimney at 2,600 meters depth.',
      temporal_range: 'Extant',
      habitat: 'Deep-sea hydrothermal vents (85°C)',
      traits: ['Strict autotroph', 'Hydrogen-oxidizing methanogen', 'Thermostable enzymes'],
      ott_id: 'ott_401923',
      gbif_key: '1000182'
    },
    {
      id: 'tax_halobacterium',
      scientific_name: 'Halobacterium salinarum',
      common_name: 'Extreme Halophilic Archaeon',
      rank: 'species',
      kingdom: 'Archaea',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60',
      description: 'Aerobic haloarchaeon that blooms in hypersaline salt lakes, utilizing bacteriorhodopsin light-driven proton pumps.',
      temporal_range: 'Extant',
      habitat: 'Salt evaporation pans, Dead Sea, Great Salt Lake',
      traits: ['Bacteriorhodopsin phototrophy', 'High-salt cytoplasmic adaptation', 'Purple membrane patches'],
      ott_id: 'ott_20912',
      gbif_key: '1000215'
    },
    {
      id: 'tax_lokiarchaeum',
      scientific_name: 'Lokiarchaeum ossiferum',
      common_name: 'Asgard Archaea (Eukaryote Ancestor)',
      rank: 'species',
      kingdom: 'Archaea',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      description: 'Cultivated Asgard archaeon with complex tentacle-like protrusions and actin-like cytoskeleton, bridging prokaryotes and eukaryotes.',
      temporal_range: 'Extant (Deep-sea sediment relic)',
      habitat: 'Arctic hydrothermal marine sediments (Loki\'s Castle)',
      traits: ['Eukaryotic signature proteins (ESPs)', 'Complex branching appendages', 'Actin cytoskeleton homology'],
      ott_id: 'ott_991823'
    },

    // ==========================================
    // DOMAIN: BACTERIA
    // ==========================================
    {
      id: 'tax_cyanobacteria',
      scientific_name: 'Cyanobacteria',
      common_name: 'Blue-Green Algae (Oxygen Producers)',
      rank: 'phylum',
      kingdom: 'Bacteria',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=60',
      description: 'Pioneered oxygenic photosynthesis over 2.4 billion years ago, driving the Great Oxidation Event and creating modern Earth atmosphere.',
      temporal_range: '2.7 Ga - Present',
      traits: ['Oxygenic photosynthesis (Photosystems I & II)', 'Chlorophyll a synthesis', 'Ancestors of plant chloroplasts'],
      ott_id: 'ott_52910',
      gbif_key: '68'
    },
    {
      id: 'tax_microcystis',
      scientific_name: 'Microcystis aeruginosa',
      common_name: 'Freshwater Cyanobacterium',
      rank: 'species',
      kingdom: 'Bacteria',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=60',
      description: 'Colony-forming freshwater cyanobacterium known for producing gas vesicles for buoyancy and microcystin peptides.',
      temporal_range: 'Extant',
      ott_id: 'ott_108291',
      gbif_key: '3216853'
    },
    {
      id: 'tax_escherichia_coli',
      scientific_name: 'Escherichia coli',
      common_name: 'E. coli Model Bacterium',
      rank: 'species',
      kingdom: 'Bacteria',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1583912267670-6575ad4736f8?w=500&auto=format&fit=crop&q=60',
      description: 'Gram-negative rod-shaped gammaproteobacterium essential to mammalian gut microbiota and the premier model organism in molecular biology.',
      temporal_range: 'Extant',
      habitat: 'Lower intestine of warm-blooded organisms',
      traits: ['Facultative anaerobe', 'Rapid 20-minute binary fission', 'Plasmid horizontal gene transfer model'],
      ott_id: 'ott_562',
      gbif_key: '2435098'
    },
    {
      id: 'tax_streptomyces',
      scientific_name: 'Streptomyces coelicolor',
      common_name: 'Soil Actinobacterium (Antibiotic Producer)',
      rank: 'species',
      kingdom: 'Bacteria',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&auto=format&fit=crop&q=60',
      description: 'Gram-positive filamentous soil bacterium renowned for complex mycelial development and producing over two-thirds of natural antibiotics.',
      temporal_range: 'Extant',
      traits: ['Secondary metabolite / antibiotic synthesis', 'Complex mycelial life cycle', 'High G+C content linear chromosome'],
      ott_id: 'ott_718290',
      gbif_key: '3224749'
    },

    // ==========================================
    // DOMAIN: PROTISTA
    // ==========================================
    {
      id: 'tax_dictyostelium',
      scientific_name: 'Dictyostelium discoideum',
      common_name: 'Cellular Slime Mold',
      rank: 'species',
      kingdom: 'Protista',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      description: 'Soil-living amoeba that undergoes facultative multicellular development, transitioning from solitary cells to fruiting slugs upon starvation.',
      temporal_range: 'Extant',
      traits: ['cAMP-directed chemotactic aggregation', 'Altruistic stalk cell differentiation', 'Model for cell differentiation'],
      ott_id: 'ott_319082',
      gbif_key: '3213192'
    },
    {
      id: 'tax_paramecium',
      scientific_name: 'Paramecium aurelia',
      common_name: 'Ciliated Protozoan',
      rank: 'species',
      kingdom: 'Protista',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      description: 'Single-celled ciliated freshwater protist with pellicular surface cilia, contractile vacuoles, and nuclear dualism (macro/micronuclei).',
      temporal_range: 'Extant',
      traits: ['Coordinated ciliary propulsion', 'Nuclear dualism', 'Trichocyst defensive discharge'],
      ott_id: 'ott_58190',
      gbif_key: '3204365'
    },

    // ==========================================
    // KINGDOM: VIRIDIPLANTAE (PLANTS)
    // ==========================================
    {
      id: 'tax_chlorophyta',
      scientific_name: 'Chlamydomonas reinhardtii',
      common_name: 'Unicellular Green Alga',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=60',
      description: 'Biflagellated single-celled green alga containing a cup-shaped chloroplast and eyespot for phototaxis.',
      temporal_range: 'Extant',
      ott_id: 'ott_90182'
    },
    {
      id: 'tax_sphagnum',
      scientific_name: 'Sphagnum magellanicum',
      common_name: 'Magellanic Peat Moss (Bryophyte)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60',
      description: 'Non-vascular bryophyte capable of retaining up to 26 times its dry weight in water, dominating high-latitude carbon-sink peat bogs.',
      temporal_range: 'Extant',
      traits: ['Hygroscopic dead hyaline cells', 'Acidifying cation exchange', 'Massive global carbon storage'],
      ott_id: 'ott_12903',
      gbif_key: '2669041'
    },
    {
      id: 'tax_cooksonia',
      scientific_name: 'Cooksonia caledonica',
      common_name: 'Earliest Land Vascular Plant (Extinct)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: true,
      extinction_era: 'Silurian - Early Devonian (433 - 393 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60',
      description: 'Primitive leafless dichotomously branching vascular land plant bearing terminal sporangia, representing the earliest upright land flora.',
      temporal_range: '433 - 393 Ma (Extinct)',
      traits: ['Dichotomous branching', 'Terminal sporangia', 'Simple central tracheids'],
      ott_id: 'ott_918234'
    },
    {
      id: 'tax_ginkgo',
      scientific_name: 'Ginkgo biloba',
      common_name: 'Maidenhair Tree (Living Fossil)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=500&auto=format&fit=crop&q=60',
      description: 'Sole surviving member of the order Ginkgoales, virtually unchanged since the Jurassic period (~170 Ma) with fan-shaped leaves and motile sperm.',
      temporal_range: 'Early Jurassic - Present (Living Fossil)',
      traits: ['Fan-shaped dichotomous venation', 'Dioecious with motile sperm cells', 'Exceptional pollution and pathogen resistance'],
      ott_id: 'ott_70192',
      gbif_key: '2687885'
    },
    {
      id: 'tax_sequoiadendron',
      scientific_name: 'Sequoiadendron giganteum',
      common_name: 'Giant Sequoia (Gymnosperm)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=60',
      description: 'Massive coniferous gymnosperm native to California Sierra Nevada, holding the record for the largest single trees by volume on Earth.',
      temporal_range: 'Extant',
      ott_id: 'ott_40192'
    },
    {
      id: 'tax_arabidopsis',
      scientific_name: 'Arabidopsis thaliana',
      common_name: 'Thale Cress (Model Angiosperm)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=60',
      description: 'Small flowering mustard plant with a compact 135 Mb genome, serving as the universal reference organism for plant genetics and development.',
      temporal_range: 'Extant',
      traits: ['Rapid 6-week life cycle', 'Compact sequenced genome', 'Self-pollinating flowers'],
      ott_id: 'ott_3702',
      gbif_key: '3042578'
    },
    {
      id: 'tax_oryza_sativa',
      scientific_name: 'Oryza sativa',
      common_name: 'Asian Rice (Monocot Angiosperm)',
      rank: 'species',
      kingdom: 'Viridiplantae',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&auto=format&fit=crop&q=60',
      description: 'Cereal grass domesticated in China 9,000 years ago that provides the primary staple dietary caloric intake for more than half of the human population.',
      temporal_range: 'Holocene Domesticated - Present',
      traits: ['Paddy-adapted submerged aerenchyma', 'C3 photosynthetic grass', 'Global staple crop'],
      ott_id: 'ott_4530',
      gbif_key: '2703487'
    },

    // ==========================================
    // KINGDOM: FUNGI
    // ==========================================
    {
      id: 'tax_saccharomyces',
      scientific_name: 'Saccharomyces cerevisiae',
      common_name: 'Baker\'s / Brewer\'s Yeast',
      rank: 'species',
      kingdom: 'Fungi',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      description: 'Single-celled budding ascomycete fungus driving ethanol and CO2 fermentation in bread and brewing, and the foremost eukaryotic model organism.',
      temporal_range: 'Extant',
      ott_id: 'ott_4932',
      gbif_key: '2599480'
    },
    {
      id: 'tax_penicillium',
      scientific_name: 'Penicillium chrysogenum',
      common_name: 'Penicillin-Producing Mold',
      rank: 'species',
      kingdom: 'Fungi',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&auto=format&fit=crop&q=60',
      description: 'Filamentous ascomycete fungus discovered by Alexander Fleming in 1928, responsible for the initial commercial biosynthesis of penicillin antibiotics.',
      temporal_range: 'Extant',
      traits: ['Beta-lactam penicillin biosynthesis', 'Conidiophore brush spore structures', 'Saprophytic soil degradation'],
      ott_id: 'ott_5076',
      gbif_key: '2560481'
    },
    {
      id: 'tax_amanita_muscaria',
      scientific_name: 'Amanita muscaria',
      common_name: 'Fly Agaric (Basidiomycete)',
      rank: 'species',
      kingdom: 'Fungi',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=60',
      description: 'Iconic scarlet-capped mushroom with white warts forming ectomycorrhizal symbioses with birch and pine trees.',
      temporal_range: 'Extant',
      traits: ['Ectomycorrhizal root sheath symbiosis', 'Muscimol & ibotenic acid synthesis', 'Classic basidiocarp fruiting body'],
      ott_id: 'ott_41950',
      gbif_key: '5240248'
    },
    {
      id: 'tax_cantharellus',
      scientific_name: 'Cantharellus cibarius',
      common_name: 'Golden Chanterelle',
      rank: 'species',
      kingdom: 'Fungi',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=500&auto=format&fit=crop&q=60',
      description: 'Prized edible funnel-shaped mycorrhizal basidiomycete possessing gill-like gill folds and rich apricot aroma.',
      temporal_range: 'Extant',
      ott_id: 'ott_36058',
      gbif_key: '5249567'
    },

    // ==========================================
    // KINGDOM: METAZOA (ANIMALS)
    // ==========================================

    // --- Basal Metazoans & Cnidarians ---
    {
      id: 'tax_euspongia',
      scientific_name: 'Spongia officinalis',
      common_name: 'Bath Sponge (Porifera)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'Basal marine sponge lacking true tissues, filtering water through spongin fibers and choanocyte collar cells.',
      temporal_range: 'Cryogenian - Present',
      traits: ['Spongin fiber skeleton', 'Choanocyte flagellar water pumping', 'Totipotent archaeocytes'],
      ott_id: 'ott_10291',
      gbif_key: '2247447'
    },
    {
      id: 'tax_aurelia',
      scientific_name: 'Aurelia aurita',
      common_name: 'Moon Jellyfish (Cnidaria)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'Translucent diploblastic scyphozoan jellyfish featuring radial symmetry, rhopalia sensory pits, and cnidocyte stinging capsules.',
      temporal_range: 'Ediacaran - Present',
      traits: ['Cnidocyte nematocyst harpoons', 'Diffuse synaptic nerve net', 'Metagenesis (polyp to medusa)'],
      ott_id: 'ott_61902',
      gbif_key: '2268800'
    },

    // --- Protostomes, Paleozoic Megafauna & Arthropods ---
    {
      id: 'tax_anomalocaris',
      scientific_name: 'Anomalocaris canadensis',
      common_name: 'Anomalocaris (Cambrian Apex Predator)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Middle Cambrian (~508 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'Meter-long Burgess Shale stem-arthropod with giant compound eyes, spiny frontal grasping appendages, and circular pineapple-ring mouth.',
      temporal_range: '514 - 505 Ma (Extinct)',
      traits: ['Giant acute compound eyes (16,000 lenses)', 'Segmented spiny frontal claws', 'Lateral swimming lobes'],
      ott_id: 'ott_981204'
    },
    {
      id: 'tax_opabinia',
      scientific_name: 'Opabinia regalis',
      common_name: 'Opabinia (Five-eyed Stem Arthropod)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Middle Cambrian (~505 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'Enigmatic Burgess Shale soft-bodied stem arthropod bearing five stalked compound eyes and a flexible frontal clawed proboscis.',
      temporal_range: '505 Ma (Extinct)',
      traits: ['Five stalked eyes', 'Frontal grasping proboscis', 'Lateral swimming flaps'],
      ott_id: 'ott_981205'
    },
    {
      id: 'tax_trilobite',
      scientific_name: 'Paradoxides davidis',
      common_name: 'Giant Cambrian Trilobite (Extinct)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Middle Cambrian (~505 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Iconic 35 cm long Cambrian marine trilobite arthropod with calcite crystal compound eyes and multi-segmented dorsal exoskeleton.',
      temporal_range: '505 - 500 Ma (Extinct)',
      traits: ['Calcite crystal compound eyes', 'Three-lobed calcified dorsal shield', 'Multiple biramous swimming appendages'],
      ott_id: 'ott_81920'
    },
    {
      id: 'tax_jaekelopterus',
      scientific_name: 'Jaekelopterus rhenaniae',
      common_name: 'Giant Sea Scorpion (2.5 Meter Eurypterid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Devonian (393 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'The largest known arthropod ever discovered, reaching 2.5 meters in length with formidable 46 cm cheliceral pincers.',
      temporal_range: '400 - 393 Ma (Extinct)',
      traits: ['Enormous 2.5m body length', 'Enlarged cheliceral strike pincers', 'Aquatic paddle appendages'],
      ott_id: 'ott_981206'
    },
    {
      id: 'tax_meganeura',
      scientific_name: 'Meganeura monyi',
      common_name: 'Giant Carboniferous Griffinfly (75 cm Wingspan)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Carboniferous (~305 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
      description: 'Giant predatory dragonfly-like insect with a 75 cm wingspan that thrived in the hyper-oxygenated (35% O2) atmosphere of Carboniferous coal swamps.',
      temporal_range: '305 - 299 Ma (Extinct)',
      traits: ['75 cm wingspan', 'High-speed aerial pursuit predator', 'Adapted to 35% atmospheric oxygen'],
      ott_id: 'ott_981207'
    },
    {
      id: 'tax_drosophila',
      scientific_name: 'Drosophila melanogaster',
      common_name: 'Fruit Fly (Model Organism)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
      description: 'Dipteran insect that is the cornerstone model organism for genetics, chromosome inheritance, and embryological Hox gene patterning.',
      temporal_range: 'Extant',
      ott_id: 'ott_7227',
      gbif_key: '5053073'
    },
    {
      id: 'tax_octopus',
      scientific_name: 'Octopus vulgaris',
      common_name: 'Common Octopus (Mollusca)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=500&auto=format&fit=crop&q=60',
      description: 'Cephalopod mollusc demonstrating extraordinary decentralized intelligence, chromatophore skin camouflage, and flexible tentacular manipulation.',
      temporal_range: 'Extant',
      traits: ['Decentralized 500-million neuron nervous system', 'Dynamic chromatophore camouflage', 'Independent sensory-motor arm autonomy'],
      ott_id: 'ott_6645',
      gbif_key: '2289297'
    },

    // --- Fishes & Sharks ---
    {
      id: 'tax_megalodon',
      scientific_name: 'Otodus megalodon',
      common_name: 'Megalodon (Giant Extinct Apex Shark)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Pliocene Extinction (~3.6 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=500&auto=format&fit=crop&q=60',
      description: 'Colossal 16-meter lamniform shark with 18 cm serrated teeth exerting over 180,000 Newtons of bite force on marine mammals and whales.',
      temporal_range: '23 - 3.6 Ma (Extinct)',
      traits: ['16-meter body length', 'Serrated 18 cm cutting teeth', 'Cosmopolitan cetacean hunter'],
      ott_id: 'ott_981208'
    },
    {
      id: 'tax_carcharodon',
      scientific_name: 'Carcharodon carcharias',
      common_name: 'Great White Shark',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=500&auto=format&fit=crop&q=60',
      description: 'Apex lamnid shark of temperate coastal waters, utilizing regional endothermy and ampullae of Lorenzini electroreceptors to hunt seals and tuna.',
      temporal_range: 'Miocene - Present',
      traits: ['Regional endothermic rete mirabile', 'Triangular serrated teeth', 'Telescopic breaching attack speed'],
      ott_id: 'ott_13902',
      gbif_key: '2420701'
    },
    {
      id: 'tax_rhincodon',
      scientific_name: 'Rhincodon typus',
      common_name: 'Whale Shark (Largest Living Fish)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=500&auto=format&fit=crop&q=60',
      description: 'Docile filter-feeding carpet shark growing up to 18 meters, filtering plankton and small nekton through specialized gill filter pads.',
      temporal_range: 'Extant (Endangered)',
      ott_id: 'ott_13903',
      gbif_key: '2420702'
    },
    {
      id: 'tax_danio',
      scientific_name: 'Danio rerio',
      common_name: 'Zebrafish',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=500&auto=format&fit=crop&q=60',
      description: 'Tropical freshwater ray-finned fish noted for transparent embryos, regenerative capabilities, and extensive use in biomedical research.',
      temporal_range: 'Extant',
      ott_id: 'ott_90192',
      gbif_key: '2410885'
    },
    {
      id: 'tax_axolotl',
      scientific_name: 'Ambystoma mexicanum',
      common_name: 'Axolotl (Mexican Walking Fish)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=500&auto=format&fit=crop&q=60',
      description: 'Neotenic salamander that retains its aquatic larval form with external feathery gills into adulthood and can regenerate complete limbs and heart tissue.',
      temporal_range: 'Extant (Critically Endangered)',
      ott_id: 'ott_71829',
      gbif_key: '2431980'
    },

    // --- Stem Synapsids ---
    {
      id: 'tax_dimetrodon',
      scientific_name: 'Dimetrodon grandis',
      common_name: 'Dimetrodon (Permian Sail-backed Synapsid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Permian (272 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Apex Permian synapsid closely related to the mammalian stem lineage, featuring a prominent neural spine dorsal sail for thermoregulation.',
      temporal_range: '295 - 272 Ma (Extinct)',
      traits: ['Vascular neural spine sail', 'Two measures of differentiated teeth (synapsid precursor)', 'Sprawling robust terrestrial gait'],
      ott_id: 'ott_981209'
    },

    // ==========================================
    // SAUROPSIDA: DINOSAURS & EXTINCT ARCHOSAURS
    // ==========================================

    // --- Tyrannosauroids (Dense Clade Drill-Down) ---
    {
      id: 'tax_tyrannosaurus',
      scientific_name: 'Tyrannosaurus rex',
      common_name: 'T-Rex (King of Tyrant Dinosaurs)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous K-Pg Extinction (66 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Massive 12-meter bipedal theropod dinosaur with crushing bone-shearing bite force exceeding 35,000 N, binocular vision, and acute olfaction.',
      temporal_range: '68 - 66 Ma (Extinct)',
      habitat: 'Floodplains and subtropical forests of Laramidia (North America)',
      traits: ['35,000 N bone-crushing bite', 'Binocular 55-degree depth vision', 'Fused rugose nasal bridge'],
      ott_id: 'ott_819201'
    },
    {
      id: 'tax_tarbosaurus',
      scientific_name: 'Tarbosaurus bataar',
      common_name: 'Tarbosaurus (Asian Giant Tyrannosaurid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (70 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Apex predator of Late Cretaceous Mongolia (Nemegt Formation), sister taxon to T. rex with rigid locking lower jaw mechanism for hunting sauropods.',
      temporal_range: '70 - 66 Ma (Extinct)',
      habitat: 'River channels and floodplains of the Nemegt Basin, Mongolia',
      traits: ['Rigid locking mandibular symphysis', 'Sauropod specialist predator', 'Extremely reduced two-clawed forelimbs'],
      ott_id: 'ott_981210'
    },
    {
      id: 'tax_albertosaurus',
      scientific_name: 'Albertosaurus sarcophagus',
      common_name: 'Albertosaurus (Slender Fast Pack Tyrannosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (71 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Agile 9-meter albertosaurine tyrannosaurid from Alberta, Canada, with long cursorial leg proportions and mass bonebed evidence of pack hunting.',
      temporal_range: '71 - 68 Ma (Extinct)',
      habitat: 'Horseshoe Canyon coastal plains, Alberta',
      traits: ['High cursorial running speed (30+ km/h)', 'Pack hunting bonebed association', 'Slender albertosaurine skull'],
      ott_id: 'ott_981211'
    },
    {
      id: 'tax_gorgosaurus',
      scientific_name: 'Gorgosaurus libratus',
      common_name: 'Gorgosaurus (Fierce Lizard)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (76.6 - 75.1 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Laramidian tyrannosaurid known from numerous pristine fossils in Dinosaur Provincial Park with preserved juvenile stomach contents.',
      temporal_range: '76.6 - 75.1 Ma (Extinct)',
      traits: ['Juvenile prey niche partitioning', 'Elongated lower leg elements', 'Serrated recurved teeth'],
      ott_id: 'ott_981212'
    },
    {
      id: 'tax_daspletosaurus',
      scientific_name: 'Daspletosaurus torosus',
      common_name: 'Daspletosaurus (Heavy-Built Tyrannosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (77 - 74 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Robust, thick-skulled tyrannosaurine that coexisted with Gorgosaurus, specializing in armored ceratopsian and hadrosaur prey.',
      temporal_range: '77 - 74 Ma (Extinct)',
      traits: ['Heavy bone-crushing skull', 'Ceratopsian hunter specialist', 'Large postorbital horns'],
      ott_id: 'ott_981213'
    },
    {
      id: 'tax_yutyrannus',
      scientific_name: 'Yutyrannus huali',
      common_name: 'Yutyrannus (Feathered Tyrant Giant)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Cretaceous (125 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: '9-meter 1.4-tonne early tyrannosauroid from Liaoning, China, preserving extensive direct fossil proof of dense filamentous plumage.',
      temporal_range: '125 Ma (Extinct)',
      habitat: 'Volcanic temperate forests of the Yixian Formation, China',
      traits: ['Dense filamentous feather coat (20 cm)', 'Three-fingered functional manus', 'Mid-line cranial crest'],
      ott_id: 'ott_981214'
    },
    {
      id: 'tax_dilong',
      scientific_name: 'Dilong paradoxus',
      common_name: 'Dilong (Emperor Dragon)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Cretaceous (126 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Small 1.6-meter basal tyrannosauroid from the Yixian Formation possessing proto-feathers and three-fingered hands.',
      temporal_range: '126 Ma (Extinct)',
      traits: ['Proto-feather filament coat', 'Basal small-bodied morphology', 'Three grasping digits'],
      ott_id: 'ott_981215'
    },
    {
      id: 'tax_guanlong',
      scientific_name: 'Guanlong wucaii',
      common_name: 'Guanlong (Crested Primitive Tyrannosauroid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (160 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: '3-meter proceratosaurid tyrannosauroid from the Shishugou Formation bearing a delicate, hollow pneumatic cranial display crest.',
      temporal_range: '160 Ma (Extinct)',
      traits: ['Hollow display nasal crest', 'Three-clawed predatory forelimbs', 'Early Jurassic tyrannosauroid ancestor'],
      ott_id: 'ott_981216'
    },
    {
      id: 'tax_nanuqsaurus',
      scientific_name: 'Nanuqsaurus hoglundi',
      common_name: 'Nanuqsaurus (Arctic Dwarf Tyrannosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (69 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Diminutive 5-meter tyrannosaurid adapted to polar dark winters and seasonal resource scarcity in the Prince Creek Formation of Alaska.',
      temporal_range: '69 - 68 Ma (Extinct)',
      traits: ['Insular/polar dwarfism adaptation', 'Thick insulating feather coat', 'Expanded olfactory acuity'],
      ott_id: 'ott_981217'
    },
    {
      id: 'tax_alioramus',
      scientific_name: 'Alioramus remotus',
      common_name: 'Alioramus (Long-Snouted Tyrannosaurid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (70 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=500&auto=format&fit=crop&q=60',
      description: 'Slender, long-snouted alioramin tyrannosaurid with a row of five bony hornlets along the top of its snout, built for catching fast agile prey.',
      temporal_range: '70 Ma (Extinct)',
      traits: ['Elongated narrow snout with 76+ teeth', 'Five nasal cranial hornlets', 'Lightweight gracile pursuit build'],
      ott_id: 'ott_981218'
    },

    // --- Dromaeosauridae (Raptors) ---
    {
      id: 'tax_velociraptor',
      scientific_name: 'Velociraptor mongoliensis',
      common_name: 'Velociraptor (Swift Desert Hunter)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (75 - 71 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Turkey-sized feathered dromaeosaurid armed with an 8 cm hyper-extensible sickle claw on each foot, quill knobs on ulna for flight feathers, and pack coordination.',
      temporal_range: '75 - 71 Ma (Extinct)',
      habitat: 'Sand dunes and arid oasis of the Djadochta Formation, Gobi Desert',
      traits: ['8 cm killing sickle claw', 'Ulnar quill knobs for flight-grade plumage', 'Stiffened rod-like balancing tail'],
      ott_id: 'ott_981219'
    },
    {
      id: 'tax_deinonychus',
      scientific_name: 'Deinonychus antirrhopus',
      common_name: 'Deinonychus (Terrible Claw)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Cretaceous (115 - 108 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: '3.4-meter dromaeosaur whose 1969 discovery sparked the "Dinosaur Renaissance" by demonstrating high metabolism, active agility, and bird ancestry.',
      temporal_range: '115 - 108 Ma (Extinct)',
      traits: ['13 cm sickle claw', 'Triggered the Dinosaur Renaissance', 'Pack hunting of Tenontosaurus'],
      ott_id: 'ott_981220'
    },
    {
      id: 'tax_utahraptor',
      scientific_name: 'Utahraptor ostrommaysi',
      common_name: 'Utahraptor (Colossal 7-Meter Apex Raptor)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Cretaceous (135 - 130 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'The largest known dromaeosaurid, measuring 7 meters and weighing 500 kg, armed with a devastating 24 cm sickle claw built for disemboweling iguanodonts.',
      temporal_range: '135 - 130 Ma (Extinct)',
      traits: ['Massive 7-meter body length', '24 cm sickle foot claw', 'Heavy-boned muscular predator'],
      ott_id: 'ott_981221'
    },
    {
      id: 'tax_microraptor',
      scientific_name: 'Microraptor gui',
      common_name: 'Microraptor (Four-Winged Gliding Raptor)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Cretaceous (120 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Small arboreal dromaeosaur with iridescent black plumage and aerodynamic flight feathers on all four limbs, demonstrating early biplane gliding.',
      temporal_range: '120 Ma (Extinct)',
      traits: ['Four-winged biplane plumage', 'Iridescent glossy black melanosomes', 'Arboreal glider'],
      ott_id: 'ott_981222'
    },

    // --- Spinosauridae & Carnosauria ---
    {
      id: 'tax_spinosaurus',
      scientific_name: 'Spinosaurus aegyptiacus',
      common_name: 'Spinosaurus (Semi-Aquatic River Giant)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (99 - 93.5 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: '14-meter semi-aquatic theropod with a 1.8-meter dorsal sail, paddle-like finned tail, dense osteosclerotic bones, and crocodile-like fish-snagging snout.',
      temporal_range: '99 - 93.5 Ma (Extinct)',
      habitat: 'Vast river and mangrove systems of the Kem Kem Group, North Africa',
      traits: ['1.8-meter dorsal sail', 'Fin-like paddle propulsion tail', 'Osteosclerotic bone ballast for diving'],
      ott_id: 'ott_981223'
    },
    {
      id: 'tax_allosaurus',
      scientific_name: 'Allosaurus fragilis',
      common_name: 'Allosaurus (Jurassic Apex Carnosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (155 - 145 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'The dominant apex theropod of the Morrison Formation, hunting with wide 92-degree jaw gape, slashing axe-like bite mechanics, and three large hand claws.',
      temporal_range: '155 - 145 Ma (Extinct)',
      traits: ['Hatchet-like slashing jaw strike', 'Three-clawed muscular grasping arms', 'Lacrimal cranial brow crests'],
      ott_id: 'ott_981224'
    },
    {
      id: 'tax_carnotaurus',
      scientific_name: 'Carnotaurus sastrei',
      common_name: 'Carnotaurus (Meat-Eating Bull)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (72 - 69.9 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Abelisaurid theropod with thick frontal brow horns, vestigial four-fingered forelimbs, and massive caudofemoralis leg muscles built for rapid sprinting.',
      temporal_range: '72 - 69.9 Ma (Extinct)',
      traits: ['Frontal brow horns', 'Vestigial four-fingered forelimbs', 'Fast sprint stride'],
      ott_id: 'ott_981225'
    },

    // --- Sauropodomorpha (Long-Necked Giants) ---
    {
      id: 'tax_brachiosaurus',
      scientific_name: 'Brachiosaurus altithorax',
      common_name: 'Brachiosaurus (High-Browsing Giraffe Titan)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (154 - 150 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Enormous 22-meter sauropod whose longer forelimbs gave it an inclined posture to browse tree crowns over 12 meters high in the Morrison Formation.',
      temporal_range: '154 - 150 Ma (Extinct)',
      traits: ['Longer forelimbs than hindlimbs', 'High-browsing cranial crest', 'Pneumatized cervical vertebrae'],
      ott_id: 'ott_981226'
    },
    {
      id: 'tax_diplodocus',
      scientific_name: 'Diplodocus carnegii',
      common_name: 'Diplodocus (Whip-Tailed Long-Neck)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (154 - 152 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: '27-meter diplodocid sauropod characterized by an extremely elongated neck, peg-like raking teeth, and a whiplash tail capable of supersonic cracks.',
      temporal_range: '154 - 152 Ma (Extinct)',
      traits: ['Whiplash defensive tail', 'Peg-like raking teeth', 'Horizontal low-to-medium browsing'],
      ott_id: 'ott_981227'
    },
    {
      id: 'tax_argentinosaurus',
      scientific_name: 'Argentinosaurus huinculensis',
      common_name: 'Argentinosaurus (Colossal 70-Tonne Titanosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (96 - 92 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'One of the heaviest and longest land animals ever to exist, estimated at 35 meters in length and weighing between 70 to 80 tonnes.',
      temporal_range: '96 - 92 Ma (Extinct)',
      traits: ['70-80 tonne colossal body mass', 'Giant 1.5-meter vertebrae', 'Massive columnar weight-bearing limbs'],
      ott_id: 'ott_981228'
    },

    // --- Ornithischia (Horned & Armored Dinosaurs) ---
    {
      id: 'tax_triceratops',
      scientific_name: 'Triceratops horridus',
      common_name: 'Triceratops (Three-Horned Herbivore)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous K-Pg Extinction (66 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Iconic 9-meter chasmosaurine ceratopsian bearing two 1-meter brow horns, a nasal horn, and a solid bone neck frill to defend against T. rex.',
      temporal_range: '68 - 66 Ma (Extinct)',
      traits: ['Three defensive cranial horns', 'Solid bone neck frill', 'Shearing dental batteries'],
      ott_id: 'ott_981229'
    },
    {
      id: 'tax_ankylosaurus',
      scientific_name: 'Ankylosaurus magniventris',
      common_name: 'Ankylosaurus (Armored Tank with Tail Club)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous K-Pg Extinction (66 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Heavily armored herbivore protected by fused osteoderm plates, armored eyelids, and a heavy terminal bone tail club capable of shattering theropod bones.',
      temporal_range: '68 - 66 Ma (Extinct)',
      traits: ['Terminal bone tail club', 'Fused osteoderm armor plates', 'Wide barrel-shaped gut for fermentation'],
      ott_id: 'ott_981230'
    },
    {
      id: 'tax_stegosaurus',
      scientific_name: 'Stegosaurus stenops',
      common_name: 'Stegosaurus (Plated & Spiked Tail Herbivore)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (155 - 150 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: '9-meter thyreophoran dinosaur equipped with alternating vascular dorsal plates for thermoregulation/display and four 1-meter tail spikes (thagomizer).',
      temporal_range: '155 - 150 Ma (Extinct)',
      traits: ['Alternating dorsal osteoderm plates', 'Four-spiked thagomizer tail weapon', 'Narrow cropping beak'],
      ott_id: 'ott_981231'
    },
    {
      id: 'tax_parasaurolophus',
      scientific_name: 'Parasaurolophus walkeri',
      common_name: 'Parasaurolophus (Crested Resonating Hadrosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous (76.5 - 73 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Hadrosaurid duck-billed dinosaur famous for a hollow 1.8-meter backward-curving cranial crest functioning as an acoustic resonator for vocal bellowing.',
      temporal_range: '76.5 - 73 Ma (Extinct)',
      traits: ['Hollow acoustic resonant crest', 'Grinding dental battery with 1,000+ teeth', 'Facultative bipedal gait'],
      ott_id: 'ott_981232'
    },

    // --- Pterosaurs & Marine Reptiles ---
    {
      id: 'tax_quetzalcoatlus',
      scientific_name: 'Quetzalcoatlus northropi',
      common_name: 'Quetzalcoatlus (Giant 11-Meter Pterosaur)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous K-Pg Extinction (66 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Giraffe-sized azhdarchid pterosaur with an 11-meter wingspan, capable of long-distance soaring and stalking terrestrial prey on foot like a giant stork.',
      temporal_range: '68 - 66 Ma (Extinct)',
      traits: ['11-meter wingspan', 'Giraffe-tall quadrupedal stance', 'Long toothless spearing beak'],
      ott_id: 'ott_981233'
    },
    {
      id: 'tax_mosasaurus',
      scientific_name: 'Mosasaurus hoffmannii',
      common_name: 'Mosasaurus (Apex Cretaceous Sea Monster)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Cretaceous K-Pg Extinction (66 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: '17-meter apex marine squamate with a shark-like tail fin, hydrofoil flippers, and double-hinged jaws armed with pterygoid throat teeth to swallow large prey.',
      temporal_range: '70 - 66 Ma (Extinct)',
      traits: ['17-meter body length', 'Pterygoid throat teeth', 'Double-hinged squamate jaw'],
      ott_id: 'ott_981234'
    },
    {
      id: 'tax_ichthyosaurus',
      scientific_name: 'Ichthyosaurus communis',
      common_name: 'Ichthyosaurus (Dolphin-like Marine Reptile)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Jurassic (200 - 190 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60',
      description: 'Streamlined viviparous marine reptile exhibiting classic convergent evolution with modern dolphins, possessing large sclerotic eye rings for deep hunting.',
      temporal_range: '200 - 190 Ma (Extinct)',
      traits: ['Hydrodynamic tuna-like morphology', 'Large sclerotic eye rings', 'Live birth (viviparity)'],
      ott_id: 'ott_981235'
    },

    // --- Avialae (Birds) ---
    {
      id: 'tax_archaeopteryx',
      scientific_name: 'Archaeopteryx lithographica',
      common_name: 'First Bird / Urvogel (Extinct)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Jurassic (150 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
      description: 'Transitional fossil between non-avian feathered theropod dinosaurs and modern avians, possessing flight feathers, toothed jaws, clawed wing digits, and a bony tail.',
      temporal_range: '150.8 - 148.5 Ma (Extinct)',
      traits: ['Asymmetric flight feathers', 'Toothed jaw', 'Long bony tail'],
      ott_id: 'ott_812903'
    },
    {
      id: 'tax_dodo',
      scientific_name: 'Raphus cucullatus',
      common_name: 'Dodo (Extinct 1662)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Holocene Anthropogenic Extinction (1662)',
      thumbnail_url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?w=500&auto=format&fit=crop&q=60',
      description: 'Flightless Columbiform bird endemic to Mauritius, driven to extinction in the 17th century following human discovery and introduced invasive mammals.',
      temporal_range: 'Pleistocene - 1662 AD (Extinct)',
      traits: ['Flightless insular adaptation', 'Robust hooked bill', 'Extinction benchmark species'],
      ott_id: 'ott_61280'
    },
    {
      id: 'tax_haliaeetus',
      scientific_name: 'Haliaeetus leucocephalus',
      common_name: 'Bald Eagle',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&auto=format&fit=crop&q=60',
      description: 'North American sea eagle with iconic white head plumage, yellow hooked beak, and telescopic visual acuity.',
      temporal_range: 'Extant',
      ott_id: 'ott_21908',
      gbif_key: '2480447'
    },
    {
      id: 'tax_komodo',
      scientific_name: 'Varanus komodoensis',
      common_name: 'Komodo Dragon',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=500&auto=format&fit=crop&q=60',
      description: 'World\'s largest living lizard species, native to Indonesian islands, hunting with anticoagulant venom glands and armored osteoderm scales.',
      temporal_range: 'Extant (Endangered)',
      ott_id: 'ott_78190'
    },

    // ==========================================
    // MAMMALIA & CENOZOIC MAMMALS
    // ==========================================

    // --- Monotremes ---
    {
      id: 'tax_platypus',
      scientific_name: 'Ornithorhynchus anatinus',
      common_name: 'Duck-billed Platypus (Monotreme)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=500&auto=format&fit=crop&q=60',
      description: 'Semi-aquatic egg-laying monotreme endemic to eastern Australia, featuring a duck-like electrosensory bill, beaver-like tail, and venomous ankle spurs.',
      temporal_range: 'Extant',
      traits: ['Oviparous (egg-laying)', 'Electroreceptive bill', 'Male crural venom spur'],
      ott_id: 'ott_19082',
      gbif_key: '2433433'
    },

    // --- Felidae & Machairodontinae (Sabertooths & Big Cats) ---
    {
      id: 'tax_smilodon',
      scientific_name: 'Smilodon fatalis',
      common_name: 'Sabertooth Cat (Extinct Pleistocene Apex)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Quaternary Megafaunal Extinction (~10,000 BP)',
      thumbnail_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=500&auto=format&fit=crop&q=60',
      description: 'Extinct machairodontine saber-toothed felid that roamed North America, armed with 28 cm maxillary canine sabers and massive forelimbs to subdue megafauna.',
      temporal_range: '1.6 Ma - 10,000 BP (Extinct)',
      traits: ['28 cm maxillary canine sabers', 'Massive forelimb grapple musculature', 'Social pack predator'],
      ott_id: 'ott_901824'
    },
    {
      id: 'tax_panthera_leo',
      scientific_name: 'Panthera leo',
      common_name: 'African Lion',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=500&auto=format&fit=crop&q=60',
      description: 'Large apex felid of the genus Panthera, noted for social pride hierarchy, sexually dimorphic mane in males, and resounding territorial roar.',
      temporal_range: 'Late Pleistocene - Present',
      habitat: 'Sub-Saharan African savannas and Gir Forest, India',
      traits: ['Social pride structure', 'Sexual dimorphism (mane)', 'Apex carnivore'],
      ott_id: 'ott_93302',
      gbif_key: '5219404'
    },
    {
      id: 'tax_panthera_tigris',
      scientific_name: 'Panthera tigris',
      common_name: 'Tiger (Largest Extant Felid)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=500&auto=format&fit=crop&q=60',
      description: 'The largest living cat species, weighing up to 300 kg with distinctive vertical black stripes on orange-brown fur and solitary forest ambush hunting.',
      temporal_range: 'Pleistocene - Present',
      traits: ['Vertical camouflage stripes', 'Solitary ambush predator', 'Adept swimmer'],
      ott_id: 'ott_93303',
      gbif_key: '5219405'
    },
    {
      id: 'tax_acinonyx_jubatus',
      scientific_name: 'Acinonyx jubatus',
      common_name: 'Cheetah (Fastest Land Animal)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600&auto=format&fit=crop&q=80',
      description: 'Fastest land mammal on Earth, reaching speeds of 110 km/h with semi-retractile claws, flexible lumbar spine, and enlarged respiratory passages.',
      temporal_range: 'Late Pliocene - Present',
      traits: ['Semi-retractable traction claws', 'Enlarged respiratory nasal passages', 'Flexible lumbar sprint spine'],
      ott_id: 'ott_93304',
      gbif_key: '5219406'
    },
    {
      id: 'tax_panthera_uncia',
      scientific_name: 'Panthera uncia',
      common_name: 'Snow Leopard',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=600&auto=format&fit=crop&q=80',
      description: 'High-altitude felid native to mountain ranges of Central and South Asia, adapted to rugged, freezing environments with thick smoke-gray fur.',
      temporal_range: 'Pleistocene - Present',
      traits: ['Dense thick woolly fur', 'Wide paws acting as natural snowshoes', 'Long thick tail for balance'],
      ott_id: 'ott_93305',
      gbif_key: '5219407'
    },
    {
      id: 'tax_panthera_onca',
      scientific_name: 'Panthera onca',
      common_name: 'Jaguar (Apex Neotropical Cat)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&auto=format&fit=crop&q=80',
      description: 'Largest cat species in the Americas with exceptionally powerful bite force capable of piercing turtle shells and hunting caimans.',
      temporal_range: 'Early Pleistocene - Present',
      traits: ['Crushing bite force', 'Rosette camouflage coats', 'Adept swimmer'],
      ott_id: 'ott_93306',
      gbif_key: '5219408'
    },

    // --- Canidae & Ursidae (Dogs, Wolves & Bears) ---
    {
      id: 'tax_canis_lupus',
      scientific_name: 'Canis lupus',
      common_name: 'Gray Wolf',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=500&auto=format&fit=crop&q=60',
      description: 'Largest wild member of the Canidae family, famous for cooperative pack hunting, acoustic vocal howling, and ancestor of domestic dogs.',
      temporal_range: 'Late Pleistocene - Present',
      habitat: 'Holarctic wilderness and tundra',
      traits: ['Cooperative hunting', 'Complex social pack hierarchies', 'Vocal howling range'],
      ott_id: 'ott_24719',
      gbif_key: '5219173'
    },
    {
      id: 'tax_aenocyon_dirus',
      scientific_name: 'Aenocyon dirus',
      common_name: 'Dire Wolf (Extinct Megafaunal Hunter)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Pleistocene Extinction (~9,500 BP)',
      thumbnail_url: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=500&auto=format&fit=crop&q=60',
      description: 'Heavy-set extinct hypercarnivorous canid abundant in the La Brea Tar Pits, with massive crushing premolars adapted to subduing bison and horses.',
      temporal_range: '125,000 - 9,500 BP (Extinct)',
      traits: ['Heavy bone-cracking dentition', 'Massive robust musculoskeletal frame', 'Cooperative big-game hunter'],
      ott_id: 'ott_981236'
    },
    {
      id: 'tax_ursus_spelaeus',
      scientific_name: 'Ursus spelaeus',
      common_name: 'Cave Bear (Extinct Pleistocene Titan)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Pleistocene (~24,000 BP)',
      thumbnail_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=60',
      description: 'Massive herbivorous bear of Ice Age Europe reaching 1,000 kg, famous for communal cave hibernation and interactions with Neanderthals.',
      temporal_range: '300,000 - 24,000 BP (Extinct)',
      traits: ['1,000 kg body mass', 'Domed high-vaulted cranium', 'Specialized herbivorous molar grinding surface'],
      ott_id: 'ott_981237'
    },

    // --- Cetacea (Whales & Marine Mammals) ---
    {
      id: 'tax_pakicetus',
      scientific_name: 'Pakicetus inachus',
      common_name: 'Pakicetus (Four-Legged Whale Ancestor)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Eocene (~50 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=500&auto=format&fit=crop&q=60',
      description: 'Four-legged amphibious terrestrial artiodactyl whose specialized involucrum ear bone firmly established the land-to-sea origin of all whales.',
      temporal_range: '52 - 48 Ma (Extinct)',
      traits: ['Pachyosteosclerotic tympanic bulla involucrum', 'Four functional cursorial legs', 'Amphibious freshwater predator'],
      ott_id: 'ott_981238'
    },
    {
      id: 'tax_basilosaurus',
      scientific_name: 'Basilosaurus cetoides',
      common_name: 'Basilosaurus (Ancient 18-Meter Eocene Whale)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Eocene (40 - 34 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=500&auto=format&fit=crop&q=60',
      description: 'Elongated 18-meter serpentine early marine whale possessing vestigial hind limbs and heterodont crushing teeth to hunt sharks and smaller whales.',
      temporal_range: '40 - 34 Ma (Extinct)',
      traits: ['18-meter elongated serpentine body', 'Vestigial external hind limbs', 'Apex marine Eocene predator'],
      ott_id: 'ott_981239'
    },
    {
      id: 'tax_balaenoptera',
      scientific_name: 'Balaenoptera musculus',
      common_name: 'Blue Whale (Largest Animal in History)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=500&auto=format&fit=crop&q=60',
      description: 'The largest known animal ever to have existed on Earth, reaching lengths of 30 meters and masses over 190 metric tons, feeding on krill via baleen plates.',
      temporal_range: 'Late Pliocene - Present',
      traits: ['30-meter length / 190-tonne mass', 'Baleen plates for lunge-feeding', 'Lowest frequency infrasonic vocal calls'],
      ott_id: 'ott_31908',
      gbif_key: '2440735'
    },
    {
      id: 'tax_orcinus_orca',
      scientific_name: 'Orcinus orca',
      common_name: 'Killer Whale / Orca',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=500&auto=format&fit=crop&q=60',
      description: 'Cosmopolitan apex marine dolphin demonstrating complex matrilineal pod cultures, sophisticated dialect vocalizations, and coordinated hunting.',
      temporal_range: 'Extant',
      traits: ['Matrilineal pod culture and dialects', 'Apex marine generalist predator', 'High encephalization quotient'],
      ott_id: 'ott_31909',
      gbif_key: '2440736'
    },

    // --- Proboscidea (Mammoths & Elephants) ---
    {
      id: 'tax_mammuthus',
      scientific_name: 'Mammuthus primigenius',
      common_name: 'Woolly Mammoth (Extinct Ice Age Giant)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Holocene Extinction (~4,000 BP on Wrangel Island)',
      thumbnail_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500&auto=format&fit=crop&q=60',
      description: 'Cold-adapted proboscidean with long shaggy coat, 4-meter curved tusks, small ears to prevent frostbite, and specialized antifreeze hemoglobin.',
      temporal_range: '400,000 - 4,000 BP (Extinct)',
      traits: ['Antifreeze cold-adapted hemoglobin', '4-meter curved ivory tusks', 'Dense dual-layer fur insulation'],
      ott_id: 'ott_981240'
    },
    {
      id: 'tax_loxodonta',
      scientific_name: 'Loxodonta africana',
      common_name: 'African Bush Elephant',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500&auto=format&fit=crop&q=60',
      description: 'Largest living terrestrial animal, exhibiting sophisticated social empathy, infrasonic seismic communication, and keystone ecological engineering.',
      temporal_range: 'Extant',
      ott_id: 'ott_981241',
      gbif_key: '2437001'
    },

    // --- Rodents ---
    {
      id: 'tax_mus_musculus',
      scientific_name: 'Mus musculus',
      common_name: 'House Mouse',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&auto=format&fit=crop&q=60',
      description: 'Small rodent that is the most widely utilized mammalian model organism in biomedical research and genetic knockouts.',
      temporal_range: 'Extant',
      ott_id: 'ott_52109',
      gbif_key: '2438763'
    },

    // --- Primates & Hominini (Human Evolution Lineage) ---
    {
      id: 'tax_australopithecus',
      scientific_name: 'Australopithecus afarensis',
      common_name: 'Australopithecus ("Lucy" - 3.2 Ma)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Pliocene (~2.9 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      description: 'Early bipedal hominin famous from the "Lucy" fossil (AL 288-1) and Laetoli footprints, demonstrating committed terrestrial bipedal walking.',
      temporal_range: '3.9 - 2.9 Ma (Extinct)',
      traits: ['Habitual terrestrial bipedalism', 'Valgus knee and arched foot', 'Chimpanzee-sized cranial capacity (430 cc)'],
      ott_id: 'ott_981242'
    },
    {
      id: 'tax_homo_habilis',
      scientific_name: 'Homo habilis',
      common_name: 'Homo habilis ("Handy Man" Oldowan Toolmaker)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Early Pleistocene (~1.65 Ma)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      description: 'Earliest consensus member of the genus Homo, associated with the Oldowan stone pebble tool industry and expanded braincase (~610 cc).',
      temporal_range: '2.3 - 1.65 Ma (Extinct)',
      traits: ['Oldowan stone tool manufacture', 'Expanded cranial volume (610 cc)', 'Precision grip manipulation'],
      ott_id: 'ott_981243'
    },
    {
      id: 'tax_homo_erectus',
      scientific_name: 'Homo erectus',
      common_name: 'Homo erectus (Upright Man / Fire Master)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Pleistocene (~110,000 BP in Java)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      description: 'First hominin species to leave Africa, master controlled fire, craft symmetrical Acheulean handaxes, and possess human-like body proportions.',
      temporal_range: '1.9 Ma - 110,000 BP (Extinct)',
      traits: ['Controlled use of fire for cooking', 'Acheulean bifacial handaxes', 'First hominin dispersal across Eurasia'],
      ott_id: 'ott_981244'
    },
    {
      id: 'tax_homo_heidelbergensis',
      scientific_name: 'Homo heidelbergensis',
      common_name: 'Heidelberg Man (Ancestor of Neanderthals & Sapiens)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Middle Pleistocene (~200,000 BP)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      description: 'Large-brained (1250 cc) archaic human that directly gave rise to Neanderthals in Europe and Homo sapiens in Africa, known for Schöningen wooden spears.',
      temporal_range: '600,000 - 200,000 BP (Extinct)',
      traits: ['Schöningen big-game hunting spears', '1250 cc cranial capacity', 'Common ancestor of Sapiens & Neanderthals'],
      ott_id: 'ott_981245'
    },
    {
      id: 'tax_neanderthal',
      scientific_name: 'Homo neanderthalensis',
      common_name: 'Neanderthal (Extinct Archaic Human)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: true,
      extinction_era: 'Late Pleistocene (~40,000 BP)',
      thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      description: 'Archaic human species adapted to cold Eurasian climates, skilled in Mousterian stone tools, intentional burial rituals, and interbred with Homo sapiens.',
      temporal_range: '430,000 - 40,000 BP (Extinct)',
      traits: ['Mousterian tool industry', 'Occipital bun & robust cold-adapted build', '1-2% Eurasian genomic contribution'],
      ott_id: 'ott_981902'
    },
    {
      id: 'tax_pan_troglodytes',
      scientific_name: 'Pan troglodytes',
      common_name: 'Central Chimpanzee',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=500&auto=format&fit=crop&q=60',
      description: 'Great ape native to African forests and savannas, sharing ~98.8% DNA sequence identity with humans, demonstrating tool crafting and culture.',
      temporal_range: 'Extant (Endangered)',
      ott_id: 'ott_81290',
      gbif_key: '2436440'
    },
    {
      id: 'tax_homo_sapiens',
      scientific_name: 'Homo sapiens',
      common_name: 'Modern Human (You)',
      rank: 'species',
      kingdom: 'Metazoa',
      extinct: false,
      thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
      description: 'Extant bipedal primate characterized by high cognitive adaptability, symbolic language, complex cultural institutions, technology, and global presence.',
      temporal_range: '300,000 BP - Present',
      habitat: 'Worldwide terrestrial ecosystems',
      traits: ['Globular cranium (1350 cc)', 'Syntactic symbolic language', 'Cumulative technological culture'],
      ott_id: 'ott_770315',
      gbif_key: '2436436',
      source_study_ids: ['ot_1234', 'treebase_987', 'timetree_human_chimp']
    }
  ],

  edges: [
    // ==========================================
    // ROOT BRANCHES (FROM LUCA)
    // ==========================================
    {
      id: 'edge_luca_bacteria',
      source_id: 'div_luca',
      target_id: 'div_bacteria_major',
      branch_length_mya: 700,
      confidence_score: 0.98
    },
    {
      id: 'edge_luca_archaea_protoeuk',
      source_id: 'div_luca',
      target_id: 'div_archaea_eukarya',
      branch_length_mya: 1500,
      confidence_score: 0.95
    },

    // --- Archaea Branches ---
    {
      id: 'edge_archaea_euryarchaeota',
      source_id: 'div_archaea_eukarya',
      target_id: 'tax_archaea_phylum_euryarchaeota',
      branch_length_mya: 200,
      confidence_score: 0.92
    },
    {
      id: 'edge_eury_methano',
      source_id: 'tax_archaea_phylum_euryarchaeota',
      target_id: 'tax_methanocaldococcus',
      branch_length_mya: 1200,
      confidence_score: 0.90
    },
    {
      id: 'edge_eury_halo',
      source_id: 'tax_archaea_phylum_euryarchaeota',
      target_id: 'tax_halobacterium',
      branch_length_mya: 900,
      confidence_score: 0.88
    },
    {
      id: 'edge_archaea_loki',
      source_id: 'div_archaea_eukarya',
      target_id: 'tax_lokiarchaeum',
      branch_length_mya: 600,
      confidence_score: 0.94
    },
    {
      id: 'edge_archaea_eukaryogenesis',
      source_id: 'div_archaea_eukarya',
      target_id: 'div_eukaryogenesis',
      branch_length_mya: 600,
      confidence_score: 0.96
    },

    // --- Bacteria Branches ---
    {
      id: 'edge_bac_cyano',
      source_id: 'div_bacteria_major',
      target_id: 'tax_cyanobacteria',
      branch_length_mya: 1100,
      confidence_score: 0.97
    },
    {
      id: 'edge_cyano_micro',
      source_id: 'tax_cyanobacteria',
      target_id: 'tax_microcystis',
      branch_length_mya: 800,
      confidence_score: 0.90
    },
    {
      id: 'edge_bac_ecoli',
      source_id: 'div_bacteria_major',
      target_id: 'tax_escherichia_coli',
      branch_length_mya: 3500,
      confidence_score: 0.99
    },
    {
      id: 'edge_bac_strepto',
      source_id: 'div_bacteria_major',
      target_id: 'tax_streptomyces',
      branch_length_mya: 2500,
      confidence_score: 0.93
    },

    // --- Eukaryogenesis Splits ---
    {
      id: 'edge_euk_dictyo',
      source_id: 'div_eukaryogenesis',
      target_id: 'tax_dictyostelium',
      branch_length_mya: 1000,
      confidence_score: 0.89
    },
    {
      id: 'edge_euk_paramecium',
      source_id: 'div_eukaryogenesis',
      target_id: 'tax_paramecium',
      branch_length_mya: 1200,
      confidence_score: 0.87
    },
    {
      id: 'edge_euk_plants',
      source_id: 'div_eukaryogenesis',
      target_id: 'div_archaeplastida',
      branch_length_mya: 500,
      confidence_score: 0.96
    },
    {
      id: 'edge_euk_opisthokonta',
      source_id: 'div_eukaryogenesis',
      target_id: 'div_opisthokonta',
      branch_length_mya: 600,
      confidence_score: 0.98
    },

    // --- Viridiplantae (Plants) ---
    {
      id: 'edge_pl_chlorophyta',
      source_id: 'div_archaeplastida',
      target_id: 'tax_chlorophyta',
      branch_length_mya: 400,
      confidence_score: 0.95
    },
    {
      id: 'edge_pl_embryophyta',
      source_id: 'div_archaeplastida',
      target_id: 'div_embryophyta',
      branch_length_mya: 1120,
      confidence_score: 0.96
    },
    {
      id: 'edge_emb_sphagnum',
      source_id: 'div_embryophyta',
      target_id: 'tax_sphagnum',
      branch_length_mya: 50,
      confidence_score: 0.92
    },
    {
      id: 'edge_emb_tracheophyta',
      source_id: 'div_embryophyta',
      target_id: 'div_tracheophyta',
      branch_length_mya: 50,
      confidence_score: 0.97
    },
    {
      id: 'edge_trach_cooksonia',
      source_id: 'div_tracheophyta',
      target_id: 'tax_cooksonia',
      branch_length_mya: 40,
      confidence_score: 0.85
    },
    {
      id: 'edge_trach_spermatophyta',
      source_id: 'div_tracheophyta',
      target_id: 'div_spermatophyta',
      branch_length_mya: 70,
      confidence_score: 0.98
    },
    {
      id: 'edge_sperm_ginkgo',
      source_id: 'div_spermatophyta',
      target_id: 'tax_ginkgo',
      branch_length_mya: 90,
      confidence_score: 0.94
    },
    {
      id: 'edge_sperm_sequoia',
      source_id: 'div_spermatophyta',
      target_id: 'tax_sequoiadendron',
      branch_length_mya: 130,
      confidence_score: 0.93
    },
    {
      id: 'edge_sperm_angio',
      source_id: 'div_spermatophyta',
      target_id: 'div_angiosperms',
      branch_length_mya: 200,
      confidence_score: 0.99
    },
    {
      id: 'edge_angio_arabidopsis',
      source_id: 'div_angiosperms',
      target_id: 'tax_arabidopsis',
      branch_length_mya: 160,
      confidence_score: 0.97
    },
    {
      id: 'edge_angio_rice',
      source_id: 'div_angiosperms',
      target_id: 'tax_oryza_sativa',
      branch_length_mya: 130,
      confidence_score: 0.95
    },

    // --- Opisthokonta Split (Fungi vs Animals) ---
    {
      id: 'edge_opistho_fungi',
      source_id: 'div_opisthokonta',
      target_id: 'div_fungi_crown',
      branch_length_mya: 500,
      confidence_score: 0.97
    },
    {
      id: 'edge_opistho_metazoa',
      source_id: 'div_opisthokonta',
      target_id: 'div_metazoa_crown',
      branch_length_mya: 700,
      confidence_score: 0.99
    },

    // --- Fungi Branches ---
    {
      id: 'edge_fungi_dikarya',
      source_id: 'div_fungi_crown',
      target_id: 'div_dikarya',
      branch_length_mya: 400,
      confidence_score: 0.96
    },
    {
      id: 'edge_dikarya_yeast',
      source_id: 'div_dikarya',
      target_id: 'tax_saccharomyces',
      branch_length_mya: 600,
      confidence_score: 0.99
    },
    {
      id: 'edge_dikarya_penicillium',
      source_id: 'div_dikarya',
      target_id: 'tax_penicillium',
      branch_length_mya: 400,
      confidence_score: 0.94
    },
    {
      id: 'edge_dikarya_amanita',
      source_id: 'div_dikarya',
      target_id: 'tax_amanita_muscaria',
      branch_length_mya: 600,
      confidence_score: 0.96
    },
    {
      id: 'edge_dikarya_chanterelle',
      source_id: 'div_dikarya',
      target_id: 'tax_cantharellus',
      branch_length_mya: 350,
      confidence_score: 0.92
    },

    // --- Metazoa (Animalia) Branches ---
    {
      id: 'edge_meta_sponge',
      source_id: 'div_metazoa_crown',
      target_id: 'tax_euspongia',
      branch_length_mya: 120,
      confidence_score: 0.93
    },
    {
      id: 'edge_meta_eumetazoa',
      source_id: 'div_metazoa_crown',
      target_id: 'div_eumetazoa',
      branch_length_mya: 120,
      confidence_score: 0.97
    },
    {
      id: 'edge_eumeta_jelly',
      source_id: 'div_eumetazoa',
      target_id: 'tax_aurelia',
      branch_length_mya: 80,
      confidence_score: 0.95
    },
    {
      id: 'edge_eumeta_bilateria',
      source_id: 'div_eumetazoa',
      target_id: 'div_bilateria',
      branch_length_mya: 80,
      confidence_score: 0.99
    },

    // --- Bilateria Splits ---
    {
      id: 'edge_bila_protostomia',
      source_id: 'div_bilateria',
      target_id: 'div_protostomia',
      branch_length_mya: 40,
      confidence_score: 0.98
    },
    {
      id: 'edge_bila_deuterostomia',
      source_id: 'div_bilateria',
      target_id: 'div_deuterostomia',
      branch_length_mya: 40,
      confidence_score: 0.98
    },

    // --- Protostomes & Arthropods ---
    {
      id: 'edge_proto_stem_arthro',
      source_id: 'div_protostomia',
      target_id: 'div_stem_arthropoda',
      branch_length_mya: 35,
      confidence_score: 0.96
    },
    {
      id: 'edge_stem_anomalocaris',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_anomalocaris',
      branch_length_mya: 17,
      confidence_score: 0.94
    },
    {
      id: 'edge_stem_opabinia',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_opabinia',
      branch_length_mya: 20,
      confidence_score: 0.92
    },
    {
      id: 'edge_stem_trilobite',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_trilobite',
      branch_length_mya: 20,
      confidence_score: 0.91
    },
    {
      id: 'edge_stem_jaekelopterus',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_jaekelopterus',
      branch_length_mya: 132,
      confidence_score: 0.90
    },
    {
      id: 'edge_stem_meganeura',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_meganeura',
      branch_length_mya: 220,
      confidence_score: 0.93
    },
    {
      id: 'edge_stem_drosophila',
      source_id: 'div_stem_arthropoda',
      target_id: 'tax_drosophila',
      branch_length_mya: 525,
      confidence_score: 0.99
    },
    {
      id: 'edge_proto_octopus',
      source_id: 'div_protostomia',
      target_id: 'tax_octopus',
      branch_length_mya: 560,
      confidence_score: 0.96
    },

    // --- Deuterostomes & Chordates ---
    {
      id: 'edge_deuter_chordata',
      source_id: 'div_deuterostomia',
      target_id: 'div_chordata_origin',
      branch_length_mya: 25,
      confidence_score: 0.98
    },
    {
      id: 'edge_chord_gnathostomata',
      source_id: 'div_chordata_origin',
      target_id: 'div_gnathostomata',
      branch_length_mya: 70,
      confidence_score: 0.99
    },

    // --- Gnathostomes (Jaws): Sharks & Bony Vertebrates ---
    {
      id: 'edge_gnatho_selachimorpha',
      source_id: 'div_gnathostomata',
      target_id: 'div_selachimorpha',
      branch_length_mya: 45,
      confidence_score: 0.97
    },
    {
      id: 'edge_selachi_megalodon',
      source_id: 'div_selachimorpha',
      target_id: 'tax_megalodon',
      branch_length_mya: 397,
      confidence_score: 0.95
    },
    {
      id: 'edge_selachi_carcharodon',
      source_id: 'div_selachimorpha',
      target_id: 'tax_carcharodon',
      branch_length_mya: 420,
      confidence_score: 0.98
    },
    {
      id: 'edge_selachi_rhincodon',
      source_id: 'div_selachimorpha',
      target_id: 'tax_rhincodon',
      branch_length_mya: 420,
      confidence_score: 0.96
    },
    {
      id: 'edge_gnatho_danio',
      source_id: 'div_gnathostomata',
      target_id: 'tax_danio',
      branch_length_mya: 430,
      confidence_score: 0.98
    },
    {
      id: 'edge_gnatho_tetrapoda',
      source_id: 'div_gnathostomata',
      target_id: 'div_tetrapoda',
      branch_length_mya: 80,
      confidence_score: 0.99
    },

    // --- Tetrapods & Amniotes ---
    {
      id: 'edge_tetra_axolotl',
      source_id: 'div_tetrapoda',
      target_id: 'tax_axolotl',
      branch_length_mya: 385,
      confidence_score: 0.96
    },
    {
      id: 'edge_tetra_amniota',
      source_id: 'div_tetrapoda',
      target_id: 'div_amniota',
      branch_length_mya: 65,
      confidence_score: 0.99
    },

    // --- Synapsida (Mammal Line) ---
    {
      id: 'edge_amnio_synapsida',
      source_id: 'div_amniota',
      target_id: 'div_synapsida_stem',
      branch_length_mya: 25,
      confidence_score: 0.98
    },
    {
      id: 'edge_synap_dimetrodon',
      source_id: 'div_synapsida_stem',
      target_id: 'tax_dimetrodon',
      branch_length_mya: 23,
      confidence_score: 0.96
    },
    {
      id: 'edge_synap_mammalia',
      source_id: 'div_synapsida_stem',
      target_id: 'div_mammalia_crown',
      branch_length_mya: 115,
      confidence_score: 0.99
    },

    // --- Sauropsida (Reptile/Bird/Dinosaur Line) ---
    {
      id: 'edge_amnio_sauropsida',
      source_id: 'div_amniota',
      target_id: 'div_dinosauria_aves',
      branch_length_mya: 75,
      confidence_score: 0.98
    },
    {
      id: 'edge_sauro_komodo',
      source_id: 'div_dinosauria_aves',
      target_id: 'tax_komodo',
      branch_length_mya: 245,
      confidence_score: 0.95
    },
    {
      id: 'edge_sauro_marine_rep',
      source_id: 'div_dinosauria_aves',
      target_id: 'div_marine_reptiles',
      branch_length_mya: 5,
      confidence_score: 0.96
    },
    {
      id: 'edge_marine_mosasaur',
      source_id: 'div_marine_reptiles',
      target_id: 'tax_mosasaurus',
      branch_length_mya: 170,
      confidence_score: 0.95
    },
    {
      id: 'edge_marine_ichthyo',
      source_id: 'div_marine_reptiles',
      target_id: 'tax_ichthyosaurus',
      branch_length_mya: 40,
      confidence_score: 0.96
    },
    {
      id: 'edge_sauro_pterosauria',
      source_id: 'div_dinosauria_aves',
      target_id: 'div_pterosauria',
      branch_length_mya: 17,
      confidence_score: 0.97
    },
    {
      id: 'edge_ptero_quetzalcoatlus',
      source_id: 'div_pterosauria',
      target_id: 'tax_quetzalcoatlus',
      branch_length_mya: 160,
      confidence_score: 0.96
    },

    // --- Dinosauria Subclades (Theropoda, Sauropodomorpha, Ornithischia) ---
    {
      id: 'edge_dino_theropoda',
      source_id: 'div_dinosauria_aves',
      target_id: 'div_theropoda',
      branch_length_mya: 14,
      confidence_score: 0.99
    },
    {
      id: 'edge_dino_sauropoda',
      source_id: 'div_dinosauria_aves',
      target_id: 'div_sauropodomorpha',
      branch_length_mya: 17,
      confidence_score: 0.98
    },
    {
      id: 'edge_dino_ornithischia',
      source_id: 'div_dinosauria_aves',
      target_id: 'div_ornithischia',
      branch_length_mya: 17,
      confidence_score: 0.98
    },

    // --- Sauropods ---
    {
      id: 'edge_sauro_brachio',
      source_id: 'div_sauropodomorpha',
      target_id: 'tax_brachiosaurus',
      branch_length_mya: 74,
      confidence_score: 0.96
    },
    {
      id: 'edge_sauro_diplo',
      source_id: 'div_sauropodomorpha',
      target_id: 'tax_diplodocus',
      branch_length_mya: 74,
      confidence_score: 0.95
    },
    {
      id: 'edge_sauro_argen',
      source_id: 'div_sauropodomorpha',
      target_id: 'tax_argentinosaurus',
      branch_length_mya: 132,
      confidence_score: 0.94
    },

    // --- Ornithischians (Triceratops, Ankylosaurus, Stegosaurus, Parasaurolophus) ---
    {
      id: 'edge_ornith_triceratops',
      source_id: 'div_ornithischia',
      target_id: 'tax_triceratops',
      branch_length_mya: 160,
      confidence_score: 0.98
    },
    {
      id: 'edge_ornith_ankylosaurus',
      source_id: 'div_ornithischia',
      target_id: 'tax_ankylosaurus',
      branch_length_mya: 160,
      confidence_score: 0.98
    },
    {
      id: 'edge_ornith_stegosaurus',
      source_id: 'div_ornithischia',
      target_id: 'tax_stegosaurus',
      branch_length_mya: 73,
      confidence_score: 0.97
    },
    {
      id: 'edge_ornith_parasaurolophus',
      source_id: 'div_ornithischia',
      target_id: 'tax_parasaurolophus',
      branch_length_mya: 151,
      confidence_score: 0.96
    },

    // --- Theropoda Splits: Tyrannosauroidea, Dromaeosauridae, Spinosauridae, Birds ---
    {
      id: 'edge_thero_tyranno',
      source_id: 'div_theropoda',
      target_id: 'div_tyrannosauroidea',
      branch_length_mya: 66,
      confidence_score: 0.99
    },
    {
      id: 'edge_thero_dromaeo',
      source_id: 'div_theropoda',
      target_id: 'div_dromaeosauridae',
      branch_length_mya: 86,
      confidence_score: 0.98
    },
    {
      id: 'edge_thero_spino_carno',
      source_id: 'div_theropoda',
      target_id: 'div_spinosauridae_carnosauria',
      branch_length_mya: 76,
      confidence_score: 0.97
    },
    {
      id: 'edge_thero_avialae',
      source_id: 'div_theropoda',
      target_id: 'div_avialae_birds',
      branch_length_mya: 81,
      confidence_score: 0.99
    },

    // --- Tyrannosauroids (All Specific Species) ---
    {
      id: 'edge_tyran_trex',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_tyrannosaurus',
      branch_length_mya: 97,
      confidence_score: 1.0
    },
    {
      id: 'edge_tyran_tarbo',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_tarbosaurus',
      branch_length_mya: 95,
      confidence_score: 0.98
    },
    {
      id: 'edge_tyran_alberto',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_albertosaurus',
      branch_length_mya: 94,
      confidence_score: 0.97
    },
    {
      id: 'edge_tyran_gorgo',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_gorgosaurus',
      branch_length_mya: 89,
      confidence_score: 0.96
    },
    {
      id: 'edge_tyran_daspleto',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_daspletosaurus',
      branch_length_mya: 88,
      confidence_score: 0.96
    },
    {
      id: 'edge_tyran_yutyrannus',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_yutyrannus',
      branch_length_mya: 40,
      confidence_score: 0.98
    },
    {
      id: 'edge_tyran_dilong',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_dilong',
      branch_length_mya: 39,
      confidence_score: 0.95
    },
    {
      id: 'edge_tyran_guanlong',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_guanlong',
      branch_length_mya: 5,
      confidence_score: 0.96
    },
    {
      id: 'edge_tyran_nanuq',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_nanuqsaurus',
      branch_length_mya: 96,
      confidence_score: 0.94
    },
    {
      id: 'edge_tyran_alioramus',
      source_id: 'div_tyrannosauroidea',
      target_id: 'tax_alioramus',
      branch_length_mya: 95,
      confidence_score: 0.95
    },

    // --- Dromaeosaurs (Raptors) ---
    {
      id: 'edge_drom_velociraptor',
      source_id: 'div_dromaeosauridae',
      target_id: 'tax_velociraptor',
      branch_length_mya: 70,
      confidence_score: 0.98
    },
    {
      id: 'edge_drom_deinonychus',
      source_id: 'div_dromaeosauridae',
      target_id: 'tax_deinonychus',
      branch_length_mya: 30,
      confidence_score: 0.99
    },
    {
      id: 'edge_drom_utahraptor',
      source_id: 'div_dromaeosauridae',
      target_id: 'tax_utahraptor',
      branch_length_mya: 10,
      confidence_score: 0.97
    },
    {
      id: 'edge_drom_microraptor',
      source_id: 'div_dromaeosauridae',
      target_id: 'tax_microraptor',
      branch_length_mya: 25,
      confidence_score: 0.96
    },

    // --- Spinosauridae & Carnosauria ---
    {
      id: 'edge_spino_spinosaurus',
      source_id: 'div_spinosauridae_carnosauria',
      target_id: 'tax_spinosaurus',
      branch_length_mya: 56,
      confidence_score: 0.97
    },
    {
      id: 'edge_spino_allosaurus',
      source_id: 'div_spinosauridae_carnosauria',
      target_id: 'tax_allosaurus',
      branch_length_mya: 5,
      confidence_score: 0.98
    },
    {
      id: 'edge_spino_carnotaurus',
      source_id: 'div_spinosauridae_carnosauria',
      target_id: 'tax_carnotaurus',
      branch_length_mya: 83,
      confidence_score: 0.96
    },

    // --- Avialae & Birds ---
    {
      id: 'edge_avial_archaeopteryx',
      source_id: 'div_avialae_birds',
      target_id: 'tax_archaeopteryx',
      branch_length_mya: 1.5,
      confidence_score: 0.98
    },
    {
      id: 'edge_avial_dodo',
      source_id: 'div_avialae_birds',
      target_id: 'tax_dodo',
      branch_length_mya: 150,
      confidence_score: 0.97
    },
    {
      id: 'edge_avial_eagle',
      source_id: 'div_avialae_birds',
      target_id: 'tax_haliaeetus',
      branch_length_mya: 150,
      confidence_score: 0.99
    },

    // --- Mammalia & Placentals ---
    {
      id: 'edge_mam_platypus',
      source_id: 'div_mammalia_crown',
      target_id: 'tax_platypus',
      branch_length_mya: 180,
      confidence_score: 0.98
    },
    {
      id: 'edge_mam_placentalia',
      source_id: 'div_mammalia_crown',
      target_id: 'div_placentalia_orders',
      branch_length_mya: 85,
      confidence_score: 0.99
    },

    // --- Placental Radiations (Carnivora, Cetacea, Proboscidea, Primates, Rodents) ---
    {
      id: 'edge_placen_rodent',
      source_id: 'div_placentalia_orders',
      target_id: 'tax_mus_musculus',
      branch_length_mya: 95,
      confidence_score: 0.99
    },
    {
      id: 'edge_placen_carnivora',
      source_id: 'div_placentalia_orders',
      target_id: 'div_carnivora_feliformia_caniformia',
      branch_length_mya: 40,
      confidence_score: 0.98
    },
    {
      id: 'edge_placen_cetacea',
      source_id: 'div_placentalia_orders',
      target_id: 'div_cetacea',
      branch_length_mya: 43,
      confidence_score: 0.98
    },
    {
      id: 'edge_placen_proboscidea',
      source_id: 'div_placentalia_orders',
      target_id: 'div_proboscidea',
      branch_length_mya: 60,
      confidence_score: 0.97
    },
    {
      id: 'edge_placen_hominidae',
      source_id: 'div_placentalia_orders',
      target_id: 'div_hominidae_crown',
      branch_length_mya: 88.2,
      confidence_score: 0.99
    },

    // --- Carnivora (Felidae & Canidae) ---
    {
      id: 'edge_carni_felidae',
      source_id: 'div_carnivora_feliformia_caniformia',
      target_id: 'div_felidae',
      branch_length_mya: 30,
      confidence_score: 0.99
    },
    {
      id: 'edge_carni_canidae',
      source_id: 'div_carnivora_feliformia_caniformia',
      target_id: 'div_canidae_ursidae',
      branch_length_mya: 13,
      confidence_score: 0.99
    },

    // --- Felidae (Cats & Sabertooths) ---
    {
      id: 'edge_feli_smilodon',
      source_id: 'div_felidae',
      target_id: 'tax_smilodon',
      branch_length_mya: 23.4,
      confidence_score: 0.98
    },
    {
      id: 'edge_feli_lion',
      source_id: 'div_felidae',
      target_id: 'tax_panthera_leo',
      branch_length_mya: 25,
      confidence_score: 1.0
    },
    {
      id: 'edge_feli_tiger',
      source_id: 'div_felidae',
      target_id: 'tax_panthera_tigris',
      branch_length_mya: 25,
      confidence_score: 0.99
    },
    {
      id: 'edge_feli_cheetah',
      source_id: 'div_felidae',
      target_id: 'tax_acinonyx_jubatus',
      branch_length_mya: 25,
      confidence_score: 0.98
    },
    {
      id: 'edge_feli_snow_leopard',
      source_id: 'div_felidae',
      target_id: 'tax_panthera_uncia',
      branch_length_mya: 25,
      confidence_score: 0.98
    },
    {
      id: 'edge_feli_jaguar',
      source_id: 'div_felidae',
      target_id: 'tax_panthera_onca',
      branch_length_mya: 25,
      confidence_score: 0.98
    },

    // --- Canidae & Ursidae ---
    {
      id: 'edge_cani_wolf',
      source_id: 'div_canidae_ursidae',
      target_id: 'tax_canis_lupus',
      branch_length_mya: 42,
      confidence_score: 1.0
    },
    {
      id: 'edge_cani_direwolf',
      source_id: 'div_canidae_ursidae',
      target_id: 'tax_aenocyon_dirus',
      branch_length_mya: 41.9,
      confidence_score: 0.98
    },
    {
      id: 'edge_cani_cavebear',
      source_id: 'div_canidae_ursidae',
      target_id: 'tax_ursus_spelaeus',
      branch_length_mya: 41.7,
      confidence_score: 0.97
    },

    // --- Cetacea (Whales) ---
    {
      id: 'edge_ceta_pakicetus',
      source_id: 'div_cetacea',
      target_id: 'tax_pakicetus',
      branch_length_mya: 2,
      confidence_score: 0.98
    },
    {
      id: 'edge_ceta_basilosaurus',
      source_id: 'div_cetacea',
      target_id: 'tax_basilosaurus',
      branch_length_mya: 14,
      confidence_score: 0.98
    },
    {
      id: 'edge_ceta_bluewhale',
      source_id: 'div_cetacea',
      target_id: 'tax_balaenoptera',
      branch_length_mya: 52,
      confidence_score: 0.99
    },
    {
      id: 'edge_ceta_orca',
      source_id: 'div_cetacea',
      target_id: 'tax_orcinus_orca',
      branch_length_mya: 52,
      confidence_score: 0.99
    },

    // --- Proboscidea (Mammoths & Elephants) ---
    {
      id: 'edge_probo_mammoth',
      source_id: 'div_proboscidea',
      target_id: 'tax_mammuthus',
      branch_length_mya: 34.6,
      confidence_score: 0.98
    },
    {
      id: 'edge_probo_elephant',
      source_id: 'div_proboscidea',
      target_id: 'tax_loxodonta',
      branch_length_mya: 35,
      confidence_score: 0.99
    },

    // --- Hominidae & Hominini ---
    {
      id: 'edge_homini_chimp',
      source_id: 'div_hominidae_crown',
      target_id: 'tax_pan_troglodytes',
      branch_length_mya: 6.8,
      confidence_score: 0.99
    },
    {
      id: 'edge_homini_split',
      source_id: 'div_hominidae_crown',
      target_id: 'div_hominini',
      branch_length_mya: 2.6,
      confidence_score: 0.99
    },
    {
      id: 'edge_homin_australo',
      source_id: 'div_hominini',
      target_id: 'tax_australopithecus',
      branch_length_mya: 1.0,
      confidence_score: 0.97
    },
    {
      id: 'edge_homin_habilis',
      source_id: 'div_hominini',
      target_id: 'tax_homo_habilis',
      branch_length_mya: 2.1,
      confidence_score: 0.98
    },
    {
      id: 'edge_homin_erectus',
      source_id: 'div_hominini',
      target_id: 'tax_homo_erectus',
      branch_length_mya: 2.4,
      confidence_score: 0.99
    },
    {
      id: 'edge_homin_heidel',
      source_id: 'div_hominini',
      target_id: 'tax_homo_heidelbergensis',
      branch_length_mya: 3.6,
      confidence_score: 0.98
    },
    {
      id: 'edge_homin_neanderthal',
      source_id: 'div_hominini',
      target_id: 'tax_neanderthal',
      branch_length_mya: 3.8,
      confidence_score: 0.99
    },
    {
      id: 'edge_homin_human',
      source_id: 'div_hominini',
      target_id: 'tax_homo_sapiens',
      branch_length_mya: 4.2,
      confidence_score: 1.0
    }
  ],

  synonyms: [
    {
      id: 'syn_homo_1',
      source_id: 'tax_homo_sapiens',
      target_id: 'tax_homo_sapiens',
      synonym_name: 'Homo sapiens sapiens',
      source: 'GBIF'
    },
    {
      id: 'syn_lion_1',
      source_id: 'tax_panthera_leo',
      target_id: 'tax_panthera_leo',
      synonym_name: 'Felis leo',
      source: 'GBIF'
    },
    {
      id: 'syn_wolf_1',
      source_id: 'tax_canis_lupus',
      target_id: 'tax_canis_lupus',
      synonym_name: 'Canis lupus lupus',
      source: 'GBIF'
    },
    {
      id: 'syn_trex_1',
      source_id: 'tax_tyrannosaurus',
      target_id: 'tax_tyrannosaurus',
      synonym_name: 'Manospondylus gigas',
      source: 'GBIF'
    },
    {
      id: 'syn_amanita_1',
      source_id: 'tax_amanita_muscaria',
      target_id: 'tax_amanita_muscaria',
      synonym_name: 'Agaricus muscarius',
      source: 'MycoBank'
    },
    {
      id: 'syn_ginkgo_1',
      source_id: 'tax_ginkgo',
      target_id: 'tax_ginkgo',
      synonym_name: 'Salisburia adiantifolia',
      source: 'WFO'
    }
  ]
};
