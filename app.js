const DEFAULT_STATE = {
  balance: 1000000000,
  staked: 0,
  referrals: 0,
  rewards: 5000,
  wallet: "0x7f3a...9c2e",
  price: 0.001,
  tx: [
    {type:"Staking Reward", amount:5000, status:"Completed", time:"2026-09-19 00:20"},
    {type:"Referral Reward (L1)", amount:10000, status:"Completed", time:"2026-09-18 21:42"},
    {type:"Transfer (to ID)", amount:-100000, status:"Completed", time:"2026-09-18 18:20"}
  ]
};
let state;
try { state = {...DEFAULT_STATE, ...JSON.parse(localStorage.getItem("bmxProfessionalState") || "{}")}; }
catch { state = {...DEFAULT_STATE}; }

function save(){ localStorage.setItem("bmxProfessionalState", JSON.stringify(state)); }
function fmt(n){ return Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2}); }
function money(n){ return "$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function setText(sel,val){ document.querySelectorAll(sel).forEach(el=>el.textContent=val); }
function toast(msg){ const t=document.querySelector(".toast"); if(!t)return; t.textContent=msg; t.classList.add("show"); clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove("show"),2400); }

function refresh(){
  setText("[data-balance]", fmt(state.balance)+" BMX");
  setText("[data-staked]", fmt(state.staked)+" BMX");
  setText("[data-rewards]", fmt(state.rewards)+" BMX");
  setText("[data-referrals]", String(state.referrals));
  setText("[data-wallet]", state.wallet);
  setText("[data-price]", "$"+Number(state.price).toFixed(4));
  setText("[data-value]", money(state.balance*state.price));
  const rows=document.querySelector("#txRows");
  if(rows){
    rows.innerHTML="";
    state.tx.slice(0,6).forEach(x=>{
      const tr=document.createElement("tr");
      const cls=x.amount>=0?"positive":"";
      tr.innerHTML=`<td>${x.time}</td><td>${x.type}</td><td class="${cls}">${x.amount>=0?"+":""}${fmt(x.amount)} BMX</td><td><span class="pill">${x.status}</span></td>`;
      rows.appendChild(tr);
    });
  }
  const avail=document.querySelector("[data-available]");
  if(avail) avail.textContent=fmt(state.balance)+" BMX available";
  const stakedBar=document.querySelector("[data-staked-bar]");
  if(stakedBar) stakedBar.style.width=Math.min(100,state.staked/(state.staked+state.balance||1)*100)+"%";
}

