import { ACTION_BUTTONS } from './config.js';
import { SPAWN_LANE_EDGE_LABEL_FADE_SECONDS, spawnLaneEdgeLabelFade } from './spawn-lane-edge-label-fade.js';
export interface SpawnLaneEdgeLabelFadeAudit{passed:boolean;samples:string[];actionCount:number;presentationOnly:true;gameplayFormulaMutation:false;snapshotSchemaMutation:false;}
export function runSpawnLaneEdgeLabelFadeAudit():SpawnLaneEdgeLabelFadeAudit{
  const samples:string[]=[];let passed=SPAWN_LANE_EDGE_LABEL_FADE_SECONDS>.12&&SPAWN_LANE_EDGE_LABEL_FADE_SECONDS<.4;
  for(let i=0;i<64;i++){
    const ttl=(i%8)/7*SPAWN_LANE_EDGE_LABEL_FADE_SECONDS*1.5;const alpha=.58;
    const r=spawnLaneEdgeLabelFade({count:i%5===0?1:3,alpha,remainingTtl:ttl});
    const expected=i%5===0||ttl<=0?0:alpha*Math.min(1,ttl/SPAWN_LANE_EDGE_LABEL_FADE_SECONDS);
    const ok=r.presentationOnly&&r.gameplayMutation===false&&Math.abs(r.labelAlpha-expected)<.0001&&r.visible===(expected>.01);
    passed&&=ok;samples.push(`${i}:${ttl.toFixed(3)}:${r.labelAlpha.toFixed(3)}:${r.visible?1:0}`);
  }
  return{passed,samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true,gameplayFormulaMutation:false,snapshotSchemaMutation:false};
}
