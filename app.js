
/* BMX Staking status notifications */
function BMXStatus(message, type = "success") {
  let box = document.getElementById("bmx-status-toast");
  if (!box) {
    box = document.createElement("div");
    box.id = "bmx-status-toast";
    document.body.appendChild(box);
  }
  box.className = "bmx-status-toast " + type;
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(window.__bmxToastTimer);
  window.__bmxToastTimer = setTimeout(() => box.classList.remove("show"), 2800);
}

function BMXSuccess(message) { BMXStatus(message, "success"); }
function BMXError(message) { BMXStatus(message, "error"); }

/* BMX Staking final preview build */
const BMX_ADMIN_WALLET = "0x7f3a...9c2e";
const BMX_DAILY_RATE = 0.005;
const BMX_REWARD_TZ = "Asia/Kolkata";
const BMX_STATE_KEY = "bmxProfessionalStateV3";

function bmxTodayISTKey(date=new Date()) {
  return new Intl.DateTimeFormat("en-CA", {timeZone:BMX_REWARD_TZ, year:"numeric", month:"2-digit", day:"2-digit"}).format(date);
}
function bmxNextMidnightIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone:BMX_REWARD_TZ, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  let t=new Date(`${p.year}-${p.month}-${p.day}T00:00:00+05:30`);
  if(Date.now()>=t.getTime()) t=new Date(t.getTime()+86400000);
  return t;
}

const DEFAULT_STATE = {balance:1000000000, staked:0, referrals:0, rewards:0, wallet:BMX_ADMIN_WALLET, price:0.001, tx:[], lastRewardDay:""};
let state;
try { state = {...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(BMX_STATE_KEY) || "{}")}; } catch { state={...DEFAULT_STATE}; }

function save(){localStorage.setItem(BMX_STATE_KEY,JSON.stringify(state));}
function fmt(n){return Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2});}
function money(n){return "$"+Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});}
function setText(sel,val){document.querySelectorAll(sel).forEach(el=>el.textContent=val);}
function bmxApplyDailyReward(){
  const today=bmxTodayISTKey();
  if(state.lastRewardDay===today || !state.staked || state.staked<=0) return;
  const reward=state.staked*BMX_DAILY_RATE;
  state.balance += reward; state.rewards += reward;
  state.tx.unshift({type:"Staking Reward",amount:reward,status:"Completed",time:new Date().toLocaleString()});
  state.lastRewardDay=today; save();
}
function refresh(){
  bmxApplyDailyReward();
  setText("[data-balance]",fmt(state.balance)+" BMX"); setText("[data-staked]",fmt(state.staked)+" BMX");
  setText("[data-rewards]",fmt(state.rewards)+" BMX"); setText("[data-referrals]",String(state.referrals));
  setText("[data-wallet]",state.wallet); setText("[data-price]","$"+Number(state.price).toFixed(4));
  setText("[data-value]",money(state.balance*state.price));
  const rows=document.querySelector("#txRows"); if(rows){rows.innerHTML=""; state.tx.slice(0,6).forEach(x=>{const tr=document.createElement("tr"); tr.innerHTML=`<td>${x.time}</td><td>${x.type}</td><td class="${x.amount>=0?"positive":""}">${x.amount>=0?"+":""}${fmt(x.amount)} BMX</td><td><span class="pill">${x.status}</span></td>`; rows.appendChild(tr);});}
  const avail=document.querySelector("[data-available]"); if(avail) avail.textContent=fmt(state.balance)+" BMX available";
  const bar=document.querySelector("[data-staked-bar]"); if(bar) bar.style.width=Math.min(100,state.staked/(state.staked+state.balance||1)*100)+"%";
  const next=document.querySelector("[data-next-reward]"); if(next) next.textContent="12:00 AM IST";
}

// Internal website-only transfer and staking interactions.
document.addEventListener("DOMContentLoaded",()=>{
 refresh();
 const page=document.body.dataset.page; document.querySelectorAll(".nav a").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});
 const menu=document.querySelector("#menuBtn"),side=document.querySelector(".sidebar"); if(menu) menu.onclick=()=>side.classList.toggle("open");
 document.querySelectorAll("[data-connect]").forEach(b=>b.onclick=()=>document.querySelector("#walletModal")?.classList.add("open"));
 document.querySelectorAll("[data-close-modal]").forEach(b=>b.onclick=()=>document.querySelector("#walletModal")?.classList.remove("open"));
 document.querySelectorAll("[data-wallet-option]").forEach(b=>b.onclick=()=>{state.wallet=b.dataset.walletOption;save();refresh();document.querySelector("#walletModal")?.classList.remove("open");toast("Preview wallet selected")});
 const copy=document.querySelector("[data-copy]"); if(copy) copy.onclick=async()=>{const input=document.querySelector("[data-ref-input]");try{await navigator.clipboard.writeText(input.value);toast("Referral link copied")}catch{input.select();toast("Select and copy the referral link")}};
 const max=document.querySelector("[data-max]"); if(max) max.onclick=()=>{const i=document.querySelector("#stakeAmount");if(i){i.value=state.balance;i.focus()}};
 const stake=document.querySelector("#stakeForm"); if(stake) stake.onsubmit=e=>{e.preventDefault();const amt=Number(new FormData(stake).get("amount"));if(!amt||amt<=0||amt>state.balance){toast("Enter a valid BMX amount");return}state.balance-=amt;state.staked+=amt;state.tx.unshift({type:"Stake BMX",amount:-amt,status:"Completed",time:new Date().toLocaleString()});save();refresh();toast(fmt(amt)+" BMX staked")};
 const transfer=document.querySelector("#transferForm"); if(transfer) transfer.onsubmit=e=>{e.preventDefault();const fd=new FormData(transfer),amt=Number(fd.get("amount")),to=String(fd.get("to")||"").trim();if(!to||!amt||amt<=0||amt>state.balance){toast("Check recipient and amount");return}state.balance-=amt;state.tx.unshift({type:"Website Transfer to "+to.slice(0,12),amount:-amt,status:"Completed",time:new Date().toLocaleString()});save();refresh();transfer.reset();toast("Website transfer recorded")};
 setInterval(refresh,60000);
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


