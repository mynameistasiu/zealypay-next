"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ---------- Config & Data ---------- */

const ZEALY_CODE = "ZLP1054XM";
const CODE_PRICE = 10000;
const DEFAULT_BONUS = 200000;
const NIGERIAN_BANKS = [
  "Access Bank","Zenith Bank","First Bank","GTBank","United Bank for Africa (UBA)",
  "FCMB","Fidelity Bank","Union Bank","Stanbic IBTC","Sterling Bank","Wema Bank",
  "Keystone Bank","Polaris Bank","Jaiz Bank","Unity Bank","SunTrust Bank",
  "Providus Bank","Kuda","Moniepoint MFB","OPay","PalmPay"
];
const NETWORKS = ["MTN", "AIRTEL", "GLO", "9MOBILE"];
const DATA_PLANS = [
  { label: "100MB - ₦100", value: 100 },
  { label: "500MB - ₦500", value: 500 },
  { label: "1.5GB - ₦2,000", value: 2000 },
  { label: "5GB - ₦5,000", value: 5000 }
];
const PACKS = [
  { key: "Bronze", amount: 5500, eta: "2 working days" },
  { key: "Silver", amount: 7500, eta: "24 hours" },
  { key: "Gold", amount: 10000, eta: "1–2 hours" },
];

/* ---------- Helper Utilities ---------- */

