import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const targets=[
 {id:'github-code',agent:'repo-scout',system:'GITHUB',title:'Agave repository',url:'https://github.com/anza-xyz/agave'},
 {id:'github-releases',agent:'release-radar',system:'GITHUB',title:'Agave releases',url:'https://github.com/anza-xyz/agave/releases'},
 {id:'github-actions',agent:'build-watch',system:'GITHUB',title:'Agave build actions',url:'https://github.com/anza-xyz/agave/actions'},
 {id:'npm-web3',agent:'npm-sentinel',system:'NPM REGISTRY',title:'@solana/web3.js latest JSON',url:'https://registry.npmjs.org/@solana/web3.js/latest'},
 {id:'npm-wallet',agent:'package-linker',system:'NPM REGISTRY',title:'wallet adapter latest JSON',url:'https://registry.npmjs.org/@solana/wallet-adapter-base/latest'},
 {id:'pypi-solana',agent:'pypi-sentinel',system:'PYPI',title:'solana Python package',url:'https://pypi.org/project/solana/'},
 {id:'solscan-wallet',agent:'wallet-observer',system:'SOLANA EXPLORER',title:'Veemo treasury wallet',url:'https://explorer.solana.com/address/BMWnpwFDM5q8zCz4vaAvSj55JWxNhTPaG8ooNdAyTPJM'},
 {id:'explorer-program',agent:'program-watch',system:'SOLANA EXPLORER',title:'System program',url:'https://explorer.solana.com/address/11111111111111111111111111111111'},
 {id:'explorer-network',agent:'chain-listener',system:'SOLANA EXPLORER',title:'Mainnet network',url:'https://explorer.solana.com/'},
 {id:'dex-solana',agent:'market-pulse',system:'DEXSCREENER API',title:'SOL live pair response',url:'https://api.dexscreener.com/latest/dex/search?q=SOL'},
 {id:'github-commits',agent:'commit-trace',system:'GITHUB',title:'web3.js commits',url:'https://github.com/solana-foundation/solana-web3.js/commits/master/'},
 {id:'cross-system',agent:'cross-linker',system:'MULTI SYSTEM',title:'GitHub to package to chain',url:'https://github.com/solana-foundation/solana-web3.js/releases'}
];
const output=path.resolve('assets/live-pages');fs.mkdirSync(output,{recursive:true});
for(const name of fs.readdirSync(output))if(/-frame-\d+\.jpg$/.test(name))fs.rmSync(path.join(output,name),{force:true});
const executablePath=process.env.CHROME_BIN||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/google-chrome');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function inspect(page,step,agent){
 return page.evaluate((step,agent)=>{
  document.getElementById('__veemo_agent_overlay__')?.remove();
  const nodes=[...document.querySelectorAll('a,button,h1,h2,h3,pre,code,[role="row"],table tr,li')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>70&&r.height>12&&s.display!=='none'&&s.visibility!=='hidden'});
  if(!nodes.length)return {action:'READ PAGE',target:document.title||location.hostname,tag:'PAGE'};
  const pick=nodes[Math.min(nodes.length-1,Math.floor((nodes.length-1)*step/3))],tag=pick.tagName,before=pick.getBoundingClientRect();
  scrollTo({top:Math.max(0,scrollY+before.top-innerHeight*.42),left:Math.max(0,scrollX+before.left-innerWidth*.18),behavior:'instant'});
  if(nodes.length===1&&(tag==='PRE'||tag==='CODE'))scrollTo(0,Math.max(0,(document.documentElement.scrollHeight-innerHeight)*step/3));
  const r=pick.getBoundingClientRect(),action=tag==='A'?'FOLLOW LINK':tag==='BUTTON'?'CHECK CONTROL':/H[1-3]/.test(tag)?'READ HEADING':tag==='CODE'||tag==='PRE'?'INSPECT RESPONSE':tag==='TR'||pick.getAttribute('role')==='row'?'INSPECT RECORD':'READ ITEM';
  const raw=(pick.innerText||pick.textContent||pick.getAttribute('aria-label')||tag).replace(/\s+/g,' ').trim(),start=Math.floor(raw.length*step/4),text=raw.slice(start,start+72)||raw.slice(0,72);
  const left=Math.max(3,Math.min(innerWidth-44,r.left-3)),top=Math.max(24,Math.min(innerHeight-44,r.top-3)),width=Math.max(40,Math.min(innerWidth-left-4,r.width+6)),height=Math.max(20,Math.min(innerHeight-top-4,r.height+6));
  const box=document.createElement('div');box.id='__veemo_agent_overlay__';box.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;border:2px solid #ff8757;background:rgba(255,135,87,.08);box-shadow:0 0 0 1px #160804';
  const label=document.createElement('span');label.textContent=agent+' / '+action+' / '+text;label.style.cssText='position:absolute;left:-2px;top:-24px;max-width:520px;padding:5px 7px;background:#ff8757;color:#160804;font:600 10px monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';box.append(label);document.documentElement.append(box);
  return {action,target:text,tag,scrollY:Math.round(scrollY),selector:tag.toLowerCase()}
 },step,agent)
}
async function run(target){
 const profile=path.join(os.tmpdir(),'veemo-real-'+target.id+'-'+Date.now());console.error('capture start:',target.id);
 let browser;
 try{
  browser=await puppeteer.launch({executablePath,headless:true,userDataDir:profile,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--hide-scrollbars']});
  const page=await browser.newPage();await page.setViewport({width:1280,height:800,deviceScaleFactor:1});
  await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:45000});await sleep(5000);
  const frames=[],observations=[];
  for(let step=0;step<4;step++){const observation=await inspect(page,step,target.agent);observations.push(observation);await sleep(550);const name=target.id+'-frame-'+step+'.jpg';await page.screenshot({path:path.join(output,name),type:'jpeg',quality:76,captureBeyondViewport:false});frames.push('assets/live-pages/'+name)}
  return {...target,ok:true,image:frames[0],frames,observations}
 }catch(error){console.error('capture failed:',target.id,error.message);return {...target,ok:false,error:error.message,image:'assets/live-pages/'+target.id+'.png',frames:[],observations:[]}}
 finally{if(browser)await browser.close().catch(()=>{});try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
}
const activeTargets=process.env.VEEMO_CAPTURE_ONE?targets.slice(0,1):targets,results=[];
for(let i=0;i<activeTargets.length;i+=2)results.push(...await Promise.all(activeTargets.slice(i,i+2).map(run)));
const manifest={capturedAt:new Date().toISOString(),refreshMinutes:15,mode:'real-browser-dom-trace',streams:results};
fs.writeFileSync(path.join(output,'manifest.js'),'window.VEEMO_PAGE_STREAMS='+JSON.stringify(manifest)+';\n');console.log(JSON.stringify(manifest,null,2));