/* BMX Staking: browser-local account/authentication layer
   This is a UI prototype only. It does not provide server-side security. */
(function () {
  const USERS_KEY = "bmx_users";
  const SESSION_KEY = "bmx_session";
  const REF_KEY = "bmx_referrals";

  const load = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch (_) { return fallback; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function makeCode(name) {
    const base = String(name || "BMX").replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "BMX";
    return base + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function getSession() { return load(SESSION_KEY, null); }
  function setSession(user) { save(SESSION_KEY, { id: user.id }); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function users() { return load(USERS_KEY, []); }
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return users().find(u => u.id === s.id) || null;
  }

  function referralUrl(code) {
    return location.origin + location.pathname.replace(/[^/]*$/, "") +
      "register.html?ref=" + encodeURIComponent(code);
  }

  function createUser(name, email, password, referralCode) {
    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    password = String(password || "");
    if (!name || !email || password.length < 4) return { ok:false, message:"Please enter a name, valid email, and password of at least 4 characters." };

    const list = users();
    if (list.some(u => u.email === email)) return { ok:false, message:"An account with this email already exists. Please sign in." };

    const user = {
      id: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      name, email,
      // Prototype only: password is local browser data, not production authentication.
      password,
      referralCode: makeCode(name),
      referrals: [],
      createdAt: new Date().toISOString()
    };

    list.push(user);
    save(USERS_KEY, list);

    if (referralCode && referralCode !== user.referralCode) {
      const updated = users();
      const referrer = updated.find(u => u.referralCode === referralCode);
      if (referrer && !referrer.referrals.some(r => r.userId === user.id)) {
        referrer.referrals.push({ userId:user.id, name:user.name, email:user.email, joinedAt:new Date().toISOString() });
        save(USERS_KEY, updated);
        const records = load(REF_KEY, []);
        records.push({ referrerId:referrer.id, referredId:user.id, code:referralCode, joinedAt:new Date().toISOString() });
        save(REF_KEY, records);
      }
    }
    setSession(user);
    return { ok:true, user };
  }

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    const user = users().find(u => u.email === email && u.password === String(password || ""));
    if (!user) return { ok:false, message:"Email or password is incorrect." };
    setSession(user);
    return { ok:true, user };
  }

  function logout() {
    clearSession();
    window.location.href = "index.html";
  }

  function protectPages() {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const publicPages = ["", "index.html", "login.html", "register.html", "faq.html", "support.html"];
    if (!publicPages.includes(page) && !currentUser()) {
      window.location.href = "index.html";
      return;
    }
  }

  function ensureLogoutButtons() {
    if (!currentUser()) return;
    document.querySelectorAll("[data-logout], #logoutBtn, .logout-btn").forEach(btn => {
      btn.addEventListener("click", e => { e.preventDefault(); logout(); });
    });
  }

  function personalize() {
    const u = currentUser();
    if (!u) return;
    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = u.name);
    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = u.email);
    document.querySelectorAll("[data-referral-code]").forEach(el => el.textContent = u.referralCode);
    document.querySelectorAll("[data-referral-link]").forEach(el => el.value = referralUrl(u.referralCode));
  }

  window.BMXAuth = {
    createUser, login, logout, currentUser, users, getSession,
    referralUrl, protectPages, personalize
  };

  // Route protection runs before page content becomes interactive.
  protectPages();

  document.addEventListener("DOMContentLoaded", function () {
    personalize();
    ensureLogoutButtons();

    // Generic login form support.
    const loginForm = document.querySelector("form[data-login-form], #loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = loginForm.querySelector('input[name="email"], input[type="email"]')?.value;
        const password = loginForm.querySelector('input[name="password"], input[type="password"]')?.value;
        const result = login(email, password);
        let msg = loginForm.querySelector(".auth-message");
        if (!msg) { msg = document.createElement("div"); msg.className = "auth-message"; loginForm.appendChild(msg); }
        if (result.ok) {
          msg.textContent = "Signed in successfully.";
          msg.className = "auth-message success";
          setTimeout(() => location.href = "dashboard.html", 250);
        } else {
          msg.textContent = result.message;
          msg.className = "auth-message error";
        }
      });
    }

    // Generic registration form support.
    const regForm = document.querySelector("form[data-register-form], #registerForm");
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = regForm.querySelector('input[name="name"], input[name="username"], input[type="text"]')?.value;
        const email = regForm.querySelector('input[name="email"], input[type="email"]')?.value;
        const password = regForm.querySelector('input[name="password"], input[type="password"]')?.value;
        const referral = new URLSearchParams(location.search).get("ref") ||
          regForm.querySelector('input[name="referral"]')?.value || "";
        const result = createUser(name, email, password, referral);
        let msg = regForm.querySelector(".auth-message");
        if (!msg) { msg = document.createElement("div"); msg.className = "auth-message"; regForm.appendChild(msg); }
        if (result.ok) {
          msg.textContent = "Account created. Welcome to BMX Staking.";
          msg.className = "auth-message success";
          setTimeout(() => location.href = "dashboard.html", 300);
        } else {
          msg.textContent = result.message;
          msg.className = "auth-message error";
        }
      });
    }
  });
})();
