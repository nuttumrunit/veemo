import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

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
const chrome=process.env.CHROME_BIN||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'google-chrome');
const run=target=>new Promise(resolve=>{const shot=path.join(output,target.id+'.png'),profile=path.join(os.tmpdir(),'veemo-capture-'+target.id+'-'+Date.now()),args=['--headless=new','--disable-gpu','--hide-scrollbars','--no-sandbox','--disable-dev-shm-usage','--window-size=1280,800','--virtual-time-budget=6500','--user-data-dir='+profile,'--screenshot='+shot,target.url],child=spawn(chrome,args,{stdio:'ignore'});const timer=setTimeout(()=>child.kill(),22000);child.on('error',()=>{clearTimeout(timer);resolve({...target,ok:false})});child.on('exit',code=>{clearTimeout(timer);try{fs.rmSync(profile,{recursive:true,force:true})}catch{}resolve({...target,ok:code===0&&fs.existsSync(shot),image:'assets/live-pages/'+target.id+'.png'})})});
const results=[];for(let i=0;i<targets.length;i+=3)results.push(...await Promise.all(targets.slice(i,i+3).map(run)));
const manifest={capturedAt:new Date().toISOString(),refreshMinutes:15,streams:results};
fs.writeFileSync(path.join(output,'manifest.js'),'window.VEEMO_PAGE_STREAMS='+JSON.stringify(manifest)+';\n');
console.log(JSON.stringify(manifest,null,2));
