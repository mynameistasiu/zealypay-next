"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Config */
const ZEALY_CODE = "ZLP1054XM";
const CODE_PRICE = 10000;
const DEFAULT_BONUS = 150000;
const NIGERIAN_BANKS = [/* ... same bank list ... */ "Access Bank","Zenith Bank","First Bank","GTBank","United Bank for Africa (UBA)","FCMB","Fidelity Bank","Union Bank","Stanbic IBTC","Sterling Bank","Wema Bank","Keystone Bank","Polaris Bank","Jaiz Bank","Unity Bank","SunTrust Bank","Providus Bank","Kuda","Moniepoint MFB","OPay","PalmPay"];
const NETWORKS = ["MTN", "AIRTEL", "GLO", "9MOBILE"];
const DATA_PLANS = [
  { label: "100MB - ₦100", value: 100 },
  { label: "500MB - ₦500", value: 500 },
  { label: "1.5GB - ₦2,000", value: 2000 },
  { label: "5GB - ₦5,000", value: 5000 },
];
const PACKS = [
  { key: "Bronze", amount: 5500, eta: "2 working days" },
  { key: "Silver", amount: 7500, eta: "24 hours" },
  { key: "Gold", amount: 10000, eta: "1–2 hours" },
];

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}
function now() {
  return new Date().toLocaleString();
}

