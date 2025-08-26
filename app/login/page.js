"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Login page (client)
 * - Loading animation + success popup
 * - Remember me (stores email)
 * - Show / hide password
 * - Email format validation
 * - "Forgot password" simple local flow (demo)
 *
 * Note: This is a demo/local-only authentication flow using localStorage.
 * Do not store plaintext passwords in production.
 */

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successPopup, setSuccessPopup] = useState(null); // { name, message } or null
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => {
    // If already logged in, go to dashboard
    const logged = localStorage.getItem("zealy:isLoggedIn") === "true";
    if (logged) {
      router.replace("/dashboard");
      return;
    }

    // restore remembered email if present
    const rem = localStorage.getItem("zealy:rememberEmail");
    if (rem) {
      setEmail(rem);
      setRemember(true);
    }
  }, [router]);

  function isValidEmail(e) {
    return /^\S+@\S+\.\S+$/.test(e);
  }

  const submit = (e) => {
    e.preventDefault();
    setError("");

    // quick validation
    if (!email.trim() || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // find saved user
    const saved = JSON.parse(localStorage.getItem("zealy:user") || "null");
    if (!saved) {
      setError("No account found. Please register first.");
      return;
    }

    // begin loading animation
    setLoading(true);

    // simulate verification delay for UX
    setTimeout(() => {
      if (saved.email.toLowerCase() === email.trim().toLowerCase() && saved.password === password) {
        // success
        localStorage.setItem("zealy:isLoggedIn", "true");
        localStorage.setItem("zealy:lastLogin", new Date().toISOString());

        // remember email if requested
        if (remember) localStorage.setItem("zealy:rememberEmail", email.trim().toLowerCase());
        else localStorage.removeItem("zealy:rememberEmail");

        setSuccessPopup({ name: saved.fullName || "User", message: "Login successful — redirecting to your dashboard" });

        // small success display before redirect
        setTimeout(() => {
          setLoading(false);
          setSuccessPopup(null);
          router.push("/dashboard");
        }, 900);
      } else {
        setLoading(false);
        setError("Invalid credentials. Please check email and password.");
      }
    }, 700);
  };

  // local "forgot password" demo: allow user to set a new password if email matches saved user
  const handleForgotRequest = (e) => {
    e && e.preventDefault && e.preventDefault();
    setForgotMsg("");
    if (!forgotEmail.trim() || !isValidEmail(forgotEmail)) {
      setForgotMsg("Enter a valid registered email.");
      return;
    }
    const saved = JSON.parse(localStorage.getItem("zealy:user") || "null");
    if (!saved || saved.email.toLowerCase() !== forgotEmail.trim().toLowerCase()) {
      setForgotMsg("No account found for that email.");
      return;
    }
    // demo: generate a pseudo temporary code and show it (in real world, send email)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem("zealy:pwreset:" + saved.email, JSON.stringify({ code, created: new Date().toISOString() }));
    setForgotMsg(`Reset code (demo): ${code} — use it on the Reset Password screen.`);
  };

  // small inline styles to match dashboard theme
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#0f172a 0%, #0ea5e9 55%, #7c3aed 100%)" }} className="flex items-center justify-center p-6 text-white">
      <div style={{ width: "min(920px,100%)", maxWidth: 900 }} className="grid grid-cols-2 gap-6">
        {/* Left: hero / marketing (colorful) */}
        <div style={{ padding: 28, borderRadius: 14, background: "linear-gradient(90deg,#042f4a,#0b3048)" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}><span style={{ color: "#c7f9cc" }}>Zealy</span> Pay</h1>
          <p style={{ color: "rgba(255,255,255,0.9)", marginTop: 8 }}>Your digital wallet — secure, fast and delightful.</p>

          <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>Welcome Bonus</div>
              <div style={{ color: "rgba(255,255,255,0.8)" }}>Register and get ₦200,000 added to your wallet.</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>How it works</div>
              <div style={{ color: "rgba(255,255,255,0.8)" }}>Buy codes, complete tasks, earn rewards and withdraw.</div>
            </div>
          </div>
        </div>

        {/* Right: login form */}
        <div style={{ background: "#fff", color: "#0f172a", padding: 20, borderRadius: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Welcome back</h2>
          <p style={{ marginTop: 6, color: "#475569" }}>Sign in to access your Zealy Pay dashboard</p>

          <form onSubmit={submit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Password</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ padding: "8px 10px", borderRadius: 8, border: "none", background: "#eef2ff" }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
              </label>

              <button type="button" onClick={() => setForgotOpen(true)} style={{ background: "transparent", border: "none", color: "#0ea5e9", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>

            {error && <div style={{ color: "#dc2626", fontWeight: 700 }}>{error}</div>}

            <button type="submit" className="submitBtn" disabled={loading} style={{ display: "inline-flex", justifyContent: "center", gap: 10, alignItems: "center", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(90deg,#06b6d4,#06b6a4)", color: "#fff", fontWeight: 800 }}>
              {loading ? <span className="spinner" /> : null}
              {loading ? "Verifying..." : "Login"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "#475569" }}>
              Don't have an account? <a href="/register" style={{ color: "#0ea5e9", fontWeight: 700 }}>Create one</a>
            </div>
          </form>
        </div>
      </div>

      {/* Success popup */}
      {successPopup && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.6)" }} />
          <div style={{ zIndex: 90, background: "#fff", color: "#0f172a", borderRadius: 12, padding: 20, width: 360, textAlign: "center", boxShadow: "0 12px 40px rgba(2,6,23,0.35)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: "linear-gradient(90deg,#10b981,#06b6d4)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36 }}>
              ✓
            </div>
            <h3 style={{ marginTop: 12, marginBottom: 6 }}>Welcome back, {successPopup.name}</h3>
            <div style={{ color: "#475569", marginBottom: 12 }}>{successPopup.message}</div>
          </div>
        </div>
      )}

      {/* Forgot password modal (demo local flow) */}
      {forgotOpen && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80 }}>
          <div onClick={() => setForgotOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.6)" }} />
          <div style={{ zIndex: 90, background: "#fff", color: "#0f172a", borderRadius: 12, padding: 18, width: 360 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Forgot Password</h3>
              <button onClick={() => setForgotOpen(false)} style={{ background: "transparent", border: "none", fontSize: 18 }}>✖</button>
            </div>

            <p style={{ color: "#475569", marginTop: 8 }}>Enter your registered email to get a demo reset code (shown locally).</p>

            <form onSubmit={(e) => { e.preventDefault(); handleForgotRequest(); }} style={{ marginTop: 8 }}>
              <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className="input" />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="submit" style={{ flex: 1, padding: 10, background: "#06b6d4", color: "#fff", borderRadius: 8, border: "none" }}>Request Reset Code</button>
                <button type="button" onClick={() => { setForgotOpen(false); }} style={{ padding: 10, background: "#e6e6e6", borderRadius: 8 }}>Close</button>
              </div>
              {forgotMsg && <div style={{ marginTop: 8, color: "#065f46" }}>{forgotMsg}</div>}
            </form>
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
        .submitBtn { cursor: pointer; }
        .spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: rgba(255,255,255,0.95);
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 880px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
