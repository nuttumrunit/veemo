(function(){
  const cards=document.querySelectorAll('.treasury-grid article');
  const setCard=(card,label,value,note)=>{if(!card)return;card.querySelector('small').textContent=label;card.querySelector('strong').textContent=value;card.querySelector('span').textContent=note};
  const command=document.querySelector('.treasury-workstation .work-command em');
  const subhead=document.querySelector('.treasury-summary .subhead b');
  if(command)command.innerHTML='<i></i> treasury not configured';
  if(subhead)subhead.textContent='prelaunch / TBA';
  setCard(cards[0],'treasury address','TBA','awaiting official address');
  setCard(cards[1],'VEE token CA','TBA','token data unavailable');
  setCard(cards[2],'compute allocation','80%','published policy');
  setCard(cards[3],'agent allocation','20%','published policy');
  document.body.dataset.treasury='not-configured';
})();
