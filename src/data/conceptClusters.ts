import { ConceptCluster, QuestionItem, EnhancedQuestion } from '../types/quiz';

export interface ClusterInfo {
  id: ConceptCluster;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  themeColor: string;
}

export const CONCEPT_CLUSTERS: ClusterInfo[] = [
  {
    id: 'Geomorphology & Hydrology',
    name: 'Geomorphology & Hydrology',
    shortName: 'Geomorph & Water',
    description: 'Earth crust dynamics, rock cycles, chemical weathering, drainage basins, and soil horizons.',
    icon: 'mountain',
    themeColor: '#3B82F6', // Blue
  },
  {
    id: 'Biogeography & Island Theory',
    name: 'Biogeography & Island Theory',
    shortName: 'Biogeography',
    description: 'Species dispersal types, Humboldtian geography, MacArthur-Wilson island equilibrium, and ocean biomes.',
    icon: 'compass',
    themeColor: '#10B981', // Emerald
  },
  {
    id: 'Protected Areas & IUCN',
    name: 'Protected Areas & IUCN',
    shortName: 'Protected Areas',
    description: 'Reserve geometry, SLOSS debate, core-buffer zoning, wildlife corridors, and sanctuary designations.',
    icon: 'shield-check',
    themeColor: '#8B5CF6', // Purple
  },
  {
    id: 'Remote Sensing & GIS',
    name: 'Remote Sensing & GIS',
    shortName: 'RS & Geoinformatics',
    description: 'Electromagnetic sensors, multispectral indices (NDVI/EVI), LiDAR elevation models, and spatial analytics.',
    icon: 'satellite',
    themeColor: '#F59E0B', // Amber
  },
  {
    id: 'Biodiversity Metrics & Ecology',
    name: 'Biodiversity Metrics & Ecology',
    shortName: 'Ecology & Metrics',
    description: 'Alpha/Beta/Gamma diversity, allelopathy, ecological succession stages, carrying capacity, and demography.',
    icon: 'dna',
    themeColor: '#06B6D4', // Cyan
  },
  {
    id: 'Conservation Policy & Red List',
    name: 'Conservation Policy & Red List',
    shortName: 'Policy & Red List',
    description: 'Environmental impact assessments, linear infrastructure barriers, resource extraction, and sustainability laws.',
    icon: 'scale',
    themeColor: '#F43F5E', // Rose
  },
];

