import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const targets=[
 {id:'github-code',agent:'repo-scout',system:'GITHUB',title:'Agave repository',url:'https://github.com/anza-xyz/agave'},
 {id:'npm-web3',agent:'npm-sentinel',system:'NPM REGISTRY',title:'@solana/web3.js latest JSON',url:'https://registry.npmjs.org/@solana/web3.js/latest'},
 {id:'solscan-wallet',agent:'wallet-observer',system:'SOLANA EXPLORER',title:'Veemo treasury wallet',url:'https://explorer.solana.com/address/BMWnpwFDM5q8zCz4vaAvSj55JWxNhTPaG8ooNdAyTPJM'},
 {id:'dex-solana',agent:'market-pulse',system:'DEXSCREENER API',title:'SOL live pair response',url:'https://api.dexscreener.com/latest/dex/search?q=SOL'},
 {id:'pypi-solana',agent:'pypi-sentinel',system:'PYPI',title:'solana Python package',url:'https://pypi.org/project/solana/'},
 {id:'status-solana',agent:'network-health',system:'SOLANA STATUS',title:'Solana network status',url:'https://status.solana.com/'},
 {id:'github-actions',agent:'build-watch',system:'GITHUB ACTIONS',title:'Agave build actions',url:'https://github.com/anza-xyz/agave/actions'},
 {id:'go-solana',agent:'go-module-watch',system:'GO PACKAGES',title:'solana-go module',url:'https://pkg.go.dev/github.com/gagliardetto/solana-go'},
 {id:'explorer-program',agent:'program-watch',system:'SOLANA EXPLORER',title:'System program',url:'https://explorer.solana.com/address/11111111111111111111111111111111'},
 {id:'coingecko-solana',agent:'asset-oracle',system:'COINGECKO API',title:'Solana asset response',url:'https://api.coingecko.com/api/v3/coins/solana'},
 {id:'solana-docs',agent:'protocol-reader',system:'SOLANA DOCS',title:'Solana account model',url:'https://solana.com/docs/core/accounts'},
 {id:'defi-solana',agent:'defi-linker',system:'DEFILLAMA API',title:'Solana protocol response',url:'https://api.llama.fi/protocol/solana'}
];
const output=path.resolve('assets/live-pages');fs.mkdirSync(output,{recursive:true});
const activePrefixes=targets.map(target=>target.id+'-frame-');
for(const name of fs.readdirSync(output))if(/-frame-\d+\.jpg$/.test(name)&&!activePrefixes.some(prefix=>name.startsWith(prefix)))fs.rmSync(path.join(output,name),{force:true});
const executablePath=process.env.CHROME_BIN||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/google-chrome');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function inspect(page,step,agent){
 return page.evaluate(async(step,agent)=>{
  document.getElementById('__veemo_agent_overlay__')?.remove();
  const nodes=[...document.querySelectorAll('main a,main button,main h1,main h2,main h3,main pre,main code,pre,code,[role="row"],table tr,article a,article h2,main section,[class*="component"],[class*="status"]')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !el.closest('header,nav,footer')&&r.width>70&&r.height>12&&s.display!=='none'&&s.visibility!=='hidden'});
  if(!nodes.length)nodes.push(document.body);
  const pick=nodes[Math.min(nodes.length-1,Math.floor((nodes.length-1)*step/3))],tag=pick.tagName,before=pick.getBoundingClientRect();
  const targetTop=nodes.length===1&&(tag==='PRE'||tag==='CODE')?Math.max(0,(document.documentElement.scrollHeight-innerHeight)*step/3):Math.max(0,scrollY+before.top-innerHeight*.42);
  const targetLeft=Math.max(0,scrollX+before.left-innerWidth*.18);scrollTo({top:targetTop,left:targetLeft,behavior:'smooth'});await new Promise(resolve=>setTimeout(resolve,2600));
  const r=pick.getBoundingClientRect(),action=tag==='A'?'FOLLOW LINK':tag==='BUTTON'?'CHECK CONTROL':/H[1-3]/.test(tag)?'READ HEADING':tag==='CODE'||tag==='PRE'?'INSPECT RESPONSE':tag==='TR'||pick.getAttribute('role')==='row'?'INSPECT RECORD':tag==='BODY'||tag==='SECTION'?'READ PAGE SECTION':'READ ITEM';
  const raw=(pick.innerText||pick.textContent||pick.getAttribute('aria-label')||tag).replace(/\s+/g,' ').trim(),isDocument=nodes.length===1&&(tag==='PRE'||tag==='CODE'),start=isDocument?Math.floor(raw.length*step/4):0,text=raw.slice(start,start+72)||raw.slice(0,72);
  const left=Math.max(3,Math.min(innerWidth-44,r.left-3)),top=Math.max(24,Math.min(innerHeight-44,r.top-3)),width=Math.max(40,Math.min(innerWidth-left-4,r.width+6)),height=Math.max(20,Math.min(innerHeight-top-4,r.height+6));
  const box=document.createElement('div');box.id='__veemo_agent_overlay__';box.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;border:5px solid #ff6f3c;background:rgba(255,111,60,.15);box-shadow:0 0 0 2px #160804,0 0 22px rgba(255,111,60,.85)';
  const label=document.createElement('span');label.textContent=agent+' / '+action+' / '+text;label.style.cssText='position:absolute;left:-5px;top:-42px;max-width:760px;padding:8px 12px;background:#ff6f3c;color:#120603;border:2px solid #160804;font:800 20px monospace;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:4px 4px 0 #160804';box.append(label);document.documentElement.append(box);
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
  const health=await page.evaluate(()=>({text:(document.body?.innerText||'').trim().length,title:document.title,url:location.href}));
  if(health.text<20||/error|not found/i.test(health.title))throw new Error('page content unavailable: '+health.title);
  const frames=[],observations=[];
  for(let step=0;step<4;step++){const start=frames.length,trace=inspect(page,step,target.agent);for(let motion=0;motion<4;motion++){await sleep(500);const name=target.id+'-frame-'+frames.length+'.jpg';await page.screenshot({path:path.join(output,name),type:'jpeg',quality:68,captureBeyondViewport:false});frames.push('assets/live-pages/'+name)}const observation=await trace,name=target.id+'-frame-'+frames.length+'.jpg';await page.screenshot({path:path.join(output,name),type:'jpeg',quality:72,captureBeyondViewport:false});frames.push('assets/live-pages/'+name);for(let index=start;index<frames.length-1;index++)observations[index]={action:'SCROLL TO '+observation.tag,target:observation.target,tag:observation.tag,scrollY:observation.scrollY};observations.push(observation)}
  return {...target,ok:true,image:frames[0],frames,observations}
 }catch(error){console.error('capture failed:',target.id,error.message);const names=fs.readdirSync(output).filter(name=>name.startsWith(target.id+'-frame-')&&name.endsWith('.jpg')).sort((a,b)=>Number(a.match(/(\d+)\.jpg$/)?.[1])-Number(b.match(/(\d+)\.jpg$/)?.[1])),frames=names.map(name=>'assets/live-pages/'+name);return {...target,ok:frames.length>0,stale:frames.length>0,error:error.message,image:frames[0]||'assets/live-pages/'+target.id+'.png',frames,observations:[]}}
 finally{if(browser)await browser.close().catch(()=>{});try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
}
const activeTargets=process.env.VEEMO_CAPTURE_ONE?targets.slice(0,1):targets,results=[];
for(let i=0;i<activeTargets.length;i+=2)results.push(...await Promise.all(activeTargets.slice(i,i+2).map(run)));
const manifest={capturedAt:new Date().toISOString(),refreshMinutes:15,mode:'real-browser-dom-trace',streams:results};
fs.writeFileSync(path.join(output,'manifest.js'),'window.VEEMO_PAGE_STREAMS='+JSON.stringify(manifest)+';\n');console.log(JSON.stringify(manifest,null,2));
