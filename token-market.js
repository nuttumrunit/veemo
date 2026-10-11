(function(){
  function mount(){
    const host=document.querySelector('.treasury-summary');
    if(!host||document.querySelector('.token-market'))return;
    const panel=document.createElement('section');
    panel.className='token-market';
    panel.innerHTML='<header><div><i></i><b>$VEE / SOL</b><span>NOT CONFIGURED</span></div></header><div class="token-market-grid"><article><small>TOKEN CA</small><strong>TBA</strong><em>AWAITING OFFICIAL MINT</em></article><article><small>MARKET</small><strong>—</strong><em>NOT CONNECTED</em></article><article><small>PRICE</small><strong>—</strong><em>UNAVAILABLE</em></article><article><small>LIQUIDITY</small><strong>—</strong><em>UNAVAILABLE</em></article><article><small>24H VOLUME</small><strong>—</strong><em>UNAVAILABLE</em></article><article><small>AUTHORITY</small><strong>—</strong><em>AWAITING MINT</em></article></div><footer><span>CA TBA</span><span class="agent-gate">PUBLIC TOKEN OPERATIONS LOCKED</span></footer>';
    host.querySelector('.subhead')?.after(panel);
    document.body.dataset.market='not-configured';
  }
  mount();
})();
