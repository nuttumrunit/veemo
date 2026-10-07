(function(){
  const MINT='CcSchh9dGiZ8y1aVTBiAvPtmqqnFRnSx2ZazT641pump';
  const PUMP=`https://pump.fun/coin/${MINT}`;
  const MARKET=`https://api.dexscreener.com/latest/dex/tokens/${MINT}`;
  const money=value=>{const amount=Number(value);if(!Number.isFinite(amount))return '—';if(amount>=1e9)return `$${(amount/1e9).toFixed(2)}B`;if(amount>=1e6)return `$${(amount/1e6).toFixed(2)}M`;if(amount>=1e3)return `$${(amount/1e3).toFixed(2)}K`;return `$${amount.toFixed(2)}`};
  const price=value=>{const amount=Number(value);if(!Number.isFinite(amount))return '—';return amount>=.01?`$${amount.toFixed(4)}`:`$${amount.toPrecision(4)}`};
  function set(key,value,note){const card=document.querySelector(`[data-market="${key}"]`);if(!card)return;card.querySelector('strong').textContent=value;card.querySelector('em').textContent=note}
  function mount(){
    const host=document.querySelector('.treasury-summary');if(!host||document.querySelector('.token-market'))return;
    const panel=document.createElement('section');panel.className='token-market';
    panel.innerHTML=`<header><div><i></i><b>$VEEMO / SOL</b><span data-market-status>MARKET SYNCING</span></div><a href="${PUMP}" target="_blank" rel="noopener noreferrer">TRADE ON PUMP.FUN &nearr;</a></header><div class="token-market-grid"><article data-market="usd"><small>PRICE USD</small><strong>—</strong><em>DEXSCREENER</em></article><article data-market="sol"><small>PRICE SOL</small><strong>—</strong><em>PUMP.FUN</em></article><article data-market="cap"><small>MARKET CAP</small><strong>—</strong><em>LIVE</em></article><article data-market="liquidity"><small>LIQUIDITY</small><strong>BONDING</strong><em>PUMP.FUN CURVE</em></article><article data-market="volume"><small>24H VOLUME</small><strong>—</strong><em>LIVE</em></article><article data-market="orders"><small>24H ORDERS</small><strong>—</strong><em>LIVE</em></article><article data-market="tax"><small>TOKEN TAX</small><strong>0%</strong><em>NO TRANSFER FEE</em></article><article data-market="mint"><small>MINT AUTHORITY</small><strong>REVOKED</strong><em>ON-CHAIN</em></article><article data-market="freeze"><small>FREEZE AUTHORITY</small><strong>REVOKED</strong><em>ON-CHAIN</em></article></div><footer><span>CA LIVE / ${MINT.slice(0,6)}...${MINT.slice(-6)}</span><span class="agent-gate">PUBLIC AGENTS / BURN 10,000 $VEEMO</span><a data-market-source href="https://dexscreener.com/solana/${MINT}" target="_blank" rel="noopener noreferrer">DEXSCREENER &nearr;</a></footer>`;
    host.querySelector('.subhead')?.after(panel)
  }
  async function refresh(){
    const status=document.querySelector('[data-market-status]');
    try{const response=await fetch(MARKET);if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json(),pair=(data.pairs||[]).find(item=>item.dexId==='pumpfun')||data.pairs?.[0];if(!pair)throw new Error('market unavailable');const h24=pair.txns?.h24||{},orders=Number(h24.buys||0)+Number(h24.sells||0);set('usd',price(pair.priceUsd),'DEXSCREENER LIVE');set('sol',Number(pair.priceNative).toPrecision(4),'VEEMO / SOL');set('cap',money(pair.marketCap||pair.fdv),'FULLY DILUTED');set('liquidity',pair.liquidity?.usd?money(pair.liquidity.usd):'BONDING',pair.liquidity?.usd?'POOL LIQUIDITY':'PUMP.FUN CURVE');set('volume',money(pair.volume?.h24),'ROLLING 24H');set('orders',orders.toLocaleString(),`${Number(h24.buys||0)} BUY / ${Number(h24.sells||0)} SELL`);const source=document.querySelector('[data-market-source]');if(source&&pair.url)source.href=pair.url;if(status)status.textContent='MARKET LIVE';document.body.dataset.market='online'}catch(error){if(status)status.textContent='MARKET RETRYING';document.body.dataset.market='retrying'}
  }
  mount();refresh();setInterval(refresh,30000);
})();
