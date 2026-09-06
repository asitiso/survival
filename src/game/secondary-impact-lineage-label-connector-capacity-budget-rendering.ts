import type { PresentationQuality } from './presentation-budget.js';
export function secondaryImpactLineageLabelConnectorCapacityBudget(quality:PresentationQuality='high'){const maxVisible=quality==='low'?1:2;return{quality,maxVisible,hidesLabels:false as const,presentationOnly:true as const};}
