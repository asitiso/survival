import { chooseSpellTarget, type SpellTargetCandidate } from './auto-targeting.js';
import { autoWeakpointAimPoint } from './auto-weakpoint-aim.js';
function enemy(id:number,x:number,target:'hero'|'core'='hero'):SpellTargetCandidate{return{id,type:'elite',pos:{x,y:0},target,hp:100,maxHp:100,alive:true};}
export interface AutoTransitionLatencyAudit{passed:boolean;targetFrames:number;weakpointFrames:number;intentionalSwitches:number;unnecessarySwitches:number;materialSwitchLatencyFrames:number;coreThreatSwitchLatencyFrames:number;weakpointSwitchLatencyFrames:number;maxSwitchesPerSecond:number;issues:string[];}
export function auditAutoTransitionLatency():AutoTransitionLatencyAudit{
  const hero={x:0,y:0},core={x:700,y:0};let preferred:number|null=null,last:number|null=null,switches=0,unnecessarySwitches=0,materialFrame=-1,switchFrame=-1;
  for(let frame=0;frame<120;frame++){
    const challengerX=360-frame*2,one=enemy(1,260),two=enemy(2,challengerX);const material=.52*(260-challengerX)>=48;
    if(material&&materialFrame<0)materialFrame=frame;
    const chosen:SpellTargetCandidate|null=chooseSpellTarget([one,two],hero,core,true,preferred);const id:number|null=chosen?.id??null;
    if(last!==null&&id!==last){switches++;if(materialFrame<0)unnecessarySwitches++;if(id===2&&switchFrame<0)switchFrame=frame;}
    preferred=id;last=id;
  }
  const materialSwitchLatencyFrames=materialFrame>=0&&switchFrame>=0?Math.max(0,switchFrame-materialFrame):99;
  let corePreferred:number|null=1,coreSwitch=-1,coreMaterial=30;
  for(let frame=0;frame<60;frame++){
    const one=enemy(1,250),two=enemy(2,430,frame>=coreMaterial?'core':'hero');const chosen:SpellTargetCandidate|null=chooseSpellTarget([one,two],hero,core,true,corePreferred);corePreferred=chosen?.id??null;if(frame>=coreMaterial&&corePreferred===2&&coreSwitch<0)coreSwitch=frame;
  }
  const coreThreatSwitchLatencyFrames=coreSwitch>=0?coreSwitch-coreMaterial:99;
  const boss={id:10,type:'boss' as const,pos:{x:300,y:0}};let weakLastX:number|null=null,weakSwitch=-1;
  for(let frame=0;frame<60;frame++){
    const nodes=[{id:1,pos:{x:280,y:20},hp:60,maxHp:100,alive:true,radius:20},{id:2,pos:{x:330,y:-20},hp:frame<30?80:40,maxHp:100,alive:true,radius:20}];const aim=autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:hero,activeBossId:10,nodes});
    if(weakLastX!==null&&aim&&aim.x!==weakLastX&&weakSwitch<0)weakSwitch=frame;weakLastX=aim?.x??null;
  }
  const weakpointSwitchLatencyFrames=weakSwitch>=0?weakSwitch-30:99;const intentionalSwitches=switches+(coreSwitch>=0?1:0)+(weakSwitch>=0?1:0);const maxSwitchesPerSecond=Math.max(switches/2,coreSwitch>=0?1:0,weakSwitch>=0?1:0);const issues:string[]=[];
  if(unnecessarySwitches)issues.push('target-flicker');if(materialSwitchLatencyFrames>1)issues.push('material-switch-latency');if(coreThreatSwitchLatencyFrames>1)issues.push('core-switch-latency');if(weakpointSwitchLatencyFrames>1)issues.push('weakpoint-switch-latency');if(maxSwitchesPerSecond>2)issues.push('switch-frequency');
  return{passed:issues.length===0,targetFrames:120,weakpointFrames:60,intentionalSwitches,unnecessarySwitches,materialSwitchLatencyFrames,coreThreatSwitchLatencyFrames,weakpointSwitchLatencyFrames,maxSwitchesPerSecond,issues};
}
