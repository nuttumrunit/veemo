import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const targets=[
 {id:'github-code',agent:'repo-scout',system:'GITHUB CODE',title:'Agave README source',url:'https://github.com/anza-xyz/agave/blob/master/README.md'},
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
  document.querySelectorAll('[data-veemo-trace]').forEach(node=>node.remove());
  const nodes=[...document.querySelectorAll('main a,main button,main h1,main h2,main h3,main pre,main code,pre,code,[role="row"],table tr,article a,article h2,main section,[class*="component"],[class*="status"]')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return !el.closest('header,nav,footer')&&r.width>70&&r.height>12&&s.display!=='none'&&s.visibility!=='hidden'});
  if(!nodes.length)nodes.push(document.body);
  const pick=nodes[Math.min(nodes.length-1,Math.floor((nodes.length-1)*step/3))],tag=pick.tagName,before=pick.getBoundingClientRect();
  const targetTop=nodes.length===1&&(tag==='PRE'||tag==='CODE')?Math.max(0,(document.documentElement.scrollHeight-innerHeight)*step/3):Math.max(0,scrollY+before.top-innerHeight*.42);
  const targetLeft=Math.max(0,scrollX+before.left-innerWidth*.18);
  const tracker=document.createElement('div');tracker.dataset.veemoTrace='moving-target';tracker.style.cssText='position:fixed;z-index:2147483645;pointer-events:none;border:3px solid #ff6f3c;background:rgba(255,111,60,.08);box-shadow:0 0 18px rgba(255,111,60,.8)';
  const moving=document.createElement('div');moving.dataset.veemoTrace='moving-panel';moving.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;left:18px;bottom:18px;padding:9px 13px;background:#0b0e0c;color:#f4f7f2;border-left:5px solid #ff6f3c;box-shadow:5px 5px 0 rgba(0,0,0,.8);font:800 14px monospace';moving.innerHTML='<b style="color:#ff6f3c">LIVE '+agent.toUpperCase()+'</b><br><span style="font-size:11px;color:#a9b5ae">FOLLOWING REAL &lt;'+tag.toLowerCase()+'&gt; / STEP '+String(step+1).padStart(2,'0')+'</span>';
  document.documentElement.append(tracker,moving);
  const follow=()=>{const live=pick.getBoundingClientRect(),x=Math.max(3,Math.min(innerWidth-44,live.left-3)),y=Math.max(24,Math.min(innerHeight-44,live.top-3)),w=Math.max(40,Math.min(innerWidth-x-4,live.width+6)),h=Math.max(20,Math.min(innerHeight-y-4,live.height+6));Object.assign(tracker.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'})};follow();const followTimer=setInterval(follow,40);
  scrollTo({top:targetTop,left:targetLeft,behavior:'smooth'});await new Promise(resolve=>setTimeout(resolve,2600));clearInterval(followTimer);tracker.remove();moving.remove();
  const r=pick.getBoundingClientRect(),action=tag==='A'?'FOLLOW LINK':tag==='BUTTON'?'CHECK CONTROL':/H[1-3]/.test(tag)?'READ HEADING':tag==='CODE'||tag==='PRE'?'INSPECT RESPONSE':tag==='TR'||pick.getAttribute('role')==='row'?'INSPECT RECORD':tag==='BODY'||tag==='SECTION'?'READ PAGE SECTION':'READ ITEM';
  const raw=(pick.innerText||pick.textContent||pick.getAttribute('aria-label')||tag).replace(/\s+/g,' ').trim(),isDocument=nodes.length===1&&(tag==='PRE'||tag==='CODE'),start=isDocument?Math.floor(raw.length*step/4):0,text=raw.slice(start,start+72)||raw.slice(0,72);
  const left=Math.max(3,Math.min(innerWidth-44,r.left-3)),top=Math.max(24,Math.min(innerHeight-44,r.top-3)),width=Math.max(40,Math.min(innerWidth-left-4,r.width+6)),height=Math.max(20,Math.min(innerHeight-top-4,r.height+6));
  const box=document.createElement('div');box.dataset.veemoTrace='target';box.style.cssText='position:fixed;z-index:2147483645;pointer-events:none;left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;border:3px solid #ff6f3c;background:rgba(255,111,60,.10);box-shadow:0 0 0 1px #160804,0 0 24px rgba(255,111,60,.72),inset 0 0 28px rgba(255,111,60,.12)';
  const label=document.createElement('span');label.textContent='TARGET '+String(step+1).padStart(2,'0')+'  '+action+'  '+text;label.style.cssText='position:absolute;left:-3px;top:-37px;max-width:720px;padding:6px 10px;background:#ff6f3c;color:#120603;border:2px solid #160804;font:900 17px monospace;line-height:20px;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:4px 4px 0 #160804';box.append(label);
  ['-7px -7px','calc(100% - 5px) -7px','-7px calc(100% - 5px)','calc(100% - 5px) calc(100% - 5px)'].forEach(pos=>{const corner=document.createElement('i'),parts=pos.split(' ');corner.style.cssText='position:absolute;left:'+parts[0]+';top:'+parts[1]+';width:10px;height:10px;background:#fff;border:2px solid #160804';box.append(corner)});
  const nodeLeft=Math.max(18,Math.min(innerWidth-230,left+width+32)),nodeTop=Math.max(86,Math.min(innerHeight-66,top+height*.5));
  const line=document.createElement('div');line.dataset.veemoTrace='link';const x1=Math.min(innerWidth-8,left+width),lineLeft=Math.min(x1,nodeLeft),lineWidth=Math.max(24,Math.abs(nodeLeft-x1));line.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;left:'+lineLeft+'px;top:'+(nodeTop+17)+'px;width:'+lineWidth+'px;height:3px;background:#ff6f3c;box-shadow:0 0 10px #ff6f3c';
  const node=document.createElement('div');node.dataset.veemoTrace='agent';node.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;left:'+nodeLeft+'px;top:'+nodeTop+'px;width:184px;padding:8px 10px;background:#0b0e0c;color:#f4f7f2;border:2px solid #ff6f3c;box-shadow:5px 5px 0 #160804;font:800 14px monospace';node.innerHTML='<b style="color:#ff6f3c">LIVE '+agent.toUpperCase()+'</b><br><span style="font-size:11px;color:#a9b5ae">LOCKED TO REAL DOM</span>';
  const panel=document.createElement('div');panel.dataset.veemoTrace='panel';panel.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;right:16px;top:16px;width:282px;padding:12px 14px;background:rgba(5,10,8,.94);color:#e9f0eb;border-left:5px solid #ff6f3c;border-top:1px solid #506057;border-bottom:1px solid #506057;box-shadow:7px 7px 0 rgba(0,0,0,.72);font:700 12px monospace;line-height:18px';panel.innerHTML='<b style="display:block;color:#ff6f3c;font-size:15px">VEEMO / REAL DOM TRACE</b><span>AGENT&nbsp; '+agent.toUpperCase()+'</span><br><span>STEP&nbsp;&nbsp; '+String(step+1).padStart(2,'0')+'/04</span><br><span>NODE&nbsp;&nbsp; &lt;'+tag.toLowerCase()+'&gt;</span><br><span>SCROLL '+Math.round(scrollY)+' PX</span><br><em style="color:#8fa097;font-style:normal">'+location.hostname+'</em>';
  document.documentElement.append(box,line,node,panel);
  return {action,target:text,tag,scrollY:Math.round(scrollY),selector:tag.toLowerCase()}
 },step,agent)
}
async function run(target){
 const profile=path.join(os.tmpdir(),'veemo-real-'+target.id+'-'+Date.now());console.error('capture start:',target.id);
 let browser;
 try{
  browser=await puppeteer.launch({executablePath,headless:true,userDataDir:profile,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--hide-scrollbars']});
  const page=await browser.newPage();await page.setViewport({width:1280,height:800,deviceScaleFactor:1});
  await page.goto(target.url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.body&&(document.body.innerText||'').trim().length>200,{timeout:15000}).catch(()=>{});await sleep(3500);
  if(target.system==='GITHUB CODE'){
   const opened=await page.evaluate(()=>{const controls=[...document.querySelectorAll('button')],control=controls.find(node=>node.textContent.trim()==='Code');if(!control)return false;control.click();return true});
   if(opened)await sleep(1800);
  }
  const health=await page.evaluate(()=>({text:(document.body?.innerText||'').trim().length,title:document.title,url:location.href}));
  if(health.text<20||/error|not found/i.test(health.title))throw new Error('page content unavailable: '+health.title);
  await page.evaluate(()=>{const pre=document.querySelector('pre');if(!pre)return false;try{const parsed=JSON.parse(pre.textContent.trim());pre.textContent=JSON.stringify(parsed,null,2);Object.assign(document.documentElement.style,{background:'#07100c'});Object.assign(document.body.style,{margin:'0',background:'#07100c',color:'#dce8e0',minHeight:'100vh'});Object.assign(pre.style,{boxSizing:'border-box',margin:'0',padding:'34px 38px',whiteSpace:'pre-wrap',overflowWrap:'anywhere',font:'14px/1.55 ui-monospace,Consolas,monospace',color:'#dce8e0',background:'linear-gradient(90deg,#07100c,#0b1711)',minHeight:'100vh',tabSize:'2'});return true}catch{return false}});
  const frames=[],observations=[];
  for(let step=0;step<4;step++){const start=frames.length,trace=inspect(page,step,target.agent);for(let motion=0;motion<4;motion++){await sleep(500);const name=target.id+'-frame-'+frames.length+'.jpg';await page.screenshot({path:path.join(output,name),type:'jpeg',quality:68,captureBeyondViewport:false});frames.push('assets/live-pages/'+name)}const observation=await trace,name=target.id+'-frame-'+frames.length+'.jpg';await page.screenshot({path:path.join(output,name),type:'jpeg',quality:72,captureBeyondViewport:false});frames.push('assets/live-pages/'+name);for(let index=start;index<frames.length-1;index++)observations[index]={action:'SCROLL TO '+observation.tag,target:observation.target,tag:observation.tag,scrollY:observation.scrollY};observations.push(observation)}
  return {...target,ok:true,image:frames[0],frames,observations}
 }catch(error){console.error('capture failed:',target.id,error.message);const names=fs.readdirSync(output).filter(name=>name.startsWith(target.id+'-frame-')&&name.endsWith('.jpg')).sort((a,b)=>Number(a.match(/(\d+)\.jpg$/)?.[1])-Number(b.match(/(\d+)\.jpg$/)?.[1])),frames=names.map(name=>'assets/live-pages/'+name);return {...target,ok:frames.length>0,stale:frames.length>0,error:error.message,image:frames[0]||'assets/live-pages/'+target.id+'.png',frames,observations:[]}}
 finally{if(browser)await browser.close().catch(()=>{});try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
}
const requested=(process.env.VEEMO_CAPTURE_IDS||'').split(',').map(value=>value.trim()).filter(Boolean);
const activeTargets=requested.length?targets.filter(target=>requested.includes(target.id)):process.env.VEEMO_CAPTURE_ONE?targets.slice(0,1):targets,captured=[];
for(let i=0;i<activeTargets.length;i+=2)captured.push(...await Promise.all(activeTargets.slice(i,i+2).map(run)));
let results=captured;
if(activeTargets.length<targets.length){
 let previous=[];
 try{const source=fs.readFileSync(path.join(output,'manifest.js'),'utf8'),json=source.slice(source.indexOf('=')+1).trim().replace(/;$/,'');previous=JSON.parse(json).streams||[]}catch{}
 results=targets.map(target=>captured.find(stream=>stream.id===target.id)||previous.find(stream=>stream.id===target.id)).filter(Boolean);
}
const manifest={capturedAt:new Date().toISOString(),refreshMinutes:15,mode:'real-browser-dom-trace',streams:results};
fs.writeFileSync(path.join(output,'manifest.js'),'window.VEEMO_PAGE_STREAMS='+JSON.stringify(manifest)+';\n');console.log(JSON.stringify(manifest,null,2));