/* Dashboard page (single file) */
export default function DashboardPage() {
  const router = useRouter();

  // auth guard
  const [checkingAuth, setCheckingAuth] = useState(true);

  // user + balance + activities
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(DEFAULT_BONUS);
  const [activities, setActivities] = useState([]);

  // UI / modal state
  const [notifOpen, setNotifOpen] = useState(false);
  const [openPopup, setOpenPopup] = useState(null); // modal name
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState(null);

  // withdraw form
  const [wAccountName, setWAccountName] = useState("");
  const [wAccountNumber, setWAccountNumber] = useState("");
  const [wBank, setWBank] = useState(NIGERIAN_BANKS[0]);
  const [wAmount, setWAmount] = useState("");
  const [wCode, setWCode] = useState("");
  const [wError, setWError] = useState("");

  // upgrade
  const [selectedPack, setSelectedPack] = useState(null);

  // buy code
  const [buyReceiptSent, setBuyReceiptSent] = useState(false);

  // support
  const [supportCategory, setSupportCategory] = useState("General");
  const [supportMessage, setSupportMessage] = useState("");

  // quick flows
  const [codeGateAction, setCodeGateAction] = useState(null); // <-- key change: dedicated action for code gate
  const [codeGateInput, setCodeGateInput] = useState("");
  const [qNetwork, setQNetwork] = useState(NETWORKS[0]);
  const [qPhone, setQPhone] = useState("");
  const [qPlan, setQPlan] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qBillType, setQBillType] = useState("Electricity");
  const [qBillAccount, setQBillAccount] = useState("");
  const [investmentType, setInvestmentType] = useState("Spend & Save");
  const [investmentAmount, setInvestmentAmount] = useState("");

  // profile
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileNotif, setProfileNotif] = useState(true);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // ads
  const [adIndex, setAdIndex] = useState(0);

  /* Load persisted data once */
  useEffect(() => {
    const logged = localStorage.getItem("zealy:isLoggedIn") === "true";
    if (!logged) {
      router.replace("/login");
      return;
    }

    const rawUser = localStorage.getItem("zealy:user");
    let u = null;
    try { u = rawUser ? JSON.parse(rawUser) : null; } catch(e){ u = null; }
    if (!u) {
      u = { id: uid("user"), fullName: "New User", email: "user@example.com", phone: "", settings: { notifications: true }, password: "password" };
      localStorage.setItem("zealy:user", JSON.stringify(u));
    }
    setUser(u);
    setProfileName(u.fullName || "");
    setProfileEmail(u.email || "");
    setProfilePhone(u.phone || "");
    setProfileNotif(Boolean(u.settings?.notifications));

    const bal = Number(localStorage.getItem("zealy:balance") || DEFAULT_BONUS);
    setBalance(isNaN(bal) ? DEFAULT_BONUS : bal);

    const savedActs = JSON.parse(localStorage.getItem("zealy:activities") || "null");
    if (Array.isArray(savedActs)) setActivities(savedActs);
    else {
      const txns = JSON.parse(localStorage.getItem("zealy:transactions") || "[]");
      const notes = JSON.parse(localStorage.getItem("zealy:notifications") || "[]");
      const txActs = txns.map(t => ({ id: t.id || uid("txn"), type: t.type || "Transaction", title: t.details || t.type, amount: t.amount || 0, status: t.status || "Pending", date: t.date || now() }));
      const noteActs = notes.map(n => ({ id: uid("note"), type: "Notification", title: n.text || n, amount: null, status: "Info", date: n.date || now() }));
      const merged = [...txActs, ...noteActs].sort((a,b)=> new Date(b.date) - new Date(a.date));
      setActivities(merged);
      localStorage.setItem("zealy:activities", JSON.stringify(merged));
    }
    setCheckingAuth(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("zealy:activities", JSON.stringify(activities));
    const txns = activities.filter(a => ["Withdraw","Buy Zealy Code","Upgrade","Data","Airtime","Pay Bills","Investment"].includes(a.type));
    const notes = activities.filter(a => !txns.includes(a)).map(n => ({ date: n.date, text: n.title }));
    localStorage.setItem("zealy:transactions", JSON.stringify(txns.map(t => ({ id: t.id, date: t.date, type: t.type, details: t.title, amount: t.amount, status: t.status }))));
    localStorage.setItem("zealy:notifications", JSON.stringify(notes));
  }, [activities]);

  useEffect(() => localStorage.setItem("zealy:balance", String(balance)), [balance]);

  useEffect(() => {
    const id = setInterval(()=> setAdIndex(i=> (i+1)%4), 4000);
    return ()=> clearInterval(id);
  }, []);

  useEffect(()=> {
    if (!toast) return;
    const id = setTimeout(()=> setToast(null), 3000);
    return ()=> clearTimeout(id);
  }, [toast]);

  function pushActivity(act) {
    const item = { id: act.id || uid("act"), ...act };
    setActivities(prev => [item, ...prev]);
  }

  function doLogout() {
    localStorage.setItem("zealy:isLoggedIn", "false");
    router.replace("/");
  }

  /* OPEN/START functions */
  function openWithdraw() {
    setWAccountName(""); setWAccountNumber(""); setWBank(NIGERIAN_BANKS[0]); setWAmount(""); setWCode(""); setWError("");
    setOpenPopup("withdraw");
  }
  function openUpgrade() { setSelectedPack(null); setOpenPopup("upgrade"); }
  function openBuyCode() { setBuyReceiptSent(false); setOpenPopup("buycode"); }
  function openSupport() { setSupportCategory("General"); setSupportMessage(""); setOpenPopup("support"); }
  function openProfile() {
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    setProfileName(u.fullName || "");
    setProfileEmail(u.email || "");
    setProfilePhone(u.phone || "");
    setProfileNotif(Boolean(u.settings?.notifications));
    setProfileOpen(true);
  }

  /* Start quick: sets dedicated codeGateAction then opens gate modal */
  function startQuick(name) {
    setCodeGateAction(name); // store the action for gate submit
    setCodeGateInput("");
    setOpenPopup("codegate");
  }

  /* --- handlers --- */
  async function submitWithdraw(e) {
    e && e.preventDefault && e.preventDefault();
    setWError("");
    if (!wAccountName || !wAccountNumber || !wBank || !wAmount) { setWError("Please fill all required fields."); return; }
    if (!wCode || wCode.trim().toUpperCase() !== ZEALY_CODE) { setWError("Invalid Zealy Code."); return; }
    const amt = Number(wAmount);
    if (!amt || amt <=0) { setWError("Enter a valid amount."); return; }
    if (amt > balance) { setWError("Insufficient balance."); return; }

    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Withdraw", title: `${wBank} • ${wAccountName} (${wAccountNumber})`, amount: amt, status: "Successful ✅", date: now() };
    pushActivity(act);
    setBalance(b => Math.max(0, b - amt));
    pushActivity({ id: uid("note"), type: "Notification", title: `💸 Withdrawal ₦${amt.toLocaleString()} successful.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Withdrawal successful", type: "success" });
  }

  async function confirmUpgrade() {
    if (!selectedPack) { setToast({ text: "Please select a package", type: "warn" }); return; }
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Upgrade", title: `${selectedPack.key} — pay ₦${selectedPack.amount.toLocaleString()}`, amount: selectedPack.amount, status: "Pending ⏳", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `⬆️ Upgrade requested: ${selectedPack.key} (Pending)`, date: now(), status: "Info" });
    localStorage.setItem("zealy:upgradePending", JSON.stringify({ pack:selectedPack.key, amount: selectedPack.amount, date: now() }));
    setLoadingAction(false);
    setOpenPopup(null);
    setSelectedPack(null);
    setToast({ text: "Upgrade requested", type: "info" });
  }

  async function confirmBuyCode() {
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Buy Zealy Code", title: `Purchased code ${ZEALY_CODE}`, amount: CODE_PRICE, status: "Successful ✅", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `🧾 Zealy Code purchase marked Successful.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Zealy Code purchased", type: "success" });
  }

  async function submitSupport(e) {
    e && e.preventDefault && e.preventDefault();
    if (!supportMessage) { setToast({ text: "Write a message first", type: "warn" }); return; }
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    const tickets = JSON.parse(localStorage.getItem("zealy:support") || "[]");
    tickets.unshift({ id: uid("ticket"), date: now(), category: supportCategory, message: supportMessage, reply: null });
    localStorage.setItem("zealy:support", JSON.stringify(tickets));
    pushActivity({ id: uid("note"), type: "Notification", title: `📩 Support message sent (${supportCategory}).`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Support message sent", type: "success" });
  }

  /* Code gate submit reads codeGateAction (robust) */
  function submitCodeGate(e) {
    e && e.preventDefault && e.preventDefault();
    if (codeGateInput.trim().toUpperCase() !== ZEALY_CODE) {
      setToast({ text: "Invalid Zealy Code", type: "error" });
      return;
    }
    // map
    const mapping = { "Data": "quick-data", "Airtime": "quick-airtime", "Pay Bills": "quick-bills", "Investment": "quick-invest" };
    setOpenPopup(mapping[codeGateAction] || null);
    setCodeGateAction(null);
    setCodeGateInput("");
  }

  async function submitData(e) {
    e && e.preventDefault && e.preventDefault();
    if (!qPhone || !qPlan) { setToast({ text: "Enter phone and plan", type: "warn" }); return; }
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    const plan = DATA_PLANS.find(p => String(p.value) === String(qPlan));
    const amount = plan ? plan.value : Number(qAmount || 0);
    pushActivity({ id: uid("txn"), type: "Data", title: `${qNetwork} - ${plan.label} to ${qPhone}`, amount, status: "Successful ✅", date: now() });
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qNetwork} ${plan.label} purchased for ${qPhone}.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Data purchased", type: "success" });
  }

  async function submitAirtime(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(qAmount);
    if (!qPhone || !qAmount || amt <= 0) { setToast({ text: "Enter phone and valid amount", type: "warn" }); return; }
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    pushActivity({ id: uid("txn"), type: "Airtime", title: `${qNetwork} airtime to ${qPhone}`, amount: amt, status: "Successful ✅", date: now() });
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ Airtime ₦${amt} sent to ${qPhone}.`, date: now(), status: "Info" });
    setLoadingAction(false); setOpenPopup(null); setToast({ text: "Airtime sent", type: "success" });
  }

  async function submitBill(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(qAmount);
    if (!qBillAccount || !qAmount || amt <= 0) { setToast({ text: "Enter account/ref and valid amount", type: "warn" }); return; }
    setLoadingAction(true);
    await new Promise(r=> setTimeout(r, 700));
    pushActivity({ id: uid("txn"), type: "Pay Bills", title: `${qBillType} • ${qBillAccount}`, amount: amt, status: "Successful ✅", date: now() });
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qBillType} payment ₦${amt} for ${qBillAccount}.`, date: now(), status: "Info" });
    setLoadingAction(false); setOpenPopup(null); setToast({ text: "Bill paid", type: "success" });
  }

  async function submitInvestment(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(investmentAmount);
    if (!amt || amt <= 0) { setToast({ text: "Enter valid amount", type: "warn" }); return; }
    setLoadingAction(true); await new Promise(r=> setTimeout(r, 700));
    pushActivity({ id: uid("txn"), type: "Investment", title: `${investmentType} — start ₦${amt.toLocaleString()}`, amount: amt, status: "Pending", date: now() });
    pushActivity({ id: uid("note"), type: "Notification", title: `💼 Investment request: ${investmentType} ₦${amt.toLocaleString()} (Pending).`, date: now(), status: "Info" });
    setLoadingAction(false); setOpenPopup(null); setToast({ text: "Investment requested", type: "info" });
  }

  /* Profile handlers (email readonly per request) */
  function openProfileModal() {
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    setProfileName(u.fullName || "");
    setProfilePhone(u.phone || "");
    setProfileEmail(u.email || "");
    setProfileNotif(Boolean(u.settings?.notifications));
    setProfileOpen(true);
    setProfileMsg("");
  }
  function saveProfile(e) {
    e && e.preventDefault && e.preventDefault();
    if (!profileName || !profileEmail) { setProfileMsg("Name and email required"); return; }
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    u.fullName = profileName; u.phone = profilePhone; u.email = profileEmail;
    u.settings = u.settings || {}; u.settings.notifications = !!profileNotif;
    localStorage.setItem("zealy:user", JSON.stringify(u));
    setUser(u); setProfileMsg("Saved"); setTimeout(()=> { setProfileOpen(false); setProfileMsg(""); }, 700);
  }
  function changePassword(e) {
    e && e.preventDefault && e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) { setProfileMsg("Fill password fields"); return; }
    if (newPass !== confirmPass) { setProfileMsg("New passwords do not match"); return; }
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    if (u.password && oldPass !== u.password) { setProfileMsg("Old password incorrect"); return; }
    u.password = newPass; localStorage.setItem("zealy:user", JSON.stringify(u)); setProfileMsg("Password changed (demo)"); setOldPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(()=> setProfileMsg(""), 1000);
  }

  if (checkingAuth) return null;

  /* ---------- UI components used inline ---------- */
  const Spinner = () => (
    <svg width="18" height="18" viewBox="0 0 50 50" style={{ verticalAlign: "middle" }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.2"></circle>
      <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0f172a 0%, #0ea5e9 55%, #7c3aed 100%)", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#c7f9cc" }}>ZealyPay</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Secure wallet • ₦{Number(balance).toLocaleString()} balance</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setNotifOpen(s => !s)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>🔔</button>
            <button onClick={openProfileModal} style={{ padding: 8, borderRadius: 8, background: "linear-gradient(90deg,#6366f1,#06b6d4)" }}>Profile</button>
            <button onClick={doLogout} style={{ padding: 8, borderRadius: 8, background: "#ef4444" }}>Logout</button>
          </div>
        </div>

        {/* notifications */}
        {notifOpen && (
          <div style={{ position: "absolute", right: 24, top: 80, background: "#fff", color: "#0f172a", padding: 12, borderRadius: 10, width: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Activities</div>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              {activities.length === 0 ? <div style={{ color: "#6b7280" }}>No activity yet</div> : activities.slice(0, 30).map(a => (
                <div key={a.id} style={{ borderBottom: "1px solid rgba(17,24,39,0.04)", padding: "8px 0" }}>
                  <div style={{ fontWeight: 600 }}>{a.title || a.type}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{a.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* wallet card */}
            <div style={{ padding: 16, borderRadius: 12, background: "linear-gradient(90deg,#042f4a,#0b3048)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14 }}>Hi, <b>{user?.fullName || "User"}</b> 👋</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Welcome to your Zealy Wallet</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Current Balance</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>₦{Number(balance).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                <button onClick={openWithdraw} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#06b6d4,#06b6a4)", fontWeight: 700 }}>Withdraw</button>
                <button onClick={openUpgrade} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#f59e0b,#f97316)", fontWeight: 700 }}>Upgrade</button>
                <button onClick={openBuyCode} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", fontWeight: 700 }}>Buy Zealy Code</button>
                <button onClick={openSupport} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#ef4444,#ec4899)", fontWeight: 700 }}>Support</button>
              </div>
            </div>

            {/* quick access */}
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Quick Access</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Enter Zealy Code</div>
              </div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                <button onClick={() => startQuick("Data")} style={{ padding: 10, borderRadius: 8, background: "#0ea5e9" }}>📶 Data</button>
                <button onClick={() => startQuick("Airtime")} style={{ padding: 10, borderRadius: 8, background: "#06b6d4" }}>📱 Airtime</button>
                <button onClick={() => startQuick("Pay Bills")} style={{ padding: 10, borderRadius: 8, background: "#7c3aed" }}>🧾 Pay Bills</button>
                <button onClick={() => startQuick("Investment")} style={{ padding: 10, borderRadius: 8, background: "#06b6a4" }}>💼 Investment</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12 }}>Enter code <b>{ZEALY_CODE}</b> to unlock these services.</div>
            </div>

            {/* activities */}
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Recent Activities</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{activities.length} items</div>
              </div>
              <div style={{ marginTop: 10, maxHeight: 320, overflow: "auto" }}>
                {activities.length === 0 ? <div style={{ color: "rgba(255,255,255,0.7)" }}>No activities yet</div> : activities.map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.type} {a.title ? "— " + a.title : ""}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{a.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {a.amount ? <div style={{ fontWeight: 800 }}>₦{Number(a.amount).toLocaleString()}</div> : null}
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{a.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ads */}
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>How to earn ₦200k</div>
              <div style={{ marginTop: 10, height: 90, borderRadius: 8, background: "linear-gradient(90deg,#0ea5e9,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {adIndex === 0 && <div style={{ textAlign: "center", color: "#fff" }}><b>Step 1</b><div>Buy a Zealy Code & send receipt</div></div>}
                {adIndex === 1 && <div style={{ textAlign: "center", color: "#fff" }}><b>Step 2</b><div>Complete dashboard tasks</div></div>}
                {adIndex === 2 && <div style={{ textAlign: "center", color: "#fff" }}><b>Step 3</b><div>Refer friends for entries</div></div>}
                {adIndex === 3 && <div style={{ textAlign: "center", color: "#fff" }}><b>Step 4</b><div>Winners chosen monthly</div></div>}
              </div>
            </div>
          </div>

          {/* sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Account</div>
              <div style={{ marginTop: 8 }}>{user?.fullName}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{user?.email}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{user?.phone || "—"}</div>
              <div style={{ marginTop: 8 }}><button onClick={openProfileModal} style={{ padding: 8, borderRadius: 8, background: "#7c3aed" }}>Edit Profile</button></div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Quick actions</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <button onClick={openWithdraw} style={{ padding: 8, borderRadius: 8, background: "#06b6d4" }}>Withdraw</button>
                <button onClick={openUpgrade} style={{ padding: 8, borderRadius: 8, background: "#f59e0b" }}>Upgrade</button>
                <button onClick={openBuyCode} style={{ padding: 8, borderRadius: 8, background: "#3b82f6" }}>Buy Zealy Code</button>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Support</div>
              <div style={{ marginTop: 8 }}>Need help? Chat on WhatsApp or open Support.</div>
              <div style={{ marginTop: 10 }}><a style={{ padding: 8, borderRadius: 8, background: "#10b981", color: "#fff", display: "inline-block", textDecoration: "none" }} href="https://wa.me/2348161662371" target="_blank" rel="noreferrer">WhatsApp Support</a></div>
            </div>
          </aside>
        </div>
      </div>

      {/* Overlay (closes on click) */}
      {(openPopup || profileOpen) && <div onClick={() => { setOpenPopup(null); setProfileOpen(false); setCodeGateAction(null); }} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(2,6,23,0.6)" }} />}

      {/* ---------- modals ---------- */}

      {/* withdraw */}
      {openPopup === "withdraw" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Withdraw Funds</h3><button onClick={() => setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <p style={{ color: "#6b7280" }}>Fill your bank details and enter Zealy Code to confirm withdrawal.</p>
          <form onSubmit={submitWithdraw} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <label>Account Name<input className="input" value={wAccountName} onChange={(e)=>setWAccountName(e.target.value)} /></label>
            <label>Account Number<input className="input" value={wAccountNumber} onChange={(e)=>setWAccountNumber(e.target.value)} /></label>
            <label>Bank<select className="input" value={wBank} onChange={(e)=>setWBank(e.target.value)}>{NIGERIAN_BANKS.map(b=> <option key={b}>{b}</option>)}</select></label>
            <label>Amount (₦)<input className="input" type="number" value={wAmount} onChange={(e)=>setWAmount(e.target.value)} /></label>
            <label style={{ gridColumn: "1 / -1" }}>Enter Zealy Code<input className="input" value={wCode} onChange={(e)=>setWCode(e.target.value)} placeholder="" /></label>
            {wError && <div style={{ color: "#dc2626" }}>{wError}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", gridColumn: "1 / -1" }}>
              <button type="button" onClick={() => setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner /> : "Submit Withdrawal"}</button>
            </div>
          </form>
        </div>
      )}

      {/* upgrade */}
      {openPopup === "upgrade" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Upgrade Account</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <p style={{ color: "#6b7280" }}>Choose a package and follow payment instructions. Selected upgrades appear as pending.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {PACKS.map(p => (
              <div key={p.key} style={{ background: "#fff", color: "#0f172a", padding: 12, borderRadius: 8, border: selectedPack?.key===p.key ? "2px solid #6366f1" : "1px solid #e6e6e6" }}>
                <div style={{ fontWeight: 700 }}>{p.key}</div>
                <div style={{ color: "#6b7280", marginTop:6 }}>₦{p.amount.toLocaleString()}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>{p.eta}</div>
                <div style={{ marginTop:8 }}><button onClick={() => setSelectedPack(p)} style={{ padding:8, borderRadius:8, background:"#6366f1", color:"#fff" }}>Select</button></div>
              </div>
            ))}
          </div>
          {selectedPack && <div style={{ marginTop:12, padding: 12, borderRadius:8, background: "#fff7ed" }}>
            <div>Send <b>₦{selectedPack.amount.toLocaleString()}</b> to:</div>
            <div style={{ marginTop:6 }}>Bank: <b>Moniepoint</b><br/>Account Name: <b>Sadiq Mamuda</b><br/>Account Number: <b>5073816968</b></div>
            <div style={{ marginTop:8, display:"flex", gap:8 }}>
              <a href="https://wa.me/2348161662371" target="_blank" rel="noreferrer" onClick={()=>setBuyReceiptSent(true)} style={{ padding:8, borderRadius:8, background:"#10b981", color:"#fff", textDecoration:"none" }}>📲 Send Receipt on WhatsApp</a>
              <button onClick={confirmUpgrade} style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "I have sent money for upgrade"}</button>
              <button onClick={()=>{ setSelectedPack(null); setOpenPopup(null); }} style={ghostBtn}>Cancel</button>
            </div>
          </div>}
        </div>
      )}

      {/* buycode */}
      {openPopup === "buycode" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Buy Zealy Code</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <p style={{ color:"#6b7280" }}>Purchase the code. After payment, send receipt via WhatsApp before confirming.</p>
          <div style={{ padding:10, background:"#f1f5f9", borderRadius:8 }}>
            <div>Bank: <b>Moniepoint</b></div>
            <div>Account Name: <b>Sadiq Mamuda</b></div>
            <div>Account Number: <b>5073816968</b></div>
            <div style={{ marginTop:6, fontWeight:700 }}>Amount: ₦{CODE_PRICE.toLocaleString()}</div>
          </div>
          <div style={{ marginTop:10, display:"flex", gap:8 }}>
            <a href="https://wa.me/2348161662371" target="_blank" rel="noreferrer" onClick={()=>setBuyReceiptSent(true)} style={{ padding:10, borderRadius:8, background:"#16a34a", color:"#fff", textDecoration:"none" }}>📲 Send Receipt on WhatsApp</a>
            <button onClick={confirmBuyCode} style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "I have made payment"}</button>
            <button onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* support */}
      {openPopup === "support" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Contact Support</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <form onSubmit={submitSupport} style={{ display:"grid", gap:8 }}>
            <label>Category<select className="input" value={supportCategory} onChange={(e)=>setSupportCategory(e.target.value)}><option>Complaint</option><option>Payment Issue</option><option>Upgrade Problem</option><option>General</option></select></label>
            <label>Message<textarea className="input" rows={4} value={supportMessage} onChange={(e)=>setSupportMessage(e.target.value)} /></label>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "Send"}</button>
            </div>
          </form>
        </div>
      )}

      {/* code gate */}
      {openPopup === "codegate" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Enter Zealy Code</h3><button onClick={()=>{ setOpenPopup(null); setCodeGateAction(null); }} style={closeBtn}>✖</button></div>
          <form onSubmit={submitCodeGate} style={{ display:"grid", gap:10 }}>
            <input className="input" placeholder="Enter Zealy Code" value={codeGateInput} onChange={(e)=>setCodeGateInput(e.target.value)} />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button type="button" onClick={()=>{ setOpenPopup(null); setCodeGateAction(null); }} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn}>Unlock</button>
            </div>
          </form>
        </div>
      )}

      {/* quick-data */}
      {openPopup === "quick-data" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Buy Data</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <form onSubmit={submitData} style={{ display:"grid", gap:8 }}>
            <label>Network<select className="input" value={qNetwork} onChange={(e)=>setQNetwork(e.target.value)}>{NETWORKS.map(n=> <option key={n}>{n}</option>)}</select></label>
            <label>Phone Number<input className="input" value={qPhone} onChange={(e)=>setQPhone(e.target.value)} /></label>
            <label>Plan<select className="input" value={qPlan} onChange={(e)=>setQPlan(e.target.value)}><option value="">Select plan</option>{DATA_PLANS.map(p=> <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "Buy Data"}</button>
            </div>
          </form>
        </div>
      )}

      {/* quick-airtime */}
      {openPopup === "quick-airtime" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Buy Airtime</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <form onSubmit={submitAirtime} style={{ display:"grid", gap:8 }}>
            <label>Network<select className="input" value={qNetwork} onChange={(e)=>setQNetwork(e.target.value)}>{NETWORKS.map(n=> <option key={n}>{n}</option>)}</select></label>
            <label>Phone Number<input className="input" value={qPhone} onChange={(e)=>setQPhone(e.target.value)} /></label>
            <label>Amount<input className="input" type="number" value={qAmount} onChange={(e)=>setQAmount(e.target.value)} /></label>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "Send Airtime"}</button>
            </div>
          </form>
        </div>
      )}

      {/* quick-bills */}
      {openPopup === "quick-bills" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Pay Bills</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <form onSubmit={submitBill} style={{ display:"grid", gap:8 }}>
            <label>Bill Type<select className="input" value={qBillType} onChange={(e)=>setQBillType(e.target.value)}><option>Electricity</option><option>Water</option><option>School Fee</option><option>Internet</option></select></label>
            <label>Account / Reference<input className="input" value={qBillAccount} onChange={(e)=>setQBillAccount(e.target.value)} /></label>
            <label>Amount<input className="input" type="number" value={qAmount} onChange={(e)=>setQAmount(e.target.value)} /></label>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "Pay Bill"}</button>
            </div>
          </form>
        </div>
      )}

      {/* quick-invest */}
      {openPopup === "quick-invest" && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Invest</h3><button onClick={()=>setOpenPopup(null)} style={closeBtn}>✖</button></div>
          <form onSubmit={submitInvestment} style={{ display:"grid", gap:8 }}>
            <label>Product<select className="input" value={investmentType} onChange={(e)=>setInvestmentType(e.target.value)}><option>Spend & Save</option><option>Fixed Account</option><option>Target Savings</option></select></label>
            <label>Amount<input className="input" type="number" value={investmentAmount} onChange={(e)=>setInvestmentAmount(e.target.value)} /></label>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setOpenPopup(null)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn} disabled={loadingAction}>{loadingAction ? <Spinner/> : "Start Investment"}</button>
            </div>
          </form>
        </div>
      )}

      {/* profile modal */}
      {profileOpen && (
        <div style={modalStyle}>
          <div style={modalHeader}><h3 style={{ margin:0 }}>Profile</h3><button onClick={()=>setProfileOpen(false)} style={closeBtn}>✖</button></div>
          <form onSubmit={saveProfile} style={{ display:"grid", gap:8 }}>
            <label>Full name<input className="input" value={profileName} onChange={(e)=>setProfileName(e.target.value)} /></label>
            <label>Phone<input className="input" value={profilePhone} onChange={(e)=>setProfilePhone(e.target.value)} /></label>
            <label>Email (read-only)<input className="input" value={profileEmail} readOnly /><div style={{ color:"#6b7280", fontSize:12 }}>Email is read-only here. Contact support to change it.</div></label>
            <div style={{ marginTop:8 }}>
              <div style={{ fontWeight:700 }}>Change password</div>
              <input className="input" type="password" placeholder="Old password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} />
              <input className="input" type="password" placeholder="New password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
              <input className="input" type="password" placeholder="Confirm new password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} />
              <button type="button" onClick={changePassword} style={{ marginTop:8, padding:8, borderRadius:8, background:"#06b6d4", color:"#fff" }}>Change password</button>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input id="notif" type="checkbox" checked={profileNotif} onChange={(e)=>setProfileNotif(e.target.checked)} />
              <label htmlFor="notif">Enable notifications</label>
            </div>
            {profileMsg && <div style={{ color:"#065f46", fontWeight:700 }}>{profileMsg}</div>}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" onClick={()=>setProfileOpen(false)} style={ghostBtn}>Cancel</button>
              <button type="submit" style={primaryBtn}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* toast */}
      {toast && <div style={{ position:"fixed", left:"50%", transform:"translateX(-50%)", bottom:28, background: toast.type==="success" ? "linear-gradient(90deg,#10b981,#059669)" : toast.type==="error" ? "linear-gradient(90deg,#ef4444,#f97316)" : "linear-gradient(90deg,#3b82f6,#06b6d4)", padding:"10px 14px", borderRadius:8 }}>{toast.text}</div>}

      {/* small styles used inline components */}
      <style jsx>{`
        .input { width:100%; padding:8px 10px; border-radius:8px; border:1px solid rgba(2,6,23,0.08); box-sizing:border-box; }
      `}</style>
    </main>
  );
}

/* Shared inline style helpers */
const modalStyle = {
  position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 100,
  width: "min(920px, 95%)", maxHeight: "92vh", overflowY: "auto", background: "#fff", color: "#0f172a", padding: 18, borderRadius: 12, boxShadow: "0 18px 60px rgba(2,6,23,0.6)"
};
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const closeBtn = { background: "transparent", border: "none", fontSize: 18, cursor: "pointer" };
const primaryBtn = { padding: "8px 12px", borderRadius: 8, background: "linear-gradient(90deg,#06b6d4,#3b82f6)", color: "#001", border: "none", cursor: "pointer" };
const ghostBtn = { padding: "8px 12px", borderRadius: 8, background: "#e6e6e6", border: "none", cursor: "pointer" };

/* Inline spinner used above (SVG) */
function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 50 50" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#111827" strokeWidth="4" strokeOpacity="0.2"></circle>
      <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}
