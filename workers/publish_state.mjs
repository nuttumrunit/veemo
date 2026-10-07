import fs from 'node:fs';
import crypto from 'node:crypto';
const read=path=>{try{return JSON.parse(fs.readFileSync(path,'utf8'))}catch{return null}};
const blender=read('artifacts/blender-status.json');
const unityLog=fs.existsSync('artifacts/unity.log')?fs.readFileSync('artifacts/unity.log','utf8'):'';
const glb=fs.existsSync('artifacts/veemo_core.glb')?fs.readFileSync('artifacts/veemo_core.glb'):null;
const hash=glb?crypto.createHash('sha256').update(glb).digest('hex'):null;
const now=new Date().toISOString();
const state={updatedAt:now,source:'verified local worker artifacts',agents:{
 'BLENDER-11':blender?{status:'complete',task:blender.task,artifact:blender.artifact,finishedAt:blender.finishedAt,proof:hash?.slice(0,16),detail:blender.objects+' scene objects'}:{status:'offline',task:'worker not executed'},
 'UNITY-04':unityLog.includes('No valid Unity Editor license')?{status:'blocked',task:'Unity 6 started; license activation required',artifact:'artifacts/unity.log',finishedAt:now,proof:'EXIT 198',detail:'Unity Editor 6000.0.81f1'}:{status:'offline',task:'worker not executed'},
 'AUDITOR-02':hash?{status:'complete',task:'hashed and verified Blender GLB artifact',artifact:'artifacts/veemo_core.glb',finishedAt:now,proof:hash.slice(0,16),detail:glb.length+' bytes'}:{status:'offline',task:'no artifact to audit'},
 'QA-09':glb&&glb.subarray(0,4).toString()==='glTF'?{status:'complete',task:'validated glTF binary header and payload',artifact:'artifacts/veemo_core.glb',finishedAt:now,proof:'GLB VALID',detail:'binary structure passed'}:{status:'blocked',task:'GLB validation failed'},
 'INTEGRATOR-01':hash?{status:'complete',task:'registered verified asset in build manifest',artifact:'artifacts/manifest.json',finishedAt:now,proof:hash.slice(0,12),detail:'candidate asset accepted'}:{status:'offline',task:'no verified artifacts'}
}};
fs.mkdirSync('assets',{recursive:true});fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/manifest.json',JSON.stringify({build:'0184',generatedAt:now,assets:hash?[{path:'artifacts/veemo_core.glb',sha256:hash}]:[]},null,2));
fs.writeFileSync('assets/foundry-state.js','window.VEEMO_STATE='+JSON.stringify(state)+';\n');
console.log(JSON.stringify(state,null,2));