document.addEventListener("DOMContentLoaded",()=>{
  refresh();
  const page=document.body.dataset.page;
  document.querySelectorAll(".nav a").forEach(a=>{if(a.dataset.page===page)a.classList.add("active");});

  const menu=document.querySelector("#menuBtn"), side=document.querySelector(".sidebar");
  if(menu) menu.onclick=()=>side.classList.toggle("open");

  document.querySelectorAll("[data-connect]").forEach(b=>b.onclick=()=>document.querySelector("#walletModal")?.classList.add("open"));
  document.querySelectorAll("[data-close-modal]").forEach(b=>b.onclick=()=>document.querySelector("#walletModal")?.classList.remove("open"));
  document.querySelectorAll("[data-wallet-option]").forEach(b=>b.onclick=()=>{
    state.wallet=b.dataset.walletOption; save(); refresh();
    document.querySelector("#walletModal")?.classList.remove("open");
    toast("Preview wallet connected");
  });

  const copy=document.querySelector("[data-copy]");
  if(copy) copy.onclick=async()=>{
    const input=document.querySelector("[data-ref-input]");
    try{await navigator.clipboard.writeText(input.value);toast("Referral link copied");}
    catch{input.select();toast("Select and copy the referral link");}
  };

  const max=document.querySelector("[data-max]");
  if(max) max.onclick=()=>{const input=document.querySelector("#stakeAmount"); if(input){input.value=state.balance; input.focus();}};

  const stake=document.querySelector("#stakeForm");
  if(stake) stake.onsubmit=e=>{
    e.preventDefault();
    const amt=Number(new FormData(stake).get("amount"));
    if(!amt||amt<=0||amt>state.balance){toast("Enter a valid BMX amount");return;}
    state.balance-=amt; state.staked+=amt;
    state.tx.unshift({type:"Stake BMX",amount:-amt,status:"Completed",time:new Date().toLocaleString()});
    save(); refresh(); toast(fmt(amt)+" BMX staked in preview mode");
  };

  const transfer=document.querySelector("#transferForm");
  if(transfer) transfer.onsubmit=e=>{
    e.preventDefault();
    const fd=new FormData(transfer), amt=Number(fd.get("amount")), to=String(fd.get("to")||"").trim();
    if(!to||!amt||amt<=0||amt>state.balance){toast("Check recipient and amount");return;}
    state.balance-=amt; state.tx.unshift({type:"Transfer to "+to.slice(0,10),amount:-amt,status:"Completed",time:new Date().toLocaleString()});
    save(); refresh(); transfer.reset(); toast("Preview transfer recorded");
  };

  const register=document.querySelector("#registerForm");
  if(register) register.onsubmit=e=>{e.preventDefault();toast("Preview account created");setTimeout(()=>location.href="login.html",450);};
  const login=document.querySelector("#loginForm");
  if(login) login.onsubmit=e=>{e.preventDefault();toast("Preview sign-in successful");setTimeout(()=>location.href="dashboard.html",450);};

  const referral=document.querySelector("[data-ref-input]");
  if(referral) referral.value=location.origin+location.pathname.replace(/[^/]+$/,"")+"register.html?ref=BMX-"+state.wallet.slice(-4);
});


/* BMX Staking referral system — browser-local simulation */
(function () {
  const USER_KEY = "bmx_current_user";
  const USERS_KEY = "bmx_users";
  const REF_KEY = "bmx_referrals";

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (_) { return fallback; }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function makeCode(name) {
    const base = String(name || "BMX").replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "BMX";
    return base + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  }
  function ensureUser(name, email) {
    const users = load(USERS_KEY, []);
    let user = users.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = { id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        name: name || "BMX User", email: email || "", referralCode: makeCode(name),
        referrals: [], createdAt: new Date().toISOString() };
      users.push(user);
      save(USERS_KEY, users);
    } else if (!user.referralCode) {
      user.referralCode = makeCode(user.name);
      save(USERS_KEY, users);
    }
    save(USER_KEY, user);
    return user;
  }
  function currentUser() {
    return load(USER_KEY, null);
  }
  function referralUrl(code) {
    return location.origin + location.pathname.replace(/[^/]*$/, "") + "register.html?ref=" + encodeURIComponent(code);
  }
  function registerReferral(newUser) {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (!ref || !newUser || ref === newUser.referralCode) return false;
    const users = load(USERS_KEY, []);
    const referrer = users.find(u => u.referralCode === ref);
    if (!referrer) return false;
    if (referrer.referrals.some(r => r.userId === newUser.id)) return false;
    referrer.referrals.push({ userId: newUser.id, name: newUser.name, joinedAt: new Date().toISOString() });
    save(USERS_KEY, users);
    const records = load(REF_KEY, []);
    records.push({ referrerId: referrer.id, referredId: newUser.id, code: ref, joinedAt: new Date().toISOString() });
    save(REF_KEY, records);
    return true;
  }
  function expose() {
    window.BMXReferral = {
      ensureUser, currentUser, referralUrl, registerReferral,
      getUsers: () => load(USERS_KEY, []),
      getReferralRecords: () => load(REF_KEY, [])
    };
  }
  expose();

  // On a registration form, remember the referral code and attach it to the form.
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form[data-register-form], #registerForm");
    const ref = new URLSearchParams(location.search).get("ref");
    if (form && ref) {
      let input = form.querySelector('input[name="referral"]');
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden"; input.name = "referral"; form.appendChild(input);
      }
      input.value = ref;
      const note = document.createElement("div");
      note.className = "referral-note";
      note.textContent = "Referral code applied: " + ref;
      form.prepend(note);
    }
  });
})();
