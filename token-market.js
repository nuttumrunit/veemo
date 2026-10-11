(function(){
  function mount(){
    const host=document.querySelector('.treasury-summary');
    if(!host||document.querySelector('.token-market'))return;
    const panel=document.createElement('section');
    panel.className='token-market';
    panel.innerHTML='<header><div><i></i><b>$VEE / SOL</b><span>TOKEN LIVE</span></div><a href="https://pump.fun/coin/YD3VPshteV2cjYD1ebTdsz81CcvRqNV6Br1giHdpump" target="_blank" rel="noopener noreferrer">BUY ON PUMP.FUN &nearr;</a></header><div class="token-market-grid"><article><small>TOKEN CA</small><strong>YD3VPs…Hdpump</strong><em>OFFICIAL MINT</em></article><article><small>MARKET</small><strong>LIVE</strong><em>PUMP.FUN</em></article><article><small>PRICE</small><strong>—</strong><em>NOT YET SYNCED</em></article><article><small>LIQUIDITY</small><strong>—</strong><em>NOT YET SYNCED</em></article><article><small>24H VOLUME</small><strong>—</strong><em>NOT YET SYNCED</em></article><article><small>TREASURY</small><strong>TBA</strong><em>AWAITING OFFICIAL ADDRESS</em></article></div><footer><span>CA LIVE / YD3VPs...Hdpump</span><span class="agent-gate">PUBLIC TOKEN LIVE</span></footer>';
    host.querySelector('.subhead')?.after(panel);
    document.body.dataset.market='online';
  }
  mount();
})();
