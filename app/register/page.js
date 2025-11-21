"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Register page
 * - colorful (matches dashboard palette)
 * - email validation
 * - strong password requirements + strength meter
 * - loading animations for submit
 * - success popup that continues to DASHBOARD (not login)
 * - stores user locally: zealy:user, zealy:isLoggedIn, zealy:balance, zealy:transactions
 */

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Validate email with simple regex
  function isValidEmail(e) {
    return /^\S+@\S+\.\S+$/.test(e);
  }

  // Strong password: min 8 chars, at least one uppercase, lowercase, digit
  function passwordStrength(pw) {
    const min = pw.length >= 8;
    const upper = /[A-Z]/.test(pw);
    const lower = /[a-z]/.test(pw);
    const num = /[0-9]/.test(pw);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    const score = [min, upper, lower, num, special].filter(Boolean).length;
    return { min, upper, lower, num, special, score };
  }

  const strength = passwordStrength(password);
  const strengthLabel =
    strength.score <= 2 ? "Weak" : strength.score === 3 ? "Fair" : strength.score === 4 ? "Good" : "Strong";

  // Submit handler
  const submit = (e) => {
    e.preventDefault();
    setError("");

    // basic validations
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    if (!email.trim() || !isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must include uppercase, lowercase and a number.");
      return;
    }

    setLoading(true);

    // small simulated delay for nice UX (loading animation)
    setTimeout(() => {
      // store user (demo): do NOT store sensitive info in real projects like this
      const newUser = {
        id: `user-${Date.now()}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password, // for a demo only — do not store plaintext in production
        created: new Date().toISOString(),
        settings: { notifications: true }
      };

      // persist
      localStorage.setItem("zealy:user", JSON.stringify(newUser));
      localStorage.setItem("zealy:isLoggedIn", "true"); // log in immediately
      localStorage.setItem("zealy:balance", String(100000)); // welcome bonus
      localStorage.setItem("zealy:transactions", JSON.stringify([]));
      localStorage.setItem("zealy:activities", JSON.stringify([]));
      localStorage.setItem("zealy:showHowItWorks", "true");

      setLoading(false);
      setShowPopup(true);
    }, 900);
  };

  const handleContinue = () => {
    // user is already logged in in localStorage; go to dashboard
    setShowPopup(false);
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#7c3aed 0%, #0ea5e9 100%)" }} className="flex items-center justify-center p-6">
      <div style={{ width: "min(920px,100%)", maxWidth: 420 }} className="rounded-2xl shadow-xl overflow-hidden">
        <div style={{ padding: 22, background: "linear-gradient(90deg,#0b2540,#042f4a)" }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 800 }}>Zealy <span style={{ color: "#c7f9cc" }}>Pay</span></h1>
          <p style={{ color: "rgba(255,255,255,0.9)", marginTop: 6, fontSize: 13 }}>Create your account and get ₦100,000 Welcome Bonus</p>
        </div>

        <div style={{ background: "#fff", padding: 20 }}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Full name</label>
              <input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="John Doe" className="input" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Phone</label>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+234..." className="input" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Password</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type={passwordVisible ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Strong password" className="input" />
                <button type="button" onClick={() => setPasswordVisible(s=>!s)} style={{ padding: "8px 10px", borderRadius: 8, background: "#eef2ff", border: "none" }}>
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ height: 8, flex: 1, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{
                    width: `${(strength.score / 5) * 100}%`,
                    height: "100%",
                    background: strength.score <= 2 ? "#ef4444" : strength.score === 3 ? "#f59e0b" : strength.score === 4 ? "#06b6d4" : "#10b981",
                    transition: "width .3s"
                  }} />
                </div>
                <div style={{ fontSize: 12, color: "#475569", minWidth: 56, textAlign: "right" }}>{strengthLabel}</div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Password must be at least 8 characters and include uppercase, lowercase and a number.
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Confirm Password</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type={confirmVisible ? "text" : "password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Repeat password" className="input" />
                <button type="button" onClick={() => setConfirmVisible(s=>!s)} style={{ padding: "8px 10px", borderRadius: 8, background: "#eef2ff", border: "none" }}>
                  {confirmVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div style={{ color: "#dc2626", fontWeight: 700 }}>{error}</div>}

            <button type="submit" disabled={loading} className="submitBtn" style={{ width: "100%", display: "inline-flex", justifyContent: "center", gap: 10, alignItems: "center" }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <div style={{ textAlign: "center", color: "#475569", fontSize: 13 }}>
              Already have an account? <a href="/login" style={{ color: "#0ea5e9", fontWeight: 700 }}>Login</a>
            </div>
          </form>
        </div>
      </div>

      {/* Success popup */}
      {showPopup && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.6)" }}>
          <div style={{ width: "min(420px,95%)", background: "#fff", borderRadius: 14, padding: 20, textAlign: "center", boxShadow: "0 8px 40px rgba(2,6,23,0.3)" }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <h2 style={{ marginTop: 6, marginBottom: 8 }}>Congratulations!</h2>
            <p style={{ color: "#374151", marginBottom: 12 }}>
              Your account is ready — you received a <strong>₦100,000</strong> Welcome Bonus.
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={handleContinue} style={{ padding: "10px 16px", background: "#10b981", color: "#fff", borderRadius: 8, border: "none", fontWeight: 700 }}>
                Continue to Dashboard
              </button>
              <button onClick={() => { setShowPopup(false); }} style={{ padding: "10px 16px", background: "#e6e6e6", color: "#111827", borderRadius: 8, border: "none" }}>
                Stay here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* small styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e6e6e6;
          box-sizing: border-box;
          font-size: 14px;
          outline: none;
        }
        .input:focus {
          box-shadow: 0 6px 18px rgba(14,165,233,0.12);
          border-color: #06b6d4;
        }
        .submitBtn {
          padding: 12px 14px;
          background: linear-gradient(90deg,#06b6d4,#06b6a4);
          color: white;
          font-weight: 800;
          border: none;
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(6,182,212,0.14);
          transition: transform .12s ease, opacity .12s ease;
        }
        .submitBtn:active { transform: translateY(1px); }
        .submitBtn[disabled] { opacity: 0.8; transform: none; pointer-events: none; }

        .spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: rgba(255,255,255,0.95);
          animation: spin 1s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* responsive */
        @media (max-width: 640px) {
          .submitBtn { font-size: 14px; padding: 10px 12px; }
        }
      `}</style>
    </div>
  );
}
