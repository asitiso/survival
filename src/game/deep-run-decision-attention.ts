export interface DeepRunDecisionAttentionInput{
  bossActive:boolean;
  mythicActive:boolean;
  heroCritical:boolean;
  coreCritical:boolean;
  activeContract:boolean;
  activeOath:boolean;
  ascensionCount:number;
}
export interface DeepRunDecisionAttentionPolicy{
  dangerPriority:boolean;
  showContractProgress:boolean;
  showOathProgress:boolean;
  showAscensionRecall:boolean;
  maxAscensionIcons:0|1|2|3;
  preserveCriticalBars:true;
  preserveDangerTelegraphs:true;
}

export function deepRunDecisionAttention(input:DeepRunDecisionAttentionInput):DeepRunDecisionAttentionPolicy{
  const count=Math.max(0,Math.min(3,Math.floor(Number.isFinite(input.ascensionCount)?input.ascensionCount:0)));
  const dangerPriority=Boolean(input.mythicActive||input.heroCritical||input.coreCritical);
  const progressActive=Boolean(input.activeContract||input.activeOath);
  const maxAscensionIcons=(dangerPriority?0:input.bossActive?Math.min(1,count):progressActive?Math.min(2,count):count) as 0|1|2|3;
  return{
    dangerPriority,
    showContractProgress:Boolean(input.activeContract),
    showOathProgress:Boolean(input.activeOath),
    showAscensionRecall:maxAscensionIcons>0,
    maxAscensionIcons,
    preserveCriticalBars:true,
    preserveDangerTelegraphs:true,
  };
}
