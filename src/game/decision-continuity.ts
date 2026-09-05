export type DecisionKind='fate'|'heroAscension'|'runContract'|'bossReward'|'levelUp';

export interface DecisionPendingState{
  fate:boolean;
  heroAscension:boolean;
  runContract:boolean;
  bossRewardCount:number;
  levelUpCount:number;
}

export const DECISION_TRANSITION_BARRIER_MS=160;

export function nextDecisionKind(state:DecisionPendingState):DecisionKind|null{
  if(state.fate)return'fate';
  if(state.heroAscension)return'heroAscension';
  if(state.runContract)return'runContract';
  if(state.bossRewardCount>0)return'bossReward';
  if(state.levelUpCount>0)return'levelUp';
  return null;
}

export class DecisionPickGuard{
  private generation=0;
  private activeGeneration=0;
  private consumedGeneration=0;
  private blockedUntilMs=0;

  render(nowMs:number,transition:boolean):number{
    const generation=++this.generation;
    this.activeGeneration=generation;
    this.consumedGeneration=0;
    if(transition)this.blockedUntilMs=Math.max(this.blockedUntilMs,nowMs+DECISION_TRANSITION_BARRIER_MS);
    return generation;
  }

  accept(generation:number,nowMs:number):boolean{
    if(generation!==this.activeGeneration||generation===this.consumedGeneration||nowMs<this.blockedUntilMs)return false;
    this.consumedGeneration=generation;
    return true;
  }

  resetTransient(nowMs:number):void{
    this.generation+=1;
    this.activeGeneration=0;
    this.consumedGeneration=0;
    this.blockedUntilMs=Math.max(this.blockedUntilMs,nowMs+DECISION_TRANSITION_BARRIER_MS);
  }
}