function now() {
  return new Date().toLocaleString();
}
function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random()*9000)+1000}`;
}

/* ---------- Component (page) ---------- */

export default function DashboardPage() {
  const router = useRouter();

  // auth guard
  const [checkingAuth, setCheckingAuth] = useState(true);

  // core data
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(DEFAULT_BONUS);
  const [activities, setActivities] = useState([]);

  // UI
  const [notifOpen, setNotifOpen] = useState(false);
  const [popup, setPopup] = useState(null); // 'withdraw','upgrade','buycode','support','quick-data',...
  const [codeGateOpen, setCodeGateOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [quickAction, setQuickAction] = useState(null);

  // device
  const [isMobile, setIsMobile] = useState(false);

  // Withdraw form
  const [wAccountName, setWAccountName] = useState("");
  const [wAccountNumber, setWAccountNumber] = useState("");
  const [wBank, setWBank] = useState(NIGERIAN_BANKS[0]);
  const [wAmount, setWAmount] = useState("");
  const [wCode, setWCode] = useState("");
  const [wError, setWError] = useState("");

  // Upgrade
  const [selectedPack, setSelectedPack] = useState(null);

  // Buy code
  const [buyReceiptSent, setBuyReceiptSent] = useState(false);

  // Support
  const [supportCategory, setSupportCategory] = useState("General");
  const [supportMessage, setSupportMessage] = useState("");

  // Quick services
  const [qNetwork, setQNetwork] = useState(NETWORKS[0]);
  const [qPhone, setQPhone] = useState("");
  const [qPlan, setQPlan] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qBillType, setQBillType] = useState("Electricity");
  const [qBillAccount, setQBillAccount] = useState("");
  const [investmentType, setInvestmentType] = useState("Spend & Save");
  const [investmentAmount, setInvestmentAmount] = useState("");

  // Profile
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileFullName, setProfileFullName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileNotif, setProfileNotif] = useState(true);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Ads carousel
  const [adIndex, setAdIndex] = useState(0);

  // Loading states for animations
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  /* ---------- Init / localStorage ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // device detection
    const checkMobile = () => setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    checkMobile();
    window.addEventListener("resize", checkMobile);
    // cleanup
    const cleanup = () => window.removeEventListener("resize", checkMobile);

    // auth
    const logged = localStorage.getItem("zealy:isLoggedIn") === "true";
    if (!logged) {
      router.replace("/login");
      cleanup();
      return;
    }

    // load user
    const rawUser = localStorage.getItem("zealy:user");
    let u = null;
    if (rawUser) {
      try { u = JSON.parse(rawUser); } catch (e) { u = null; }
    }
    if (!u) {
      u = {
        id: uid("user"),
        fullName: "New User",
        email: "user@example.com",
        phone: "",
        created: now(),
        settings: { notifications: true }
      };
      localStorage.setItem("zealy:user", JSON.stringify(u));
    }
    setUser(u);
    setProfileFullName(u.fullName || "");
    setProfileEmail(u.email || "");
    setProfilePhone(u.phone || "");
    setProfileNotif(Boolean(u.settings?.notifications));

    // balance
    const bal = Number(localStorage.getItem("zealy:balance") || DEFAULT_BONUS);
    setBalance(isNaN(bal) ? DEFAULT_BONUS : bal);

    // activities
    const savedActs = JSON.parse(localStorage.getItem("zealy:activities") || "null");
    if (Array.isArray(savedActs)) {
      setActivities(savedActs);
    } else {
      const txns = JSON.parse(localStorage.getItem("zealy:transactions") || "[]");
      const notes = JSON.parse(localStorage.getItem("zealy:notifications") || "[]");
      const txActs = txns.map(t => ({
        id: t.id || uid("txn"),
        type: t.type || "Transaction",
        title: t.type + (t.details ? ` — ${t.details}` : ""),
        amount: t.amount || 0,
        status: t.status || "Successful ✅",
        date: t.date || now()
      }));
      const noteActs = notes.map(n => ({
        id: uid("note"),
        type: "Notification",
        title: n.text || n,
        amount: null,
        status: "Info",
        date: n.date || now()
      }));
      const merged = [...txActs, ...noteActs].sort((a,b)=> new Date(b.date) - new Date(a.date));
      setActivities(merged);
      localStorage.setItem("zealy:activities", JSON.stringify(merged));
    }

    setCheckingAuth(false);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("zealy:activities", JSON.stringify(activities));
    const txns = activities.filter(a => ["Withdraw","Upgrade","Buy Zealy Code","Airtime","Data","Pay Bills","Investment"].includes(a.type) || a.type.startsWith("Upgrade "));
    const notes = activities.filter(a => !txns.includes(a)).map(n => ({ date: n.date, text: n.title }));
    localStorage.setItem("zealy:transactions", JSON.stringify(txns.map(t => ({ id: t.id, date: t.date, type: t.type, details: t.title, amount: t.amount, status: t.status }))));
    localStorage.setItem("zealy:notifications", JSON.stringify(notes));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("zealy:balance", String(balance));
  }, [balance]);

  /* ---------- Helpers ---------- */

  function pushActivity(act) {
    const item = { id: act.id || uid("act"), ...act };
    setActivities(prev => [item, ...prev]);
  }

  function doLogout() {
    localStorage.setItem("zealy:isLoggedIn", "false");
    router.replace("/login");
  }

  /* ---------- Withdraw (now marks successful) ---------- */

  function openWithdraw() {
    setWAccountName("");
    setWAccountNumber("");
    setWBank(NIGERIAN_BANKS[0]);
    setWAmount("");
    setWCode("");
    setWError("");
    setPopup("withdraw");
  }

  async function submitWithdraw(e) {
    e.preventDefault();
    setWError("");
    if (!wAccountName || !wAccountNumber || !wBank || !wAmount || !wCode) {
      setWError("Please fill all fields (including Zealy Code).");
      return;
    }
    if (wCode.trim().toUpperCase() !== ZEALY_CODE) {
      setWError("Invalid Zealy Code.");
      return;
    }
    const amt = Number(wAmount);
    if (!amt || amt <= 0) { setWError("Enter a valid amount."); return; }
    if (amt > balance) { setWError("Insufficient balance."); return; }

    // animation: set loading
    setWithdrawLoading(true);

    // simulate small processing delay for better UX
    setTimeout(() => {
      // mark successful (per your request)
      const act = {
        id: uid("txn"),
        type: "Withdraw",
        title: `${wBank} • ${wAccountName} (${wAccountNumber})`,
        amount: amt,
        status: "Successful ✅",
        date: now()
      };
      pushActivity(act);
      setBalance(prev => Math.max(0, prev - amt));
      pushActivity({ id: uid("note"), type: "Notification", title: `✅ Withdrawal ₦${amt.toLocaleString()} successful.`, date: now(), amount: null, status: "Info" });
      setWithdrawLoading(false);
      setPopup(null);
    }, 700);
  }

  /* ---------- Upgrade ---------- */

  function openUpgrade() {
    setSelectedPack(null);
    setPopup("upgrade");
  }
  function selectUpgrade(pack) {
    setSelectedPack(pack);
  }
  function confirmUpgrade() {
    if (!selectedPack) return;
    setUpgradeLoading(true);
    setTimeout(() => {
      const act = {
        id: uid("txn"),
        type: "Upgrade",
        title: `${selectedPack.key} — pay ₦${selectedPack.amount.toLocaleString()}`,
        amount: selectedPack.amount,
        status: "Pending ⏳",
        date: now()
      };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `⬆️ Upgrade requested: ${selectedPack.key} (Pending)`, amount: null, status: "Info", date: now() });
      setUpgradeLoading(false);
      setPopup(null);
      setSelectedPack(null);
    }, 800);
  }

  /* ---------- Buy Zealy Code ---------- */

  function openBuyCode() {
    setBuyReceiptSent(false);
    setPopup("buycode");
  }
  function confirmBuyCode() {
    setBuyLoading(true);
    setTimeout(() => {
      const act = {
        id: uid("txn"),
        type: "Buy Zealy Code",
        title: `Purchased code`,
        amount: CODE_PRICE,
        status: "Successful ✅",
        date: now()
      };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `🧾 Zealy Code purchase marked Successful.`, amount: null, status: "Info", date: now() });
      setBuyLoading(false);
      setPopup(null);
      setBuyReceiptSent(false);
    }, 800);
  }

  /* ---------- Support ---------- */

  function openSupport() {
    setSupportCategory("General");
    setSupportMessage("");
    setPopup("support");
  }
  function submitSupport(e) {
    e.preventDefault();
    if (!supportMessage) return;
    setSupportLoading(true);
    setTimeout(() => {
      const tickets = JSON.parse(localStorage.getItem("zealy:support") || "[]");
      const ticket = { id: uid("ticket"), date: now(), category: supportCategory, message: supportMessage, reply: null };
      tickets.unshift(ticket);
      localStorage.setItem("zealy:support", JSON.stringify(tickets));
      pushActivity({ id: uid("note"), type: "Notification", title: `📩 Support message sent (${supportCategory}).`, date: now(), amount: null, status: "Info" });
      setSupportMessage("");
      setSupportLoading(false);
      setPopup(null);
    }, 700);
  }

  /* ---------- Quick Access gating & services ---------- */

  function requestQuickAccess(name) {
    setQuickAction(name);
    setCodeInput("");
    setCodeGateOpen(true);
    // ensure modal wrapper shows even if popup is null (we render when either is true)
  }

  function submitCodeGate(e) {
    e.preventDefault();
    if (codeInput.trim().toUpperCase() !== ZEALY_CODE) {
      alert("Invalid Zealy Code.");
      return;
    }
    // open corresponding quick modal
    const mapping = { "Data": "quick-data", "Airtime": "quick-airtime", "Pay Bills": "quick-bills", "Investment": "quick-invest" };
    setCodeGateOpen(false);
    setPopup(mapping[quickAction] || null);
    setQuickAction(null);
  }

  // Data
  function submitData(e) {
    e.preventDefault();
    if (!qPhone || !qPlan) { alert("Enter phone and plan."); return; }
    setQuickLoading(true);
    setTimeout(() => {
      const plan = DATA_PLANS.find(p => p.value === Number(qPlan));
      const act = { id: uid("txn"), type: "Data", title: `${qNetwork} - ${plan.label} to ${qPhone}`, amount: plan.value, status: "Successful", date: now() };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qNetwork} ${plan.label} purchased for ${qPhone}.`, amount: null, status: "Info", date: now() });
      setQuickLoading(false);
      setPopup(null);
    }, 700);
  }

  // Airtime
  function submitAirtime(e) {
    e.preventDefault();
    const amt = Number(qAmount);
    if (!qPhone || !qAmount || amt <= 0) { alert("Enter phone and valid amount."); return; }
    setQuickLoading(true);
    setTimeout(() => {
      const act = { id: uid("txn"), type: "Airtime", title: `${qNetwork} airtime to ${qPhone}`, amount: amt, status: "Successful", date: now() };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `✅ Airtime ₦${amt} sent to ${qPhone}.`, amount: null, status: "Info", date: now() });
      setQuickLoading(false);
      setPopup(null);
    }, 600);
  }

  // Pay Bills
  function submitBill(e) {
    e.preventDefault();
    const amt = Number(qAmount);
    if (!qBillAccount || !qAmount || amt <= 0) { alert("Enter account/ref and valid amount."); return; }
    setQuickLoading(true);
    setTimeout(() => {
      const act = { id: uid("txn"), type: "Pay Bills", title: `${qBillType} • ${qBillAccount}`, amount: amt, status: "Successful", date: now() };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qBillType} payment ₦${amt} for ${qBillAccount}.`, amount: null, status: "Info", date: now() });
      setQuickLoading(false);
      setPopup(null);
    }, 700);
  }

  // Investment
  function submitInvestment(e) {
    e.preventDefault();
    const amt = Number(investmentAmount);
    if (!amt || amt <= 0) { alert("Enter valid amount."); return; }
    setQuickLoading(true);
    setTimeout(() => {
      const act = { id: uid("txn"), type: "Investment", title: `${investmentType} — start ₦${amt.toLocaleString()}`, amount: amt, status: "Pending", date: now() };
      pushActivity(act);
      pushActivity({ id: uid("note"), type: "Notification", title: `💼 Investment request: ${investmentType} ₦${amt.toLocaleString()} (Pending).`, amount: null, status: "Info", date: now() });
      setQuickLoading(false);
      setPopup(null);
    }, 800);
  }

  /* ---------- Profile ---------- */

  function openProfile() {
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null");
    if (u) {
      setProfileFullName(u.fullName || "");
      setProfileEmail(u.email || "");
      setProfilePhone(u.phone || "");
      setProfileNotif(Boolean(u.settings?.notifications));
    }
    setProfileMsg("");
    setProfileOpen(true);
  }

  function saveProfile(e) {
    e && e.preventDefault && e.preventDefault();
    if (!profileFullName || !profileEmail) {
      setProfileMsg("Please provide name and email.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profileEmail)) {
      setProfileMsg("Enter a valid email address.");
      return;
    }
    // NOTE: per your request email is NOT editable - but we still validate it's present.
    // we WILL NOT change the stored email even if profileEmail has changed in UI (read-only ensures it doesn't).
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    u.fullName = profileFullName;
    // do not overwrite u.email (email is not editable)
    u.phone = profilePhone;
    u.settings = u.settings || {};
    u.settings.notifications = !!profileNotif;
    localStorage.setItem("zealy:user", JSON.stringify(u));
    setUser(u);
    setProfileMsg("Profile saved.");
    setTimeout(() => { setProfileOpen(false); setProfileMsg(""); }, 800);
  }

  function changePassword(e) {
    e.preventDefault();
    if (!newPass || !confirmPass) { setProfileMsg("Enter new password and confirm."); return; }
    if (newPass !== confirmPass) { setProfileMsg("New passwords do not match."); return; }
    setProfileMsg("Password changed (demo).");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(()=> setProfileMsg(""), 1200);
  }

  /* ---------- Ads carousel ---------- */
  useEffect(() => {
    const id = setInterval(() => setAdIndex(i => (i+1)%4), 4000);
    return () => clearInterval(id);
  }, []);

  /* ---------- Render ---------- */
  if (checkingAuth) return null;

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0f172a 0%, #0ea5e9 55%, #7c3aed 100%)" }} className="text-white p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Top header */}
        <header className="flex items-center justify-between mb-6" style={{ gap: 12 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700 }}>
              <span style={{ color: "#c7f9cc" }}>Zealy</span> Pay
            </h1>
            <div style={{ fontSize: isMobile ? 11 : 13, color: "rgba(255,255,255,0.85)" }}>
              Secure wallet · ₦{balance.toLocaleString()} balance
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setNotifOpen(s=>!s)} className="btn-ghost" style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
              🔔
            </button>
            <button onClick={openProfile} className="btn-ghost" style={{ padding: 8, borderRadius: 8, background: "linear-gradient(90deg,#6366f1,#7c3aed)" }}>
              Profile
            </button>
            <button onClick={doLogout} className="btn-ghost" style={{ padding: 8, borderRadius: 8, background: "#ef4444" }}>
              Logout
            </button>
          </div>
        </header>

        {/* Kinetic banner */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 16 }}>
              Special: Buy the Zealy Code and stand a chance to win ₦200,000!
            </div>
            <div style={{ fontSize: isMobile ? 11 : 13, color: "rgba(255,255,255,0.85)" }}>
              Limited promo — buy a code and follow the steps in support to enter.
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid" style={{
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 16
        }}>
          <div style={{ gridColumn: isMobile ? "auto" : "1 / span 2", display: "grid", gap: 16 }}>
            {/* Wallet card */}
            <div style={{ borderRadius: 16, padding: 14, background: "linear-gradient(90deg,#042f4a,#0b3048)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, opacity: 0.95 }}>
                    Hi, <span style={{ fontWeight: 700 }}>{user?.fullName || "User"}</span> 👋
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    Welcome to your Zealy Wallet — secure and fast
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>Current Balance</div>
                  <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 800 }}>₦{Number(balance).toLocaleString()}</div>
                </div>
              </div>

              {/* actions */}
              <div style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
                gap: 10
              }}>
                <button onClick={openWithdraw} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#06b6d4,#06b6a4)", fontWeight:700 }}>
                  Withdraw
                </button>
                <button onClick={openUpgrade} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#f59e0b,#f97316)", fontWeight:700 }}>
                  Upgrade
                </button>
                <button onClick={openBuyCode} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#3b82f6,#06b6d4)", fontWeight:700 }}>
                  Buy Zealy Code
                </button>
                <button onClick={openSupport} style={{ padding: 12, borderRadius: 10, background: "linear-gradient(90deg,#ef4444,#ec4899)", fontWeight:700 }}>
                  Support
                </button>
              </div>
            </div>

            {/* Quick Access */}
            <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.04)", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>Quick Access</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>Enter Zealy Code to unlock</div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
                gap: 10
              }}>
                <button onClick={() => requestQuickAccess("Data")} style={{ padding: 10, borderRadius: 10, background: "#0ea5e9", color: "#001" }}>📶 Data</button>
                <button onClick={() => requestQuickAccess("Airtime")} style={{ padding: 10, borderRadius: 10, background: "#06b6d4" }}>📱 Airtime</button>
                <button onClick={() => requestQuickAccess("Pay Bills")} style={{ padding: 10, borderRadius: 10, background: "#7c3aed" }}>🧾 Pay Bills</button>
                <button onClick={() => requestQuickAccess("Investment")} style={{ padding: 10, borderRadius: 10, background: "#06b6a4" }}>💼 Investment</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12 }}>Enter code to unlock these services.</div>
            </div>

            {/* Activities */}
            <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.04)", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>Recent Activities</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{activities.length} items</div>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 6 }}>
                {activities.length === 0 && <div style={{ color: "rgba(255,255,255,0.7)" }}>No activities yet</div>}
                {activities.map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.type} {a.title ? "— " + a.title : ""}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{a.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {a.amount ? <div style={{ fontWeight: 700 }}>₦{Number(a.amount).toLocaleString()}</div> : <div style={{ fontSize: 12 }}>{a.status}</div>}
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{a.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ads carousel */}
            <div style={{ borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>How to earn ₦200k</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{adIndex+1}/4</div>
              </div>
              <div style={{ marginTop: 10, height: 90, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#0ea5e9,#7c3aed)", borderRadius: 8 }}>
                <div style={{ color: "white", textAlign: "center", width: "100%" }}>
                  {adIndex === 0 && <div><div style={{fontWeight:700}}>Step 1</div><div style={{fontSize:13}}>Buy a Zealy Code and send receipt</div></div>}
                  {adIndex === 1 && <div><div style={{fontWeight:700}}>Step 2</div><div style={{fontSize:13}}>Complete dashboard tasks to qualify</div></div>}
                  {adIndex === 2 && <div><div style={{fontWeight:700}}>Step 3</div><div style={{fontSize:13}}>Get referrals for bonus entries</div></div>}
                  {adIndex === 3 && <div><div style={{fontWeight:700}}>Step 4</div><div style={{fontSize:13}}>Winners chosen monthly</div></div>}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside style={{ gridColumn: isMobile ? "auto" : "3 / span 1", display: "grid", gap: 12 }}>
            <div style={{ borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Account</div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13 }}>{user?.fullName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{user?.email}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{user?.phone}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button onClick={openProfile} style={{ padding: 8, borderRadius: 8, background: "#7c3aed" }}>Edit Profile</button>
              </div>
            </div>

            <div style={{ borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Quick Actions</div>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                <button onClick={openWithdraw} style={{ padding: 8, borderRadius: 8, background: "#06b6d4" }}>Withdraw</button>
                <button onClick={openUpgrade} style={{ padding: 8, borderRadius: 8, background: "#f59e0b" }}>Upgrade</button>
                <button onClick={openBuyCode} style={{ padding: 8, borderRadius: 8, background: "#3b82f6" }}>Buy Zealy Code</button>
              </div>
            </div>

            <div style={{ borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontWeight: 700 }}>Support</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>Need help? Chat on WhatsApp or open Support.</div>
              <div style={{ marginTop: 10 }}>
                <a href="https://wa.me/2348136361997" target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: 8, borderRadius: 8, background: "#10b981" }}>WhatsApp Support</a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- Floating notifications dropdown ---------- */}
      {notifOpen && (
        <div style={{ position: "fixed", right: 20, top: 90, background: "white", color: "#111827", borderRadius: 12, padding: 12, width: 320, boxShadow: "0 8px 30px rgba(2,6,23,0.5)" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Activities</div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {activities.length === 0 ? <div style={{ color: "#6b7280" }}>No activity yet.</div> : activities.slice(0,20).map(a => (
              <div key={a.id} style={{ borderBottom: "1px solid rgba(17,24,39,0.05)", padding: "8px 0" }}>
                <div style={{ fontWeight: 600 }}>{a.title || a.type}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{a.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Modal wrapper: render when either popup or codeGateOpen is true ---------- */}
      {(popup || codeGateOpen) && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          {/* overlay click closes all modal states */}
          <div
            onClick={() => { setPopup(null); setCodeGateOpen(false); setQuickAction(null); }}
            style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.6)" }}
          />
          <div style={{ width: "min(920px,95%)", maxHeight: "90vh", overflowY: "auto", borderRadius: 12, padding: 18, background: "#fff", color: "#0f172a", zIndex: 70 }}>
            {/* Withdraw */}
            {popup === "withdraw" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>Withdraw Funds</h3>
                  <button onClick={() => setPopup(null)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
                </div>
                <p style={{ color: "#6b7280" }}>Fill your bank details and enter Zealy Code to confirm withdrawal.</p>
                <form onSubmit={submitWithdraw}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="block text-sm">Account Name</label>
                      <input className="input" value={wAccountName} onChange={(e)=>setWAccountName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm">Account Number</label>
                      <input className="input" value={wAccountNumber} onChange={(e)=>setWAccountNumber(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm">Bank</label>
                      <select className="input" value={wBank} onChange={(e)=>setWBank(e.target.value)}>
                        {NIGERIAN_BANKS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">Amount (₦)</label>
                      <input className="input" type="number" value={wAmount} onChange={(e)=>setWAmount(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <label className="block text-sm">Enter Zealy Code</label>
                    <input className="input" value={wCode} onChange={(e)=>setWCode(e.target.value)} placeholder="" />
                    <div style={{ color: "#dc2626", marginTop: 6 }}>{wError}</div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => setPopup(null)} style={{ padding: "8px 12px", borderRadius: 8, background: "#e6e6e6" }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "#06b6d4", color: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {withdrawLoading ? <span className="spinner" /> : null}
                      Submit Withdrawal
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Upgrade */}
            {popup === "upgrade" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>Upgrade Account</h3>
                  <button onClick={()=>setPopup(null)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
                </div>
                <p style={{ color: "#6b7280" }}>Choose a package and follow payment instructions. Selected upgrades appear as pending.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {PACKS.map(p => (
                    <div key={p.key} style={{ borderRadius: 8, padding: 12, background: "#f8fafc", border: selectedPack?.key===p.key ? "2px solid #6366f1" : "1px solid #e6e6e6" }}>
                      <div style={{ fontWeight: 700 }}>{p.key}</div>
                      <div style={{ color: "#6b7280", marginTop: 6 }}>₦{p.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{p.eta}</div>
                      <div style={{ marginTop: 8 }}>
                        <button onClick={()=>selectUpgrade(p)} style={{ padding: 8, borderRadius: 8, background: "#6366f1", color: "#fff" }}>Select</button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPack && (
                  <div style={{ marginTop: 12, padding: 12, background: "#fff7ed", borderRadius: 8 }}>
                    <div>Send <b>₦{selectedPack.amount.toLocaleString()}</b> to:</div>
                    <div style={{ marginTop: 6 }}>
                      Bank: <b>Kuda Bank</b><br />
                      Account Name: <b>Abdulmumini Bello</b><br />
                      Account Number: <b>2078928132</b>
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <a href="https://wa.me/2348136361997" target="_blank" rel="noreferrer" style={{ padding: 8, background: "#10b981", color: "#fff", borderRadius: 8 }}>📲 Send Receipt on WhatsApp</a>
                      <button onClick={confirmUpgrade} style={{ padding: 8, background: "#f59e0b", color: "#fff", borderRadius: 8 }}>
                        {upgradeLoading ? <span className="spinner" /> : null} I have sent money for upgrade
                      </button>
                      <button onClick={()=>{ setSelectedPack(null); setPopup(null); }} style={{ padding: 8, background: "#e6e6e6", borderRadius: 8 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Buy Zealy Code */}
            {popup === "buycode" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin:0 }}>Buy Zealy Code</h3>
                  <button onClick={()=>setPopup(null)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
                </div>
                <p style={{ color: "#6b7280" }}>Purchase the single Zealy Code. After payment, send receipt via WhatsApp before confirming.</p>
                <div style={{ padding: 10, background: "#f1f5f9", borderRadius: 8 }}>
                  <div>Bank: <b>Kuda Bank</b></div>
                  <div>Account Name: <b>Abdulmumini Bello</b></div>
                  <div>Account Number: <b>2078928132</b></div>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>Amount: ₦{CODE_PRICE.toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <a href="https://wa.me/2348136361997" target="_blank" rel="noreferrer" onClick={() => setBuyReceiptSent(true)} style={{ padding: 10, background: "#16a34a", color: "#fff", borderRadius: 8 }}>📲 Send Receipt on WhatsApp</a>
                  <button onClick={() => { if (!buyReceiptSent) { if (!confirm("You haven't told us you sent a receipt. Continue anyway?")) return; } confirmBuyCode(); }} style={{ padding: 10, background: "#0ea5e9", color: "#fff", borderRadius: 8 }}>
                    {buyLoading ? <span className="spinner" /> : null} I have made payment
                  </button>
                </div>
              </>
            )}

            {/* Support */}
            {popup === "support" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin:0 }}>Contact Support</h3>
                  <button onClick={()=>setPopup(null)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
                </div>
                <form onSubmit={submitSupport} style={{ marginTop: 8 }}>
                  <div>
                    <label className="block text-sm">Category</label>
                    <select className="input" value={supportCategory} onChange={(e)=>setSupportCategory(e.target.value)}>
                      <option>Complaint</option>
                      <option>Payment Issue</option>
                      <option>Upgrade Problem</option>
                      <option>General</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label className="block text-sm">Message</label>
                    <textarea className="input" rows={4} value={supportMessage} onChange={(e)=>setSupportMessage(e.target.value)} />
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button type="submit" style={{ padding: 8, background: "#6366f1", color: "#fff", borderRadius: 8 }}>
                      {supportLoading ? <span className="spinner" /> : null} Send
                    </button>
                    <a href="https://wa.me/2348136361997" target="_blank" rel="noreferrer" style={{ padding: 8, background: "#10b981", color: "#fff", borderRadius: 8 }}>Chat on WhatsApp</a>
                    <button type="button" onClick={() => setPopup(null)} style={{ padding: 8, background: "#e6e6e6", borderRadius: 8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Code gate */}
            {codeGateOpen && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin:0 }}>Enter Zealy Code</h3>
                  <button onClick={()=>{ setCodeGateOpen(false); setQuickAction(null); setPopup(null); }} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
                </div>
                <form onSubmit={submitCodeGate} style={{ marginTop: 10 }}>
                  <input className="input" placeholder="Enter Zealy Code" value={codeInput} onChange={(e)=>setCodeInput(e.target.value)} />
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <button type="submit" style={{ padding: 8, background: "#3b82f6", color:"#fff", borderRadius: 8 }}>Unlock</button>
                    <button type="button" onClick={()=>{ setCodeGateOpen(false); setQuickAction(null); }} style={{ padding: 8, background: "#e6e6e6", borderRadius: 8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Quick-data */}
            {popup === "quick-data" && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0 }}>Buy Data</h3>
                  <button onClick={()=>setPopup(null)} style={{ background:"transparent", border:"none" }}>✖</button>
                </div>
                <form onSubmit={submitData} style={{ marginTop:10 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div>
                      <label className="block text-sm">Network</label>
                      <select className="input" value={qNetwork} onChange={(e)=>setQNetwork(e.target.value)}>{NETWORKS.map(n=> <option key={n}>{n}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-sm">Phone Number</label>
                      <input className="input" value={qPhone} onChange={(e)=>setQPhone(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Plan</label>
                    <select className="input" value={qPlan||""} onChange={(e)=>setQPlan(e.target.value)}>
                      <option value="">Select plan</option>
                      {DATA_PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:8 }}>
                    <button type="submit" style={{ padding:8, background:"#06b6d4", color:"#fff", borderRadius:8 }}>
                      {quickLoading ? <span className="spinner" /> : null} Buy Data
                    </button>
                    <button type="button" onClick={()=>setPopup(null)} style={{ padding:8, background:"#e6e6e6", borderRadius:8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Quick-airtime */}
            {popup === "quick-airtime" && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0 }}>Buy Airtime</h3>
                  <button onClick={()=>setPopup(null)} style={{ background:"transparent", border:"none" }}>✖</button>
                </div>
                <form onSubmit={submitAirtime} style={{ marginTop:10 }}>
                  <div>
                    <label className="block text-sm">Network</label>
                    <select className="input" value={qNetwork} onChange={(e)=>setQNetwork(e.target.value)}>{NETWORKS.map(n=> <option key={n}>{n}</option>)}</select>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Phone Number</label>
                    <input className="input" value={qPhone} onChange={(e)=>setQPhone(e.target.value)} />
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Amount (₦)</label>
                    <input className="input" type="number" value={qAmount} onChange={(e)=>setQAmount(e.target.value)} />
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:8 }}>
                    <button type="submit" style={{ padding:8, background:"#06b6d4", color:"#fff", borderRadius:8 }}>
                      {quickLoading ? <span className="spinner" /> : null} Send Airtime
                    </button>
                    <button type="button" onClick={()=>setPopup(null)} style={{ padding:8, background:"#e6e6e6", borderRadius:8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Quick-bills */}
            {popup === "quick-bills" && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0 }}>Pay Bills</h3>
                  <button onClick={()=>setPopup(null)} style={{ background:"transparent", border:"none" }}>✖</button>
                </div>
                <form onSubmit={submitBill} style={{ marginTop:10 }}>
                  <div>
                    <label className="block text-sm">Bill Type</label>
                    <select className="input" value={qBillType} onChange={(e)=>setQBillType(e.target.value)}>
                      <option>Electricity</option>
                      <option>Water</option>
                      <option>School Fee</option>
                      <option>Internet</option>
                    </select>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Account / Reference</label>
                    <input className="input" value={qBillAccount} onChange={(e)=>setQBillAccount(e.target.value)} />
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Amount (₦)</label>
                    <input className="input" type="number" value={qAmount} onChange={(e)=>setQAmount(e.target.value)} />
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:8 }}>
                    <button type="submit" style={{ padding:8, background:"#7c3aed", color:"#fff", borderRadius:8 }}>
                      {quickLoading ? <span className="spinner" /> : null} Pay Bill
                    </button>
                    <button type="button" onClick={()=>setPopup(null)} style={{ padding:8, background:"#e6e6e6", borderRadius:8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}

            {/* Quick-invest */}
            {popup === "quick-invest" && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <h3 style={{ margin:0 }}>Invest</h3>
                  <button onClick={()=>setPopup(null)} style={{ background:"transparent", border:"none" }}>✖</button>
                </div>
                <form onSubmit={submitInvestment} style={{ marginTop:10 }}>
                  <div>
                    <label className="block text-sm">Product</label>
                    <select className="input" value={investmentType} onChange={(e)=>setInvestmentType(e.target.value)}>
                      <option>Spend & Save</option>
                      <option>Fixed Account</option>
                      <option>Target Savings</option>
                    </select>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <label className="block text-sm">Amount (₦)</label>
                    <input className="input" type="number" value={investmentAmount} onChange={(e)=>setInvestmentAmount(e.target.value)} />
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:8 }}>
                    <button type="submit" style={{ padding:8, background:"#06b6d4", color:"#fff", borderRadius:8 }}>
                      {quickLoading ? <span className="spinner" /> : null} Start Investment
                    </button>
                    <button type="button" onClick={()=>setPopup(null)} style={{ padding:8, background:"#e6e6e6", borderRadius:8 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileOpen && (
        <div style={{ position: "fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:80 }}>
          <div onClick={()=>setProfileOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(2,6,23,0.6)" }} />
          <div style={{ width: "min(600px,95%)", borderRadius:12, background:"#fff", color:"#0f172a", padding:18, zIndex:90 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ margin:0 }}>Profile</h3>
              <button onClick={()=>setProfileOpen(false)} style={{ background:"transparent", border:"none", fontSize:18 }}>✖</button>
            </div>

            <form onSubmit={saveProfile} style={{ marginTop:12 }}>
              <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="block text-sm">Full name</label>
                  <input className="input" value={profileFullName} onChange={(e)=>setProfileFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm">Phone</label>
                  <input className="input" value={profilePhone} onChange={(e)=>setProfilePhone(e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="block text-sm">Email (not editable)</label>
                  <input className="input" value={profileEmail} readOnly disabled />
                  <div style={{ fontSize:12, color: "#6b7280" }}>Email cannot be changed from here.</div>
                </div>
              </div>

              <div style={{ marginTop:12 }}>
                <div style={{ fontWeight:700 }}>Change password</div>
                <div style={{ display:"grid", gap:8, marginTop:8 }}>
                  <input type="password" className="input" placeholder="Old password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} />
                  <input type="password" className="input" placeholder="New password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} />
                  <input type="password" className="input" placeholder="Confirm new password" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} />
                  <button onClick={changePassword} type="button" style={{ padding:8, background:"#06b6d4", color:"#fff", borderRadius:8 }}>Change password</button>
                </div>
              </div>

              <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
                <input id="notifToggle" type="checkbox" checked={profileNotif} onChange={(e)=>setProfileNotif(e.target.checked)} />
                <label htmlFor="notifToggle">Enable notifications</label>
              </div>

              <div style={{ marginTop:12, display:"flex", gap:8 }}>
                <button type="submit" style={{ padding:8, background:"#6366f1", color:"#fff", borderRadius:8 }}>Save</button>
                <button type="button" onClick={()=>setProfileOpen(false)} style={{ padding:8, background:"#e6e6e6", borderRadius:8 }}>Cancel</button>
                <div style={{ marginLeft: "auto", color: "#065f46", fontWeight:700 }}>{profileMsg}</div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles: input, spinner, responsive tweaks */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(2,6,23,0.08);
          box-sizing: border-box;
        }
        button { cursor: pointer; }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: rgba(255,255,255,0.9);
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        /* dark spinner variant for white buttons */
        .spinner-dark {
          border: 2px solid rgba(15,23,42,0.15);
          border-top-color: rgba(15,23,42,0.9);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* small mobile layout adjustments if user wants extra polish */
        @media (max-width: 768px) {
          .container { padding-left: 8px; padding-right: 8px; }
        }
      `}</style>
    </main>
  );
}
