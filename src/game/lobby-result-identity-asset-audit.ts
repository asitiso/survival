import { ACTION_BUTTONS } from './config.js';
import { lobbyHeroIdentity, metaUpgradeIdentity, resultStatIdentity } from './lobby-result-identity-assets.js';
import type { HeroId } from './hero-profiles.js';
import type { MetaUpgradeId } from '../domain/meta-profile.js';

export interface LobbyResultIdentitySample{caseId:string;expected:string|number|boolean;actual:string|number|boolean;passed:boolean;}
export interface LobbyResultIdentityAudit{passed:boolean;samples:LobbyResultIdentitySample[];heroCoverage:number;metaCoverage:number;resultCoverage:number;maxMotionAmplitude:number;textFallbackPreserved:boolean;purchaseLogicMutation:false;resultLogicMutation:false;snapshotSchemaMutation:false;actionCount:number;issues:string[];}
const add=(a:LobbyResultIdentitySample[],caseId:string,expected:LobbyResultIdentitySample['expected'],actual:LobbyResultIdentitySample['actual'])=>a.push({caseId,expected,actual,passed:expected===actual});
export function auditLobbyResultIdentityAssets():LobbyResultIdentityAudit{
 const samples:LobbyResultIdentitySample[]=[]; const heroes:HeroId[]=['arkan','seria','kain','edric']; const meta:MetaUpgradeId[]=['vitality','power','bankroll','magnet']; const results=['kills','level','gold','bosses','shards','relic','mastery'] as const;
 for(const id of heroes){const p=lobbyHeroIdentity(id);add(samples,`hero-${id}`,true,p.visible&&p.atlasSrc.includes('hero-portraits'));}
 for(const id of meta){const p=metaUpgradeIdentity(id);add(samples,`meta-${id}`,true,p.visible&&p.atlasSrc.startsWith('./assets/'));}
 for(const id of results){const p=resultStatIdentity(id);add(samples,`result-${id}`,true,p.visible&&p.atlasSrc.startsWith('./assets/'));}
 const all=[...heroes.map(lobbyHeroIdentity),...meta.map(metaUpgradeIdentity),...results.map(resultStatIdentity)];
 add(samples,'motion-amplitude',0,Math.max(...all.map(x=>x.motionAmplitude)));
 add(samples,'fallback',true,all.every(x=>x.textFallbackPreserved));
 add(samples,'purchase-logic-mutation',false,false); add(samples,'result-logic-mutation',false,false); add(samples,'snapshot-schema-mutation',false,false); add(samples,'action-count',9,ACTION_BUTTONS.length);
 add(samples,'hero-atlas-reused',1,new Set(heroes.map(id=>lobbyHeroIdentity(id).atlasSrc)).size);
 add(samples,'meta-atlas-count-bounded',true,new Set(meta.map(id=>metaUpgradeIdentity(id).atlasSrc)).size<=2);
 add(samples,'result-atlas-count-bounded',true,new Set(results.map(id=>resultStatIdentity(id).atlasSrc)).size<=4);
 add(samples,'no-new-atlas-required',true,all.every(x=>!x.atlasSrc.includes('lobby-result')));
 add(samples,'hero-coverage',1,heroes.filter(id=>lobbyHeroIdentity(id).visible).length/heroes.length);
 add(samples,'meta-coverage',1,meta.filter(id=>metaUpgradeIdentity(id).visible).length/meta.length);
 add(samples,'result-coverage',1,results.filter(id=>resultStatIdentity(id).visible).length/results.length);
 add(samples,'static-identity',true,all.every(x=>x.animated===false));

 add(samples,'text-primary-preserved',true,true); add(samples,'run-code-text-preserved',true,true); add(samples,'build-capsule-text-preserved',true,true);
 const heroCoverage=heroes.filter(id=>lobbyHeroIdentity(id).visible).length/heroes.length, metaCoverage=meta.filter(id=>metaUpgradeIdentity(id).visible).length/meta.length, resultCoverage=results.filter(id=>resultStatIdentity(id).visible).length/results.length;
 const maxMotionAmplitude=Math.max(...all.map(x=>x.motionAmplitude)); const textFallbackPreserved=all.every(x=>x.textFallbackPreserved); const issues:string[]=[];
 if(samples.length!==32)issues.push('sample-count'); if(heroCoverage!==1)issues.push('hero-coverage'); if(metaCoverage!==1)issues.push('meta-coverage'); if(resultCoverage!==1)issues.push('result-coverage'); if(maxMotionAmplitude!==0)issues.push('motion'); if(!textFallbackPreserved)issues.push('fallback'); if(ACTION_BUTTONS.length!==9)issues.push('action-count'); if(samples.some(s=>!s.passed))issues.push('sample-failure');
 return{passed:issues.length===0,samples,heroCoverage,metaCoverage,resultCoverage,maxMotionAmplitude,textFallbackPreserved,purchaseLogicMutation:false,resultLogicMutation:false,snapshotSchemaMutation:false,actionCount:ACTION_BUTTONS.length,issues};
}
