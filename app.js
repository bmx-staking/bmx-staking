
/* Daily reward schedule: 12:00 AM IST (Asia/Kolkata) every day.
   This is a website-preview simulation; it does not execute blockchain rewards. */
const BMX_REWARD_TIMEZONE = "Asia/Kolkata";
const BMX_DAILY_REWARD_HOUR = 0;
const BMX_DAILY_REWARD_MINUTE = 0;

function bmxNextRewardTimeIST(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BMX_REWARD_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  }).formatToParts(now);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  let target = new Date(`${p.year}-${p.month}-${p.day}T00:00:00+05:30`);
  if (now >= target) target = new Date(target.getTime() + 86400000);
  return target;
}

function bmxRewardScheduleLabel() {
  return "Daily at 12:00 AM IST";
}


const state = JSON.parse(localStorage.getItem('bmxState') || '{"balance":1000000000,"staked":0,"referrals":0,"rewards":5000,"wallet":"0x7f3a...9c2e","tx":[],"price":0.001}');
function save(){localStorage.setItem('bmxState',JSON.stringify(state));}
function fmt(n){return Number(n).toLocaleString('en-US',{maximumFractionDigits:2});}
function toast(msg){const t=document.querySelector('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function setText(selector,val){document.querySelectorAll(selector).forEach(e=>e.textContent=val)}
function refresh(){
 setText('[data-balance]',fmt(state.balance)+' BMX');
 setText('[data-staked]',fmt(state.staked)+' BMX');
 setText('[data-rewards]',fmt(state.rewards)+' BMX');
 setText('[data-wallet]',state.wallet);
 setText('[data-referrals]',state.referrals);
 setText('[data-price]','$'+state.price.toFixed(4));
}
document.addEventListener('DOMContentLoaded',()=>{
 refresh();
 const page=document.body.dataset.page;
 document.querySelectorAll('.nav a').forEach(a=>{if(a.dataset.page===page)a.classList.add('active')});
 const menu=document.querySelector('#menuBtn'), side=document.querySelector('.sidebar');
 if(menu)menu.onclick=()=>side.classList.toggle('open');
 document.querySelectorAll('[data-connect]').forEach(b=>b.onclick=()=>document.querySelector('#walletModal')?.classList.add('open'));
 document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=()=>document.querySelector('#walletModal')?.classList.remove('open'));
 document.querySelectorAll('[data-wallet-option]').forEach(b=>b.onclick=()=>{state.wallet=b.dataset.walletOption;save();refresh();document.querySelector('#walletModal')?.classList.remove('open');toast('Wallet connected (demo mode)')});
 const copy=document.querySelector('[data-copy]');
 if(copy)copy.onclick=async()=>{const value=document.querySelector('[data-ref-input]').value;try{await navigator.clipboard.writeText(value);toast('Referral link copied')}catch{toast('Copy blocked by browser')}};
 const stake=document.querySelector('#stakeForm');
 if(stake)stake.onsubmit=e=>{e.preventDefault();const amt=Number(new FormData(stake).get('amount'));if(!amt||amt<=0||amt>state.balance){toast('Enter a valid amount');return}state.balance-=amt;state.staked+=amt;state.tx.unshift({type:'Staking',amount:amt,status:'Completed',time:new Date().toLocaleString()});save();refresh();toast(fmt(amt)+' BMX staked')};
 const transfer=document.querySelector('#transferForm');
 if(transfer)transfer.onsubmit=e=>{e.preventDefault();const fd=new FormData(transfer),amt=Number(fd.get('amount')),to=fd.get('to');if(!to||!amt||amt<=0||amt>state.balance){toast('Check recipient and amount');return}state.balance-=amt;state.tx.unshift({type:'Transfer (to ID)',amount:-amt,status:'Completed',time:new Date().toLocaleString()});save();refresh();toast('Transfer recorded in demo ledger')};
 const register=document.querySelector('#registerForm');
 if(register)register.onsubmit=e=>{e.preventDefault();toast('Account created in demo mode');location.href='login.html'};
 const login=document.querySelector('#loginForm');
 if(login)login.onsubmit=e=>{e.preventDefault();toast('Signed in (demo mode)');location.href='dashboard.html'};
 const referral=document.querySelector('#referralInput'); if(referral) referral.value=location.origin+location.pathname.replace(/[^/]+$/,'')+'register.html?ref=BMX-'+state.wallet.slice(-4);
});
