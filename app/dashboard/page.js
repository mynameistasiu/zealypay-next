"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Single-file Zealy Pay Dashboard (client)
 * Drop into: app/dashboard/page.js
 *
 * Notes:
 * - Persisted to localStorage under `zealy:*` keys
 * - ZEALY_CODE constant below
 * - For demo purposes only (no backend)
 */

const ZEALY_CODE = "ZLP1054XM";
const CODE_PRICE = 10000;
const DEFAULT_BONUS = 150000; // user originally requested 150k bonus on register
const NIGERIAN_BANKS = [
  "Access Bank",
  "Zenith Bank",
  "First Bank",
  "GTBank",
  "United Bank for Africa (UBA)",
  "FCMB",
  "Fidelity Bank",
  "Union Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "Wema Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Jaiz Bank",
  "Unity Bank",
  "SunTrust Bank",
  "Providus Bank",
  "Kuda",
  "Moniepoint MFB",
  "OPay",
  "PalmPay",
];
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

export default function DashboardPage() {
  const router = useRouter();

  // auth guard
  const [checkingAuth, setCheckingAuth] = useState(true);

  // user & balance & activities
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(DEFAULT_BONUS);
  const [activities, setActivities] = useState([]); // combined activities

  // UI state
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // modals/popups
  const [openPopup, setOpenPopup] = useState(null); // withdraw, upgrade, buycode, support, profile, codegate, quick-data, quick-airtime, quick-bills, quick-invest
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState(null); // {text, type}

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
  const [quickAction, setQuickAction] = useState(null);
  const [codeGateInput, setCodeGateInput] = useState("");
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
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileNotif, setProfileNotif] = useState(true);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Upgrade countdown (if created as pending)
  const [upgradePending, setUpgradePending] = useState(null); // {pack, date}

  // responsive detection
  useEffect(() => {
    const check = () => setMobileView(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // load persisted data once
  useEffect(() => {
    const logged = localStorage.getItem("zealy:isLoggedIn") === "true";
    if (!logged) {
      router.replace("/login");
      return;
    }

    // load user
    const rawUser = localStorage.getItem("zealy:user");
    let u = null;
    try {
      u = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      u = null;
    }
    if (!u) {
      // create a default user if missing (demo)
      u = {
        id: uid("user"),
        fullName: "New User",
        email: "user@example.com",
        phone: "",
        settings: { notifications: true },
        password: "password",
      };
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
    if (Array.isArray(savedActs)) {
      setActivities(savedActs);
    } else {
      // build from txns & notes if needed
      const txns = JSON.parse(localStorage.getItem("zealy:transactions") || "[]");
      const notes = JSON.parse(localStorage.getItem("zealy:notifications") || "[]");
      const txActs = txns.map((t) => ({
        id: t.id || uid("txn"),
        type: t.type || "Transaction",
        title: t.details || t.type,
        amount: t.amount || 0,
        status: t.status || "Pending",
        date: t.date || now(),
      }));
      const noteActs = notes.map((n) => ({
        id: uid("note"),
        type: "Notification",
        title: n.text || n,
        amount: null,
        status: "Info",
        date: n.date || now(),
      }));
      const merged = [...txActs, ...noteActs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(merged);
      localStorage.setItem("zealy:activities", JSON.stringify(merged));
    }

    // upgrade pending (optional)
    const up = JSON.parse(localStorage.getItem("zealy:upgradePending") || "null");
    if (up) setUpgradePending(up);

    setCheckingAuth(false);
  }, [router]);

  // persist activities & balance
  useEffect(() => {
    localStorage.setItem("zealy:activities", JSON.stringify(activities));
    // sync transactions and notifications
    const txns = activities.filter((a) =>
      ["Withdraw", "Withdraw (manual)", "Buy Zealy Code", "Upgrade", "Data", "Airtime", "Pay Bills", "Investment"].includes(a.type)
    );
    const notes = activities.filter((a) => !txns.includes(a)).map((n) => ({ date: n.date, text: n.title }));
    localStorage.setItem("zealy:transactions", JSON.stringify(txns.map((t) => ({ id: t.id, date: t.date, type: t.type, details: t.title, amount: t.amount, status: t.status }))));
    localStorage.setItem("zealy:notifications", JSON.stringify(notes));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("zealy:balance", String(balance));
  }, [balance]);

  // toast auto clear
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // push activity helper
  function pushActivity(act) {
    const item = { id: act.id || uid("act"), ...act };
    setActivities((prev) => [item, ...prev]);
  }

  // Logout
  function doLogout() {
    localStorage.setItem("zealy:isLoggedIn", "false");
    router.replace("/");
  }

  /* ---------------- Withdraw ---------------- */
  function openWithdraw() {
    setWAccountName("");
    setWAccountNumber("");
    setWBank(NIGERIAN_BANKS[0]);
    setWAmount("");
    setWCode("");
    setWError("");
    setOpenPopup("withdraw");
  }

  async function submitWithdraw(e) {
    e && e.preventDefault && e.preventDefault();
    setWError("");
    if (!wAccountName || !wAccountNumber || !wBank || !wAmount) {
      setWError("Please fill all required fields.");
      return;
    }
    if (!wCode || wCode.trim().toUpperCase() !== ZEALY_CODE) {
      setWError("Invalid Zealy Code.");
      return;
    }
    const amt = Number(wAmount);
    if (!amt || amt <= 0) {
      setWError("Enter a valid amount.");
      return;
    }
    if (amt > balance) {
      setWError("Insufficient balance.");
      return;
    }

    setLoadingAction(true);
    // simulate processing
    await new Promise((r) => setTimeout(r, 900));

    // per request: withdrawal should be recorded as successful immediately
    const act = {
      id: uid("txn"),
      type: "Withdraw",
      title: `${wBank} • ${wAccountName} (${wAccountNumber})`,
      amount: amt,
      status: "Successful ✅",
      date: now(),
    };
    pushActivity(act);
    setBalance((b) => Math.max(0, b - amt));

    pushActivity({
      id: uid("note"),
      type: "Notification",
      title: `💸 Withdrawal ₦${amt.toLocaleString()} successful.`,
      date: now(),
      status: "Info",
    });

    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Withdrawal successful", type: "success" });
  }

  /* ---------------- Upgrade ---------------- */
  function openUpgrade() {
    setSelectedPack(null);
    setOpenPopup("upgrade");
  }

  function selectUpgrade(pack) {
    setSelectedPack(pack);
  }

  async function confirmUpgrade() {
    if (!selectedPack) {
      setToast({ text: "Select a package first", type: "warn" });
      return;
    }
    setLoadingAction(true);
    // simulate
    await new Promise((r) => setTimeout(r, 900));
    // record a pending upgrade
    const act = {
      id: uid("txn"),
      type: "Upgrade",
      title: `${selectedPack.key} — pay ₦${selectedPack.amount.toLocaleString()}`,
      amount: selectedPack.amount,
      status: "Pending ⏳",
      date: now(),
    };
    pushActivity(act);
    pushActivity({
      id: uid("note"),
      type: "Notification",
      title: `⬆️ Upgrade requested: ${selectedPack.key} (Pending)`,
      date: now(),
      status: "Info",
    });
    // save pending upgrade meta
    const pending = { pack: selectedPack.key, amount: selectedPack.amount, date: now() };
    localStorage.setItem("zealy:upgradePending", JSON.stringify(pending));
    setUpgradePending(pending);

    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Upgrade requested — pending approval", type: "info" });
    setSelectedPack(null);
  }

  /* ---------------- Buy Zealy Code ---------------- */
  function openBuyCode() {
    setBuyReceiptSent(false);
    setOpenPopup("buycode");
  }

  async function confirmBuyCode() {
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 800));
    // record successful purchase
    const act = {
      id: uid("txn"),
      type: "Buy Zealy Code",
      title: `Purchased code ${ZEALY_CODE}`,
      amount: CODE_PRICE,
      status: "Successful ✅",
      date: now(),
    };
    pushActivity(act);
    pushActivity({
      id: uid("note"),
      type: "Notification",
      title: `🧾 Zealy Code purchase marked Successful.`,
      date: now(),
      status: "Info",
    });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Zealy Code purchased", type: "success" });
  }

  /* ---------------- Support ---------------- */
  function openSupport() {
    setSupportCategory("General");
    setSupportMessage("");
    setOpenPopup("support");
  }

  async function submitSupport(e) {
    e && e.preventDefault && e.preventDefault();
    if (!supportMessage) {
      setToast({ text: "Write a message first", type: "warn" });
      return;
    }
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 700));
    const ticket = { id: uid("ticket"), date: now(), category: supportCategory, message: supportMessage, reply: null };
    const tickets = JSON.parse(localStorage.getItem("zealy:support") || "[]");
    tickets.unshift(ticket);
    localStorage.setItem("zealy:support", JSON.stringify(tickets));
    pushActivity({ id: uid("note"), type: "Notification", title: `📩 Support message sent (${supportCategory}).`, date: now(), status: "Info" });

    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Support message sent", type: "success" });
  }

  /* ---------------- Quick Access gating & flows ---------------- */
  function startQuick(name) {
    setQuickAction(name);
    setCodeGateInput("");
    setOpenPopup("codegate");
  }

  function submitCodeGate(e) {
    e && e.preventDefault && e.preventDefault();
    if (codeGateInput.trim().toUpperCase() !== ZEALY_CODE) {
      setToast({ text: "Invalid Zealy Code", type: "error" });
      return;
    }
    // success -> open corresponding quick modal
    const map = {
      Data: "quick-data",
      Airtime: "quick-airtime",
      "Pay Bills": "quick-bills",
      Investment: "quick-invest",
    };
    setOpenPopup(map[quickAction] || null);
    setQuickAction(null);
  }

  async function submitData(e) {
    e && e.preventDefault && e.preventDefault();
    if (!qPhone || !qPlan) {
      setToast({ text: "Enter phone and plan", type: "warn" });
      return;
    }
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 700));
    const plan = DATA_PLANS.find((p) => String(p.value) === String(qPlan));
    const amount = plan ? plan.value : Number(qAmount || 0);
    const act = { id: uid("txn"), type: "Data", title: `${qNetwork} - ${plan.label} to ${qPhone}`, amount: amount, status: "Successful ✅", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qNetwork} ${plan.label} purchased for ${qPhone}.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Data purchase successful", type: "success" });
  }

  async function submitAirtime(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(qAmount);
    if (!qPhone || !qAmount || amt <= 0) {
      setToast({ text: "Enter phone and valid amount", type: "warn" });
      return;
    }
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Airtime", title: `${qNetwork} airtime to ${qPhone}`, amount: amt, status: "Successful ✅", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ Airtime ₦${amt} sent to ${qPhone}.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Airtime sent", type: "success" });
  }

  async function submitBill(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(qAmount);
    if (!qBillAccount || !qAmount || amt <= 0) {
      setToast({ text: "Enter account/ref and valid amount", type: "warn" });
      return;
    }
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Pay Bills", title: `${qBillType} • ${qBillAccount}`, amount: amt, status: "Successful ✅", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `✅ ${qBillType} payment ₦${amt} for ${qBillAccount}.`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Bill paid", type: "success" });
  }

  async function submitInvestment(e) {
    e && e.preventDefault && e.preventDefault();
    const amt = Number(investmentAmount);
    if (!amt || amt <= 0) {
      setToast({ text: "Enter valid amount", type: "warn" });
      return;
    }
    setLoadingAction(true);
    await new Promise((r) => setTimeout(r, 700));
    const act = { id: uid("txn"), type: "Investment", title: `${investmentType} — start ₦${amt.toLocaleString()}`, amount: amt, status: "Pending", date: now() };
    pushActivity(act);
    pushActivity({ id: uid("note"), type: "Notification", title: `💼 Investment request: ${investmentType} ₦${amt.toLocaleString()} (Pending).`, date: now(), status: "Info" });
    setLoadingAction(false);
    setOpenPopup(null);
    setToast({ text: "Investment request submitted", type: "info" });
  }

  /* ---------------- Profile ---------------- */
  function openProfile() {
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null");
    if (u) {
      setProfileName(u.fullName || "");
      setProfileEmail(u.email || "");
      setProfilePhone(u.phone || "");
      setProfileNotif(Boolean(u.settings?.notifications));
    }
    setProfileOpen(true);
    setProfileMsg("");
  }

  function saveProfile(e) {
    e && e.preventDefault && e.preventDefault();
    if (!profileName || !profileEmail) {
      setProfileMsg("Name and email are required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profileEmail)) {
      setProfileMsg("Enter a valid email");
      return;
    }
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    u.fullName = profileName;
    // email should not be editable per request - keep it but allow view. We still save it (if admin allowed)
    u.email = profileEmail;
    u.phone = profilePhone;
    u.settings = u.settings || {};
    u.settings.notifications = !!profileNotif;
    localStorage.setItem("zealy:user", JSON.stringify(u));
    setUser(u);
    setProfileMsg("Profile saved");
    setTimeout(() => {
      setProfileOpen(false);
      setProfileMsg("");
    }, 800);
  }

  function changePassword(e) {
    e && e.preventDefault && e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) {
      setProfileMsg("Fill password fields");
      return;
    }
    if (newPass !== confirmPass) {
      setProfileMsg("New passwords do not match");
      return;
    }
    // demo-only: update stored user password
    const u = JSON.parse(localStorage.getItem("zealy:user") || "null") || {};
    if (u.password && oldPass !== u.password) {
      setProfileMsg("Old password incorrect");
      return;
    }
    u.password = newPass;
    localStorage.setItem("zealy:user", JSON.stringify(u));
    setProfileMsg("Password changed (demo)");
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setTimeout(() => setProfileMsg(""), 1200);
  }

  /* ---------------- Ads + Kinetic text (small) ---------------- */
  const [adIndex, setAdIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAdIndex((i) => (i + 1) % 4), 4000);
    return () => clearInterval(id);
  }, []);

  if (checkingAuth) return null;

  /* ------------------- Render ------------------- */
  return (
    <main className={`zp-root ${mobileView ? "zp-mobile" : ""}`}>
      <div className="zp-container">
        {/* Header */}
        <header className="zp-header">
          <div className="zp-brand">
            <div className="logo">Zealy<span>Pay</span></div>
            <div className="tag">Secure wallet · ₦{Number(balance).toLocaleString()} balance</div>
          </div>

          <div className="zp-actions">
            <button className="zp-btn ghost" onClick={() => setNotifOpen((s) => !s)} title="Notifications">🔔</button>
            <button className="zp-btn gradient" onClick={openProfile}>Profile</button>
            <button className="zp-btn danger" onClick={doLogout}>Logout</button>
          </div>
        </header>

        {/* Notification panel */}
        {notifOpen && (
          <div className="zp-notifs">
            <div className="zp-notifs-header">Recent Activities</div>
            <div className="zp-notifs-list">
              {activities.length === 0 ? (
                <div className="zp-muted">No activity yet</div>
              ) : (
                activities.slice(0, 30).map((a) => (
                  <div key={a.id} className="zp-notif-item">
                    <div className="zp-notif-title">{a.title || a.type}</div>
                    <div className="zp-notif-meta">{a.date} • {a.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Kinetic banner */}
        <div className="zp-banner">
          <div className="zp-banner-left">
            <div className="kp-title">Special: Buy the Zealy Code — stand a chance to win <b>₦200,000</b>!</div>
            <div className="kp-sub">Buy a code, send receipt via WhatsApp, complete tasks and referrals to qualify.</div>
          </div>
          <div className="zp-banner-right">
            <button className="zp-btn outline" onClick={() => { openBuyCode(); }}>Buy Zealy Code</button>
          </div>
        </div>

        {/* Main grid */}
        <div className="zp-grid">
          {/* Left / Main */}
          <div className="zp-main">
            <div className="zp-wallet card">
              <div className="wallet-left">
                <div className="hi">Hi, <span className="name">{user?.fullName || "User"}</span> 👋</div>
                <div className="sub">Welcome to your Zealy Wallet — safe & professional</div>
              </div>
              <div className="wallet-right">
                <div className="label">Current Balance</div>
                <div className="amount">₦{Number(balance).toLocaleString()}</div>
              </div>

              <div className="wallet-actions">
                <button className="zp-btn mix mix-withdraw" onClick={openWithdraw}>
                  {loadingAction && openPopup === "withdraw" ? <Spinner /> : "Withdraw"}
                </button>
                <button className="zp-btn mix mix-upgrade" onClick={openUpgrade}>
                  Upgrade
                </button>
                <button className="zp-btn mix mix-buy" onClick={openBuyCode}>
                  Buy Zealy Code
                </button>
                <button className="zp-btn mix mix-support" onClick={openSupport}>
                  Support
                </button>
              </div>
            </div>

            {/* Quick Access */}
            <div className="card quick-access">
              <div className="card-title">Quick Access (code required)</div>
              <div className="quick-grid">
                <button className="quick-tile" onClick={() => startQuick("Data")}>📶 Data</button>
                <button className="quick-tile" onClick={() => startQuick("Airtime")}>📱 Airtime</button>
                <button className="quick-tile" onClick={() => startQuick("Pay Bills")}>🧾 Pay Bills</button>
                <button className="quick-tile" onClick={() => startQuick("Investment")}>💼 Investment</button>
              </div>
              <div className="card-note">Enter code <b>{ZEALY_CODE}</b> to unlock these services.</div>
            </div>

            {/* Activities / Transactions */}
            <div className="card activities">
              <div className="card-title">Recent Activities</div>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <div className="zp-muted">No transactions or notifications yet.</div>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="activity-item">
                      <div className="activity-left">
                        <div className="activity-type">{a.type}</div>
                        <div className="activity-title">{a.title}</div>
                        <div className="activity-date">{a.date}</div>
                      </div>
                      <div className="activity-right">
                        {a.amount ? <div className="activity-amount">₦{Number(a.amount).toLocaleString()}</div> : null}
                        <div className={`activity-status ${a.status && a.status.includes("Success") ? "ok" : a.status && a.status.includes("Pending") ? "pending" : ""}`}>{a.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ads / How to earn */}
            <div className="card ads">
              <div className="card-title">How to earn ₦200k</div>
              <div className="ad-slide">
                {adIndex === 0 && <AdCard title="Step 1" text="Buy a Zealy Code and send receipt via WhatsApp." />}
                {adIndex === 1 && <AdCard title="Step 2" text="Complete dashboard tasks to qualify." />}
                {adIndex === 2 && <AdCard title="Step 3" text="Refer friends for extra entries." />}
                {adIndex === 3 && <AdCard title="Step 4" text="Winners selected monthly." />}
              </div>
            </div>
          </div>

          {/* Right / Sidebar */}
          <aside className="zp-side">
            <div className="card profile">
              <div className="profile-title">Account</div>
              <div className="profile-body">
                <div className="profile-name">{user?.fullName}</div>
                <div className="profile-email">{user?.email}</div>
                <div className="profile-phone">{user?.phone || "—"}</div>
                <div className="profile-actions">
                  <button className="zp-btn small" onClick={openProfile}>Edit Profile</button>
                </div>
              </div>
            </div>

            <div className="card quick-summary">
              <div className="card-title">Quick actions</div>
              <div className="quick-list">
                <button className="zp-btn small" onClick={openWithdraw}>Withdraw</button>
                <button className="zp-btn small" onClick={openUpgrade}>Upgrade</button>
                <button className="zp-btn small" onClick={openBuyCode}>Buy Code</button>
              </div>
            </div>

            <div className="card support">
              <div className="card-title">Support</div>
              <div className="support-body">
                <div>Need help? Chat on WhatsApp or open Support.</div>
                <div style={{ marginTop: 10 }}>
                  <a className="whatsapp" href="https://wa.me/2348161662371" target="_blank" rel="noreferrer">📲 WhatsApp Support</a>
                </div>
              </div>
            </div>

            {/* Upgrade pending summary */}
            {upgradePending && (
              <div className="card pending">
                <div className="card-title">Upgrade Pending</div>
                <div style={{ marginTop: 8 }}>
                  <div><b>{upgradePending.pack}</b> • ₦{Number(upgradePending.amount).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Requested: {upgradePending.date}</div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ---------- Modals / Popups ---------- */}

      {/* Generic overlay */}
      {openPopup && (
        <div className="zp-overlay" onClick={() => { /* clicking background closes? keep explicit close buttons */ }} />
      )}

      {/* Withdraw Modal */}
      {openPopup === "withdraw" && (
        <Modal title="Withdraw Funds" onClose={() => setOpenPopup(null)}>
          <p className="muted">Fill your bank details and enter Zealy Code to confirm withdrawal.</p>
          <form onSubmit={submitWithdraw} className="form-grid">
            <label>Account Name
              <input className="input" value={wAccountName} onChange={(e) => setWAccountName(e.target.value)} />
            </label>
            <label>Account Number
              <input className="input" value={wAccountNumber} onChange={(e) => setWAccountNumber(e.target.value)} />
            </label>
            <label>Bank
              <select className="input" value={wBank} onChange={(e) => setWBank(e.target.value)}>
                {NIGERIAN_BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label>Amount (₦)
              <input className="input" type="number" value={wAmount} onChange={(e) => setWAmount(e.target.value)} />
            </label>
            <label>Enter Zealy Code
              <input className="input" value={wCode} onChange={(e) => setWCode(e.target.value)} placeholder="" />
            </label>

            {wError && <div className="error">{wError}</div>}

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Submit Withdrawal"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upgrade Modal */}
      {openPopup === "upgrade" && (
        <Modal title="Upgrade Account" onClose={() => setOpenPopup(null)}>
          <p className="muted">Choose a package and follow payment instructions. Selected upgrades appear as pending.</p>
          <div className="packs-grid">
            {PACKS.map((p) => (
              <div className={`pack ${selectedPack?.key === p.key ? "selected" : ""}`} key={p.key}>
                <div className="pack-name">{p.key}</div>
                <div className="pack-price">₦{p.amount.toLocaleString()}</div>
                <div className="pack-eta">{p.eta}</div>
                <div className="pack-actions">
                  <button className="zp-btn small" onClick={() => selectUpgrade(p)}>Select</button>
                </div>
              </div>
            ))}
          </div>

          {selectedPack && (
            <div className="selected-pay">
              <div>Send <b>₦{selectedPack.amount.toLocaleString()}</b> to:</div>
              <div style={{ marginTop: 8 }}>
                Bank: <b>Moniepoint</b><br />
                Account Name: <b>Sadiq Mamuda</b><br />
                Account Number: <b>5073816968</b>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <a className="whatsapp" href="https://wa.me/2348161662371" target="_blank" rel="noreferrer">📲 Send Receipt on WhatsApp</a>
                <button className="zp-btn primary" onClick={confirmUpgrade} disabled={loadingAction}>{loadingAction ? <Spinner /> : "I have sent money for upgrade"}</button>
                <button className="zp-btn ghost" onClick={() => { setSelectedPack(null); setOpenPopup(null); }}>Cancel</button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Buy Code Modal */}
      {openPopup === "buycode" && (
        <Modal title="Buy Zealy Code" onClose={() => setOpenPopup(null)}>
          <p className="muted">Purchase the Zealy code. After payment, send receipt via WhatsApp before confirming.</p>
          <div className="payment-card">
            <div>Bank: <b>Moniepoint</b></div>
            <div>Account Name: <b>Sadiq Mamuda</b></div>
            <div>Account Number: <b>5073816968</b></div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>Amount: ₦{CODE_PRICE.toLocaleString()}</div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <a className="whatsapp" href="https://wa.me/2348161662371" target="_blank" rel="noreferrer" onClick={() => setBuyReceiptSent(true)}>📲 Send Receipt on WhatsApp</a>
            <button className="zp-btn primary" onClick={confirmBuyCode} disabled={loadingAction}>{loadingAction ? <Spinner /> : "I have made payment"}</button>
            <button className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
          </div>
          <div className="muted" style={{ marginTop: 8 }}>Please send your receipt to our WhatsApp before confirming — there's a WhatsApp button above.</div>
        </Modal>
      )}

      {/* Support Modal */}
      {openPopup === "support" && (
        <Modal title="Contact Support" onClose={() => setOpenPopup(null)}>
          <form onSubmit={submitSupport} className="form-grid">
            <label>Category
              <select className="input" value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)}>
                <option>Complaint</option>
                <option>Payment Issue</option>
                <option>Upgrade Problem</option>
                <option>General</option>
              </select>
            </label>
            <label>Message
              <textarea className="input" rows={4} value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            </label>

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Send"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Code Gate */}
      {openPopup === "codegate" && (
        <Modal title="Enter Zealy Code" onClose={() => { setOpenPopup(null); setQuickAction(null); }}>
          <form onSubmit={submitCodeGate}>
            <input className="input" placeholder="Enter Zealy Code" value={codeGateInput} onChange={(e) => setCodeGateInput(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="zp-btn ghost" onClick={() => { setOpenPopup(null); setQuickAction(null); }}>Cancel</button>
              <button type="submit" className="zp-btn primary">Unlock</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Data */}
      {openPopup === "quick-data" && (
        <Modal title="Buy Data" onClose={() => setOpenPopup(null)}>
          <form onSubmit={submitData} className="form-grid">
            <label>Network
              <select className="input" value={qNetwork} onChange={(e) => setQNetwork(e.target.value)}>
                {NETWORKS.map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
            <label>Phone Number
              <input className="input" value={qPhone} onChange={(e) => setQPhone(e.target.value)} />
            </label>
            <label>Plan
              <select className="input" value={qPlan} onChange={(e) => setQPlan(e.target.value)}>
                <option value="">Select plan</option>
                {DATA_PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Buy Data"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Airtime */}
      {openPopup === "quick-airtime" && (
        <Modal title="Buy Airtime" onClose={() => setOpenPopup(null)}>
          <form onSubmit={submitAirtime} className="form-grid">
            <label>Network
              <select className="input" value={qNetwork} onChange={(e) => setQNetwork(e.target.value)}>
                {NETWORKS.map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
            <label>Phone Number
              <input className="input" value={qPhone} onChange={(e) => setQPhone(e.target.value)} />
            </label>
            <label>Amount
              <input className="input" type="number" value={qAmount} onChange={(e) => setQAmount(e.target.value)} />
            </label>

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Send Airtime"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Bills */}
      {openPopup === "quick-bills" && (
        <Modal title="Pay Bills" onClose={() => setOpenPopup(null)}>
          <form onSubmit={submitBill} className="form-grid">
            <label>Bill Type
              <select className="input" value={qBillType} onChange={(e) => setQBillType(e.target.value)}>
                <option>Electricity</option>
                <option>Water</option>
                <option>School Fee</option>
                <option>Internet</option>
              </select>
            </label>
            <label>Account / Reference
              <input className="input" value={qBillAccount} onChange={(e) => setQBillAccount(e.target.value)} />
            </label>
            <label>Amount
              <input className="input" type="number" value={qAmount} onChange={(e) => setQAmount(e.target.value)} />
            </label>

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Pay Bill"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Invest */}
      {openPopup === "quick-invest" && (
        <Modal title="Invest" onClose={() => setOpenPopup(null)}>
          <form onSubmit={submitInvestment} className="form-grid">
            <label>Product
              <select className="input" value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
                <option>Spend & Save</option>
                <option>Fixed Account</option>
                <option>Target Savings</option>
              </select>
            </label>
            <label>Amount
              <input className="input" type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(e.target.value)} />
            </label>

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setOpenPopup(null)}>Cancel</button>
              <button type="submit" className="zp-btn primary" disabled={loadingAction}>{loadingAction ? <Spinner /> : "Start Investment"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <Modal title="Profile" onClose={() => setProfileOpen(false)}>
          <form onSubmit={saveProfile} className="form-grid">
            <label>Full name
              <input className="input" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </label>
            <label>Phone
              <input className="input" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
            </label>
            <label>Email (read-only)
              {/* per request: email should not be edited - set readOnly */}
              <input className="input" value={profileEmail} readOnly />
              <div className="muted">Email can't be changed here. Contact support if you need to update it.</div>
            </label>

            <div className="password-section">
              <div style={{ fontWeight: 700 }}>Change password</div>
              <input className="input" type="password" placeholder="Old password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
              <input className="input" type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              <input className="input" type="password" placeholder="Confirm new password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              <button type="button" className="zp-btn small" onClick={changePassword}>Change password</button>
            </div>

            <div className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input id="notifToggle" type="checkbox" checked={profileNotif} onChange={(e) => setProfileNotif(e.target.checked)} />
              <label htmlFor="notifToggle">Enable notifications</label>
            </div>

            {profileMsg && <div className="info">{profileMsg}</div>}

            <div className="modal-actions">
              <button type="button" className="zp-btn ghost" onClick={() => setProfileOpen(false)}>Cancel</button>
              <button type="submit" className="zp-btn primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* toast */}
      {toast && <div className={`zp-toast ${toast.type || ""}`}>{toast.text}</div>}

      {/* styles */}
      <style jsx>{`
        :root {
          --bg: #071025;
          --muted: rgba(255,255,255,0.6);
          --card: rgba(255,255,255,0.03);
          --glass: rgba(255,255,255,0.04);
          --accent: linear-gradient(90deg,#06b6d4,#6366f1);
        }
        .zp-root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg,#0f172a 0%, #0ea5e9 55%, #7c3aed 100%); min-height: 100vh; color: #fff; padding: 20px; }
        .zp-container { max-width: 1200px; margin: 0 auto; }
        .zp-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 18px; }
        .zp-brand .logo { font-weight:800; font-size:20px; color:#c7f9cc; }
        .zp-brand .tag { font-size:12px; color: rgba(255,255,255,0.85); }
        .zp-actions { display:flex; gap:8px; align-items:center; }
        .zp-btn { border: none; cursor:pointer; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.06); color:#fff; transition: transform .12s, opacity .12s; font-weight:600; }
        .zp-btn:hover { transform: translateY(-2px); }
        .zp-btn.ghost { background: rgba(255,255,255,0.04); }
        .zp-btn.primary { background: linear-gradient(90deg,#06b6d4,#3b82f6); color: #001; }
        .zp-btn.gradient { background: linear-gradient(90deg,#6366f1,#06b6d4); }
        .zp-btn.danger { background: linear-gradient(90deg,#ef4444,#ec4899); }
        .zp-btn.small { padding:6px 8px; font-size: 13px; }

        .zp-banner { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px; border-radius:12px; background: rgba(255,255,255,0.04); margin-bottom:16px; }
        .kp-title { font-weight:700; }
        .kp-sub { font-size:13px; color:var(--muted); }

        .zp-grid { display:grid; grid-template-columns: 2fr 1fr; gap: 18px; }
        .zp-main { display:flex; flex-direction:column; gap: 14px; }
        .zp-side { display:flex; flex-direction:column; gap:14px; }

        .card { background: rgba(255,255,255,0.03); padding:14px; border-radius:12px; box-shadow: 0 6px 18px rgba(2,6,23,0.35); }
        .wallet-left .hi { font-size:14px; }
        .wallet-left .name { font-weight:800; }
        .wallet-right { text-align:right; }
        .label { font-size:12px; color:var(--muted); }
        .amount { font-size:28px; font-weight:900; margin-top:6px; }

        .wallet-actions { margin-top:12px; display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        .zp-btn.mix { padding:10px; font-weight:800; border-radius:10px; }
        .mix-withdraw { background: linear-gradient(90deg,#06b6d4,#06b6a4); color:#001; }
        .mix-upgrade { background: linear-gradient(90deg,#f59e0b,#f97316); }
        .mix-buy { background: linear-gradient(90deg,#3b82f6,#06b6d4); }
        .mix-support { background: linear-gradient(90deg,#ef4444,#ec4899); }

        .quick-access .card-title, .activities .card-title, .ads .card-title { font-weight:700; margin-bottom:8px; }
        .quick-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        .quick-tile { background: rgba(255,255,255,0.04); padding:10px; border-radius:8px; font-weight:700; }

        .activity-list { max-height:320px; overflow:auto; }
        .activity-item { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.02); }
        .activity-type { font-weight:700; }
        .activity-amount { font-weight:800; }
        .activity-status.ok { color:#10b981; font-weight:700; }
        .activity-status.pending { color:#f59e0b; }

        .ad-slide { margin-top:8px; height:90px; border-radius:8px; display:flex; align-items:center; justify-content:center; background: linear-gradient(90deg,#0ea5e9,#7c3aed); }

        .profile-title { font-weight:700; }
        .profile-body { margin-top:8px; }
        .whatsapp { display:inline-block; padding:8px 10px; background:#10b981; color:#fff; border-radius:8px; text-decoration:none; font-weight:700; }

        .zp-notifs { position:fixed; right:20px; top:80px; width:340px; background:#fff; color:#0f172a; border-radius:12px; padding:12px; z-index:90; box-shadow:0 8px 40px rgba(2,6,23,0.6); }
        .zp-notifs-header { font-weight:800; margin-bottom:8px; }
        .zp-notifs-list { max-height:320px; overflow:auto; }

        /* modal/overlay */
        .zp-overlay { position:fixed; inset:0; background: rgba(2,6,23,0.6); z-index:80; }
        .modal { position:fixed; left:50%; top:50%; transform: translate(-50%,-50%); z-index:90; background:#fff; color:#0f172a; border-radius:12px; padding:18px; width: min(940px, 95%); max-height:92vh; overflow:auto; box-shadow:0 18px 60px rgba(2,6,23,0.6); }
        .modal h3 { margin:0 0 6px 0; }
        .form-grid { display:grid; gap:10px; grid-template-columns: 1fr 1fr; }
        .form-grid label { display:flex; flex-direction:column; gap:6px; }
        .input { padding:8px 10px; border-radius:8px; border:1px solid rgba(2,6,23,0.08); box-sizing:border-box; }
        .modal .muted { color: #6b7280; font-size:13px; }
        .modal .modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:6px; grid-column: 1 / -1; }

        .packs-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:12px; margin-top:6px; }
        .pack { background:#fff; color:#0f172a; border-radius:8px; padding:10px; border:1px solid #eee; }
        .pack.selected { border-color:#6366f1; box-shadow:0 6px 16px rgba(99,102,241,0.14); }
        .selected-pay { margin-top:12px; background:#fff7ed; padding:10px; border-radius:8px; }

        .muted { color:var(--muted); }

        .zp-toast { position:fixed; left:50%; transform:translateX(-50%); bottom:28px; background:#111827; color:#fff; padding:10px 14px; border-radius:8px; z-index:200; box-shadow:0 10px 30px rgba(2,6,23,0.7); }
        .zp-toast.success { background: linear-gradient(90deg,#10b981,#059669); }
        .zp-toast.error { background: linear-gradient(90deg,#ef4444,#f97316); }
        .zp-toast.info { background: linear-gradient(90deg,#3b82f6,#06b6d4); }

        .zp-muted { color:var(--muted); }

        /* small responsive */
        @media (max-width: 767px) {
          .zp-grid { grid-template-columns: 1fr; }
          .wallet-actions { grid-template-columns: repeat(2,1fr); }
          .quick-grid { grid-template-columns: repeat(2,1fr); }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

/* ---------- Small helper components ---------- */

function Modal({ title, onClose, children }) {
  return (
    <>
      <div className="modal" role="dialog" aria-modal="true">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 50 50" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.2"></circle>
      <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

function AdCard({ title, text }) {
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 13 }}>{text}</div>
    </div>
  );
}
