(function(){
  'use strict';
  var data=window.VEEMO_PAGE_STREAMS||{},streams=Array.isArray(data.streams)?data.streams:[];
  if(!streams.length)return;
  var stage=document.querySelector('.screen-stage'),screen=document.querySelector('.cell-screen'),wall=document.querySelector('.machine-wall');
  var state={index:0,manualUntil:0},captured=new Date(data.capturedAt||Date.now()),cache=encodeURIComponent(data.capturedAt||Date.now());
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function short(v){return String(v||'').replace(/^https?:\/\//,'').replace(/\/$/,'')}
  function time(){return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(captured)}
  function img(s){return './'+s.image+'?v='+cache}
  function route(name){
    document.querySelectorAll('.app-view').forEach(function(v){v.classList.toggle('is-active',v.dataset.view===name)});
    document.querySelectorAll('[data-route]').forEach(function(a){a.classList.toggle('active',a.dataset.route===name)});
    document.body.dataset.route=name;if(location.hash!=='#'+name)history.pushState(null,'','#'+name);scrollTo(0,0)
  }
  function copy(){
    document.title='Veemo - Agents across APIs and blockchains';
    var d=document.querySelector('meta[name="description"]');if(d)d.content='A live network where agents move between public APIs and blockchains.';
    var c=document.querySelector('.cell-command b');if(c)c.textContent='network trace --public --live';
    var h=document.querySelector('.cell-intro-body h1');if(h)h.innerHTML='<i>&gt;</i> agents move between real public APIs and blockchains.<br>watch every page, package, wallet and program they inspect.';
    var p=document.querySelector('.cell-intro-body > p');if(p)p.textContent='each agent follows a different machine system. together they connect GitHub releases, package registries, market APIs and Solana activity into one public trace.';
    var proof=document.querySelector('.cell-proof-banner');if(proof)proof.innerHTML='<div class="proof-code"><header><i></i><span>REAL PAGE TARGET</span></header><code data-page-source>connecting...</code><small><b>PUBLIC SOURCE</b><em>CAPTURED LIVE</em></small></div><div class="proof-statement"><span>TRACE THE EVENT.</span><strong>VERIFY THE SOURCE.</strong></div><div class="proof-gate"><b>1</b><span>OPEN PAGE</span></div><div class="proof-gate"><b>2</b><span>FOLLOW LINK</span></div><div class="proof-output"><strong>VEEMO</strong><span>VERIFY</span></div>';
    var detail=document.querySelector('#landingDetail');if(detail)detail.innerHTML='<div><span class="section-label">NETWORK / 00</span><h2>One event. Every machine system it touches.</h2></div><p>Agents open real source repositories, package registries, public APIs, wallets and programs. Every step remains visible and independently verifiable.</p>';
    var spawn=document.querySelector('.cell-actions [data-route="spawn"]');if(spawn)spawn.textContent='SPAWN AN AGENT'
  }
  function frame(s){
    var status=s.stale?'LAST GOOD TRACE':s.ok?'REAL PAGE / LIVE':'PAGE UNAVAILABLE',first=(s.observations||[])[0]||{action:s.stale?'REPLAY VERIFIED TRACE':'OPEN PAGE',target:s.title};
    return '<div class="gh-native-live cross-live"><div class="gh-native-browser"><span class="browser-lights"><i></i><i></i><i></i></span><b>'+esc(s.system)+'</b><code>'+esc(short(s.url))+'</code><a href="'+esc(s.url)+'" target="_blank" rel="noopener">OPEN PAGE</a><em>'+status+'</em></div><nav class="gh-agent-channels" aria-label="Live public-page agents"></nav><section class="gh-native-page"><a class="stream-page" href="'+esc(s.url)+'" target="_blank" rel="noopener"><img src="'+esc(img(s))+'" alt="Real page: '+esc(s.title)+'"><span class="stream-page-status">'+status+' / REAL DOM TRACE</span></a></section><div class="gh-native-log"><header><b>LIVE PAGE TRACE</b><span>'+esc(s.agent)+'</span><em>REAL PUBLIC SOURCE</em></header><div><p><time>'+esc(time())+'</time><b>OPEN</b><span>'+esc(short(s.url))+'</span><strong>'+(s.ok?'200':'ERR')+'</strong></p><p><time>LIVE</time><b data-real-action>'+esc(first.action)+'</b><span data-real-target>'+esc(first.target)+'</span><strong>DOM</strong></p></div></div></div>'
  }
  function telemetry(active){
    var good=streams.filter(function(s){return s.ok}).length,systems=new Set(streams.map(function(s){return s.system})).size;
    var stats=document.querySelector('.cell-inline-stats');if(stats)stats.innerHTML='<span><b>'+streams.length+'</b> agents live</span><i>/</i><span><b>'+systems+'</b> systems</span><i>/</i><span><b>'+good+'</b> pages online</span><i>/</i><span>refresh <b>'+(data.refreshMinutes||15)+'m</b></span><i>/</i><span>capture <b>'+esc(time())+'</b></span>';
    var table=document.querySelector('.process-table');if(table)table.innerHTML='<div><span>PID</span><span>AGENT</span><span>S</span><span>SYSTEM</span><span>PAGE</span><span>HTTP</span><span>CAPTURE</span><span>TARGET</span></div>'+streams.map(function(s,i){return '<p'+(s===active?' class="active"':'')+'><span>'+String(i+1).padStart(2,'0')+'</span><b>'+esc(s.agent)+'</b><span>R</span><span>'+esc(s.system)+'</span><span>1</span><span>'+(s.ok?'OK':'ERR')+'</span><span>'+esc(time())+'</span><em>'+esc(s.title)+'</em></p>'}).join('');
    var meta=document.querySelector('.process-meta');if(meta)meta.innerHTML='<pre> 1['+'#'.repeat(Math.min(streams.length,22)).padEnd(22,' ')+' '+good+'/'+streams.length+' online]\n 2['+'#'.repeat(Math.min(systems,22)).padEnd(22,' ')+' '+systems+' systems]\nAPI[ public sources             ]\nChain[ Solana mainnet           ]</pre><p><span><b>Agents:</b> '+streams.length+' reading real public pages</span><span><b>Active:</b> '+esc(active.agent)+' / '+esc(active.system)+'</span><span><b>Captured:</b> '+esc(time())+'</span><span><b>Refresh:</b> every '+(data.refreshMinutes||15)+' minutes</span></p>';
    var feed=document.querySelector('.cell-feed');if(feed)feed.innerHTML='<div class="feed-line"><span class="ascii">'+esc(time())+'</span><b>'+esc(active.agent)+'</b><span>'+esc(active.system)+'</span><strong>'+(active.ok?'ok':'error')+'</strong><span>real page capture</span><em>('+esc(short(active.url))+')</em></div><div class="feed-empty"><i></i><span>following public machine systems</span></div>'
  }
  function main(index,manual){
    state.index=(index+streams.length)%streams.length;var s=streams[state.index];if(!stage||!screen)return;stage.innerHTML=frame(s);
    var heroImage=stage.querySelector('.stream-page img');if(heroImage)heroImage.dataset.frameIndex='0';
    var nav=stage.querySelector('.gh-agent-channels');streams.forEach(function(item,i){var b=document.createElement('button');b.className='gh-agent-channel'+(i===state.index?' active':'');b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span><b>'+esc(item.system)+'</b><i>'+esc(item.agent)+'</i>';b.onclick=function(){main(i,true)};nav.append(b)});
    var h=screen.querySelector(':scope > header');if(h)h.innerHTML='<span><i></i><b>'+esc(s.agent)+'</b>&nbsp; '+String(state.index+1).padStart(2,'0')+'/'+String(streams.length).padStart(2,'0')+'&nbsp; / &nbsp;'+esc(s.system)+'</span><em>'+(s.stale?'LAST GOOD TRACE':'REAL PAGE LIVE')+'</em>';
    var f=screen.querySelector(':scope > footer');if(f)f.innerHTML='<span>'+esc(s.system)+'</span><i>/</i><b>'+esc(s.title)+'</b><em>'+(s.ok?'CAPTURE OK':'UNAVAILABLE')+'</em>';
    document.querySelectorAll('[data-page-source]').forEach(function(n){n.textContent=short(s.url)});telemetry(s);if(manual)state.manualUntil=Date.now()+12000
  }
  function renderWall(){
    if(!wall)return;wall.className='machine-wall repo-live-wall twelve github-synced-wall cross-agent-wall';wall.innerHTML='';
    streams.forEach(function(s,i){var tile=document.createElement('article');tile.className='repo-live-tile';tile.dataset.ok=String(!!s.ok);tile.tabIndex=0;tile.style.setProperty('--stream-delay',(-i*1.35)+'s');tile.style.setProperty('--stream-speed',(15+(i%5)*2)+'s');tile.innerHTML='<header><span><i></i>'+String(i+1).padStart(2,'0')+' / '+esc(s.agent)+'</span><b>'+(s.ok?'LIVE':'ERROR')+'</b></header><div class="repo-live-viewport"><div class="repo-mini-browser">'+esc(short(s.url))+'</div><a class="stream-tile-image" href="'+esc(s.url)+'" target="_blank" rel="noopener"><img src="'+esc(img(s))+'" alt="Real page: '+esc(s.title)+'"></a></div><footer><span>'+esc(s.system)+'</span><b>'+esc(s.title)+'</b><em>scrolling</em></footer>';
      function select(e){if(e&&e.target.closest('a'))return;main(i,true);route('live')}tile.onclick=select;tile.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(e)}};wall.append(tile)
    });
    var command=document.querySelector('.machine-command');if(command){var title=command.querySelector('b'),summary=command.querySelector('em'),buttons=command.querySelectorAll('nav button');if(title)title.textContent='agents watch --apis --chain --live';if(summary)summary.textContent='# 12 agents / real public pages';var labels=['[p]ages','[t]races','[a]gents 12','[c]hain 3','[a]pis 6','[l]ive 12','[e]rrors '+streams.filter(function(s){return !s.ok}).length];buttons.forEach(function(b,i){if(labels[i])b.textContent=labels[i]})}
    var status=document.querySelector('.machine-wall-status > span');if(status)status.innerHTML='<b>veemo</b> "real pages / public APIs / Solana"'
  }
  function showFrame(image,url,index,onDisplay){
    if(!image||!url||image.dataset.pending)return;
    var next='./'+url+'?v='+cache;
    if(image.src.endsWith(next)){image.dataset.frameIndex=String(index);if(onDisplay)onDisplay();return}
    image.dataset.pending=next;
    var preload=new Image();
    preload.onload=function(){if(image.dataset.pending===next){image.src=next;image.dataset.frameIndex=String(index);image.dataset.pending='';if(onDisplay)onDisplay()}};
    preload.onerror=function(){if(image.dataset.pending===next)image.dataset.pending=''};
    preload.src=next
  }
  function advance(image,frames,observations,status,action,target){
    if(!image||!frames.length)return;
    var current=Math.max(0,Number(image.dataset.frameIndex||0)),next=Math.min(current+1,frames.length-1),observation=observations[next]||observations[current];
    if(next===current){if(status)status.textContent='trace complete';return}
    showFrame(image,frames[next],next,function(){
      if(status)status.textContent=next===frames.length-1?'trace complete':observation?observation.action.toLowerCase():'reading real page';
      if(observation){if(action)action.textContent=observation.action;if(target)target.textContent=observation.target}
    })
  }
  function realWork(){
    document.querySelectorAll('.repo-live-tile').forEach(function(tile,index){var s=streams[index],image=tile.querySelector('.stream-tile-image img');if(image&&!image.dataset.frameIndex)image.dataset.frameIndex='0';advance(image,s.frames||[],s.observations||[],tile.querySelector('footer em'))});
    var active=streams[state.index],image=stage&&stage.querySelector('.stream-page img');advance(image,active.frames||[],active.observations||[],null,stage&&stage.querySelector('[data-real-action]'),stage&&stage.querySelector('[data-real-target]'))
  }
  copy();renderWall();main(0,false);realWork();setInterval(realWork,650);
  setInterval(function(){if(Date.now()<state.manualUntil)return;main((state.index+1)%streams.length,false);var p=stage&&stage.querySelector('.stream-page');if(p){p.classList.add('stream-hop');setTimeout(function(){p.classList.remove('stream-hop')},400)}},22000);
  setTimeout(function(){location.reload()},Math.max(60000,(data.refreshMinutes||15)*60000))
}());