// Curated Cognitive Hooks & Core Concept Summaries for the 120 Questions
export const QUESTION_COGNITIVE_MAP: Record<string, { clusterTag: ConceptCluster; keywordHook: string; coreConcept: string }> = {
  // --- WEEK 1: Foundations of Geography ---
  'w1_q1': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Regular, seasonal movement ➔ Migration',
    coreConcept: 'Migration is the cyclical, predictable return journey between distinct geographic zones, unlike permanent dispersal.'
  },
  'w1_q2': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Systematic Geography ➔ Humboldt',
    coreConcept: 'Alexander von Humboldt pioneered the empirical systematic approach to physical geography and plant distributions.'
  },
  'w1_q3': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Chemical plant inhibition ➔ Allelopathy',
    coreConcept: 'Teak and walnut trees exude biochemical allelochemicals into soil to suppress competition from understory plants.'
  },
  'w1_q4': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Polluted lake carrying capacity ➔ Degradation',
    coreConcept: 'Habitat degradation lowers resource quality and biomass support without necessarily decreasing physical boundary area.'
  },
  'w1_q5': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Island colonization over barriers ➔ Jump Dispersal',
    coreConcept: 'Jump dispersal involves crossing an inhospitable barrier in an individual lifetime (e.g. sweepstakes rafting to islands).'
  },
  'w1_q6': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Physical weathering in deserts ➔ Exfoliation / Insolation',
    coreConcept: 'Diurnal thermal expansion and contraction cause surface rock layers to peel away like onion skins.'
  },
  'w1_q7': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Liebig’s Law ➔ Scarcest Resource',
    coreConcept: 'Plant growth is governed not by total resources available, but by the single essential nutrient in shortest supply.'
  },
  'w1_q8': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Regional Geography founder ➔ Karl Ritter',
    coreConcept: 'Karl Ritter championed regional comparative geography, complementing Humboldt’s systematic approach.'
  },
  'w1_q9': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Climatology foundation ➔ Meteorology',
    coreConcept: 'Climatology evaluates statistical long-term trends derived from real-time atmospheric physics of meteorology.'
  },
  'w1_q10': {
    clusterTag: 'Conservation Policy & Red List',
    keywordHook: 'Favorable climate ➔ Pull Factor',
    coreConcept: 'Benign environmental factors act as positive attractors (pulls) for both human settlement and wildlife congregation.'
  },

  // --- WEEK 2: Earth History & Geology ---
  'w2_q1': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Pangaea supercontinent ocean ➔ Panthalassa',
    coreConcept: 'Panthalassa was the vast global ocean that surrounded the Paleozoic supercontinent Pangaea.'
  },
  'w2_q2': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Continental drift mechanism ➔ Convection Currents',
    coreConcept: 'Thermal convection currents inside the asthenosphere drive tectonic plate motions across the lithosphere.'
  },
  'w2_q3': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Deccan Traps formation ➔ Flood Basalt Volcanism',
    coreConcept: 'The Deccan Traps originated from massive Cretaceous mantle plume eruptions through fissures in western India.'
  },
  'w2_q4': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Earth’s densest layer ➔ Inner Core',
    coreConcept: 'Solid nickel-iron (Nife) subject to immense gravitational pressure yields the highest planetary density in the inner core.'
  },
  'w2_q5': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Mohorovičić Discontinuity ➔ Crust-Mantle Boundary',
    coreConcept: 'The Moho marks the abrupt jump in seismic P-wave velocity separating the crust from the denser peridotite mantle.'
  },

  // --- WEEK 3: Rocks, Minerals & Weathering ---
  'w3_q1': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Granite transformation ➔ Gneiss',
    coreConcept: 'High regional metamorphic temperature and directed pressure segregate granite minerals into banded gneiss.'
  },
  'w3_q2': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Limestone dissolution landscape ➔ Karst Topography',
    coreConcept: 'Carbonic acid in groundwater dissolves calcium carbonate, sculpting sinkholes, stalactites, and caves.'
  },
  'w3_q3': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Feldspar weathering ➔ Kaolinite Clay',
    coreConcept: 'Hydrolysis chemically alters orthoclase feldspar in igneous rocks into hydrated aluminum silicate clay (kaolinite).'
  },
  'w3_q4': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Basaltic lava texture ➔ Fine-grained (Aphanitic)',
    coreConcept: 'Rapid surface cooling of extrusive lava prevents large crystals from nucleating, producing a fine-grained texture.'
  },
  'w3_q5': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Biological weathering agent ➔ Lichen Acid Exudation',
    coreConcept: 'Lichens release organic chelating acids that etch bare mineral rock surfaces, initiating primary succession.'
  },

  // --- WEEK 4: Climate & Atmospheric Dynamics ---
  'w4_q1': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Coriolis deflection in North ➔ Right / Clockwise',
    coreConcept: 'Earth’s eastward rotation deflects moving atmospheric fluids to the right in the Northern Hemisphere.'
  },
  'w4_q2': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'ITCZ convergence ➔ Trade Winds Meet',
    coreConcept: 'The Intertropical Convergence Zone is the equatorial low-pressure trough where trade winds converge, producing torrential rains.'
  },
  'w4_q3': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Rain shadow formation ➔ Leeward Mountain Slope',
    coreConcept: 'Adiabatic descending air on leeward slopes warms and dries, depriving valleys of precipitation.'
  },
  'w4_q4': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Atmospheric layer with weather ➔ Troposphere',
    coreConcept: 'Contains 75% of atmospheric mass and virtually all water vapor, driving all cloud formation and weather.'
  },

  // --- WEEK 5: Oceanography & Marine Habitats ---
  'w5_q1': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Ocean upwelling zones ➔ High Nutrient Productivity',
    coreConcept: 'Offshore wind drives surface water away, drawing cold, nitrate- and phosphate-rich deep water to fuel phytoplankton.'
  },
  'w5_q2': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Coral reef optimal temperature ➔ 23°C – 29°C',
    coreConcept: 'Hermaphoric reef-building corals depend on symbiotic zooxanthellae that bleach under sustained thermal extremes.'
  },
  'w5_q3': {
    clusterTag: 'Biogeography & Island Theory',
    keywordHook: 'Mangrove salt adaptation ➔ Pneumatophores / Vivipary',
    coreConcept: 'Aerial roots (pneumatophores) allow respiration in anaerobic mud, while viviparous seeds sprout before dropping.'
  },

  // --- WEEK 6: Drainage Networks & Indian Climatology ---
  'w6_q1': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Meander cutoff ➔ Oxbow Lake',
    coreConcept: 'Erosion on concave outer banks and neck breaching cuts off an abandoned river bend into a crescent oxbow lake.'
  },
  'w6_q2': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Dendritic drainage ➔ Tree-branching Uniform Rock',
    coreConcept: 'Dendritic drainage forms on homogenous, horizontally bedded substrate resembling leaf veins or tree branches.'
  },
  'w6_q3': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Southwest Monsoon onset ➔ Kerala Coast',
    coreConcept: 'The Arabian Sea branch of the Indian summer monsoon first impacts the Western Ghats along Kerala in early June.'
  },

  // --- WEEK 7: Soils & Ecological Climax ---
  'w7_q1': {
    clusterTag: 'Geomorphology & Hydrology',
    keywordHook: 'Black Cotton Soil (Regur) ➔ Montmorillonite Swelling',
    coreConcept: 'Derived from Deccan basalt weathering; high clay content swells when wet and shrinks with deep cracking when dry.'
  },
  'w7_q2': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Soil top organic layer ➔ O-Horizon',
    coreConcept: 'The uppermost layer consisting of decomposed leaf litter and humus, critical for nutrient cycling and moisture retention.'
  },
  'w7_q3': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Ecological climax state ➔ Dynamic Equilibrium',
    coreConcept: 'The final, stable community in ecological succession that remains in steady-state balance with regional climate.'
  },

  // --- WEEK 8: Conservation Biology & Reserve Design ---
  'w8_q1': {
    clusterTag: 'Protected Areas & IUCN',
    keywordHook: 'SLOSS Debate ➔ Single Large or Several Small',
    coreConcept: 'Weighs whether one large contiguous reserve or multiple small reserves of equal area minimizes extinction rates.'
  },
  'w8_q2': {
    clusterTag: 'Protected Areas & IUCN',
    keywordHook: 'Edge Effect ➔ Higher Predation & Desiccation',
    coreConcept: 'Boundary zones between forest and cleared land experience higher light, wind, invasive species, and microclimate shifts.'
  },
  'w8_q3': {
    clusterTag: 'Protected Areas & IUCN',
    keywordHook: 'Corridor function ➔ Gene Flow & Dispersal',
    coreConcept: 'Linear landscape strips connect isolated habitat patches, maintaining metapopulation genetic exchange.'
  },
  'w8_q4': {
    clusterTag: 'Protected Areas & IUCN',
    keywordHook: 'IUCN Category II ➔ National Park',
    coreConcept: 'Managed primarily for ecosystem protection and non-consumptive scientific/recreational use; no commercial forestry.'
  },

  // --- WEEK 9: Demography & Sustainability ---
  'w9_q1': {
    clusterTag: 'Conservation Policy & Red List',
    keywordHook: 'Carrying Capacity (K) ➔ Maximum Sustainable Population',
    coreConcept: 'The ceiling population size that an environment’s finite resources can indefinitely support without degradation.'
  },
  'w9_q2': {
    clusterTag: 'Biodiversity Metrics & Ecology',
    keywordHook: 'Demographic Transition Stage 2 ➔ High Birth, Rapidly Falling Death',
    coreConcept: 'Public sanitation and antibiotics slash mortality while birth rates stay high, leading to explosive population growth.'
  },

  // --- WEEK 10: Land Use & Natural Resources ---
  'w10_q1': {
    clusterTag: 'Conservation Policy & Red List',
    keywordHook: 'Shifting cultivation ➔ Jhumming / Slash-and-Burn',
    coreConcept: 'Forest plots are cleared and burned for short-term agriculture, historically sustainable only under lengthy fallow periods.'
  },
  'w10_q2': {
    clusterTag: 'Conservation Policy & Red List',
    keywordHook: 'Overgrazing impact ➔ Soil Compaction & Runoff',
    coreConcept: 'Excessive livestock trampling crushes pore spaces, reducing infiltration and accelerating topsoil gully erosion.'
  },

  // --- WEEK 11: Transport, Infrastructure & Barriers ---
  'w11_q1': {
    clusterTag: 'Protected Areas & IUCN',
    keywordHook: 'Linear infrastructure mitigation ➔ Eco-ducts / Underpasses',
    coreConcept: 'Constructing dedicated overpasses or culverts with natural vegetation lets wildlife cross highways without vehicular mortality.'
  },
  'w11_q2': {
    clusterTag: 'Conservation Policy & Red List',
    keywordHook: 'Railway barrier effect ➔ Population Fragmentation',
    coreConcept: 'Fencing and high-speed rail lines prevent large mammal crossings, severing ancestral migration routes.'
  },

  // --- WEEK 12: Geoinformatics, LiDAR & Remote Sensing ---
  'w12_q1': {
    clusterTag: 'Remote Sensing & GIS',
    keywordHook: 'NDVI Index ➔ (NIR - Red) / (NIR + Red)',
    coreConcept: 'Chlorophyll absorbs red light while spongy mesophyll strongly reflects near-infrared; high positive NDVI indicates dense canopy.'
  },
  'w12_q2': {
    clusterTag: 'Remote Sensing & GIS',
    keywordHook: 'LiDAR primary sensor ➔ Pulsed Laser Time-of-Flight',
    coreConcept: 'LiDAR fires thousands of laser pulses per second to penetrate forest canopy and generate precise digital elevation models (DEM).'
  },
  'w12_q3': {
    clusterTag: 'Remote Sensing & GIS',
    keywordHook: 'Spatial Resolution ➔ Ground Area Per Pixel',
    coreConcept: 'Smaller ground sampling distance (e.g. 1m vs 30m) resolves finer landscape details such as individual tree crowns.'
  },
  'w12_q4': {
    clusterTag: 'Remote Sensing & GIS',
    keywordHook: 'Raster data model ➔ Grid of Georeferenced Cells',
    coreConcept: 'Continuous variables like elevation, temperature, and NDVI are natively stored as pixel matrices rather than vector polygons.'
  },
  'w12_q5': {
    clusterTag: 'Remote Sensing & GIS',
    keywordHook: 'Thermal infrared band ➔ Surface Temperature Anomaly',
    coreConcept: 'Emitted thermal radiation (8-14 micrometers) identifies forest fire hotspots and urban heat islands day or night.'
  },
};

/**
 * Intelligent helper to categorize and enhance any question with cognitive metadata
 */
export function enhanceQuestion(q: QuestionItem): EnhancedQuestion {
  // If direct lookup exists
  const known = QUESTION_COGNITIVE_MAP[q.id];
  if (known) {
    return {
      ...q,
      clusterTag: known.clusterTag,
      keywordHook: known.keywordHook,
      coreConcept: known.coreConcept,
    };
  }

  // Derive cluster tag based on topicTag or weekNumber
  let cluster: ConceptCluster = 'Geomorphology & Hydrology';
  const tagLower = (q.topicTag || '').toLowerCase();
  const textLower = (q.questionText || '').toLowerCase();

  if (q.weekNumber === 12 || tagLower.includes('remote') || tagLower.includes('gis') || tagLower.includes('lidar') || tagLower.includes('satellite') || textLower.includes('ndvi') || textLower.includes('pixel')) {
    cluster = 'Remote Sensing & GIS';
  } else if (q.weekNumber === 8 || tagLower.includes('reserve') || tagLower.includes('iucn') || tagLower.includes('sanctuary') || textLower.includes('protected') || textLower.includes('sloss')) {
    cluster = 'Protected Areas & IUCN';
  } else if (q.weekNumber === 1 || q.weekNumber === 5 || tagLower.includes('biogeography') || tagLower.includes('dispersal') || tagLower.includes('ocean') || textLower.includes('island') || textLower.includes('migration')) {
    cluster = 'Biogeography & Island Theory';
  } else if (q.weekNumber === 11 || q.weekNumber === 10 || tagLower.includes('policy') || tagLower.includes('resource') || textLower.includes('conservation') || textLower.includes('act')) {
    cluster = 'Conservation Policy & Red List';
  } else if (q.weekNumber === 4 || q.weekNumber === 9 || tagLower.includes('ecology') || tagLower.includes('metric') || tagLower.includes('diversity') || textLower.includes('population')) {
    cluster = 'Biodiversity Metrics & Ecology';
  } else {
    cluster = 'Geomorphology & Hydrology';
  }

  // Extract high-yield 2-word trigger from question text
  const cleanFirstWords = q.questionText.replace(/[^a-zA-Z0-9\s]/g, '').split(' ').filter(w => w.length > 3).slice(0, 3).join(' ');
  const targetOption = q.options.find(o => o.label.toLowerCase() === q.correctOption.toLowerCase());
  const answerSummary = targetOption ? targetOption.text.slice(0, 28) : 'Verified Answer';

  return {
    ...q,
    clusterTag: cluster,
    keywordHook: `${cleanFirstWords} ➔ ${answerSummary}`,
    coreConcept: q.explanation || 'Verified physical principle testing core conservation criteria in this module.',
  };
}

export function enhanceAllQuestions(questions: QuestionItem[]): EnhancedQuestion[] {
  return questions.map(enhanceQuestion);
}
