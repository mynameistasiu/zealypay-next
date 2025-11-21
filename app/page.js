"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaLoading2, setCtaLoading2] = useState(false);

  useEffect(() => {
    // small mount flag to stagger animations
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // CTA click handlers: show tiny loading animation before navigation
  function handlePrimaryClick(e) {
    // friendly UX: show spinner for 600ms — if user wants immediate nav, remove delay
    e && e.preventDefault && e.preventDefault();
    setCtaLoading(true);
    setTimeout(() => {
      // navigate programmatically for controlled delay
      window.location.href = "/register";
    }, 600);
  }
  function handleSecondaryClick(e) {
    e && e.preventDefault && e.preventDefault();
    setCtaLoading2(true);
    setTimeout(() => {
      window.location.href = "/login";
    }, 450);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <Header />

      {/* Hero Section */}
      <section
        className={`container py-16 grid lg:grid-cols-2 gap-12 items-center ${
          mounted ? "hp-mounted" : "hp-unmounted"
        }`}
      >
        {/* Left Content */}
        <div className="space-y-6">
          <h1
            className={`text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 headline-shimmer`}
            aria-hidden={false}
          >
            Zealy Pay{" "}
            <span className="text-indigo-600 relative inline-block">
              — Your Digital Wallet
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-300 to-transparent opacity-60 rounded-sm transform skew-x-6" />
            </span>
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-xl">
            Register today and claim your{" "}
            <span className="font-semibold text-indigo-600">₦100,000 bonus</span>. Manage payments,
            withdraw instantly, and enjoy a secure platform built for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <button
              onClick={handlePrimaryClick}
              className="cta-primary relative inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg transition-transform transform hover:-translate-y-0.5 focus:outline-none"
              aria-label="Start with 200k bonus"
            >
              {ctaLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-white">🎉</span>
              )}
              <span className="text-white">Start with ₦100,000 Bonus</span>
            </button>

            <button
              onClick={handleSecondaryClick}
              className="cta-ghost inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 font-semibold shadow-sm hover:bg-indigo-50 transition"
            >
              {ctaLoading2 ? (
                <span className="inline-block w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </div>

          {/* Features */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              ["⚡", "Fast Withdrawals", "Enjoy smooth withdrawals anytime."],
              ["🔐", "Secure Platform", "Top-notch security for your funds."],
              ["📞", "24/7 Support", "We’re always here to help you."],
            ].map(([emoji, title, desc], i) => (
              <article
                key={i}
                className={`p-5 rounded-2xl bg-white shadow transform transition hover:-translate-y-2 hover:shadow-lg feature-card`}
                style={{ transitionDelay: `${i * 80}ms` }}
                aria-label={title}
              >
                <div className="text-3xl">{emoji}</div>
                <div className="mt-2 font-semibold text-slate-800">{title}</div>
                <p className="text-sm text-slate-600 mt-1">{desc}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Right Content - Quick Access Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-8 quick-card transform transition"
          style={{ minWidth: 0 }}
        >
          <h3 className="text-lg font-semibold text-slate-800">🚀 Quick Access</h3>
          <p className="text-sm text-slate-600 mt-1">Jump straight into your favorite actions.</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link href="/register" className="btn-ghost" onClick={() => {}}>
              <div className="tile">
                <div className="tile-title">Create Account</div>
                <div className="tile-sub">Get started</div>
              </div>
            </Link>

            <Link href="/login" className="btn-ghost">
              <div className="tile">
                <div className="tile-title">Access Dashboard</div>
                <div className="tile-sub">Sign in</div>
              </div>
            </Link>

            <Link href="/withdraw" className="btn-ghost">
              <div className="tile">
                <div className="tile-title">Withdraw</div>
                <div className="tile-sub">Send funds to bank</div>
              </div>
            </Link>

            <Link href="/buy-zealy-code" className="btn-ghost">
              <div className="tile">
                <div className="tile-title">Buy Zealy Code</div>
                <div className="tile-sub">Get access & promos</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose ZealyPay */}
      <section className="bg-indigo-50 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Choose <span className="text-indigo-600">ZealyPay?</span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            ZealyPay gives you instant bonus, fast withdrawals, secure transactions,
            and reliable 24/7 customer support. It’s more than just a wallet — it’s your financial partner.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow feature-lg transform transition hover:-translate-y-2">
              <div className="font-semibold text-lg">Instant Bonus</div>
              <p className="text-sm text-slate-600 mt-2">Sign up and receive welcome funds instantly.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow feature-lg transform transition hover:-translate-y-2" style={{ transitionDelay: "80ms" }}>
              <div className="font-semibold text-lg">Secure Transfers</div>
              <p className="text-sm text-slate-600 mt-2">Encrypted and monitored transactions.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow feature-lg transform transition hover:-translate-y-2" style={{ transitionDelay: "160ms" }}>
              <div className="font-semibold text-lg">Rewards & Promos</div>
              <p className="text-sm text-slate-600 mt-2">Participate in monthly giveaways and campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 text-center container">
        <h2 className="text-3xl font-bold text-slate-900">Ready to get started?</h2>
        <p className="mt-2 text-slate-600">Create your account today and enjoy your ₦100,000 welcome bonus 🎉</p>

        <Link
          href="/register"
          className="mt-6 inline-block px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition transform hover:-translate-y-1"
        >
          Create My Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container py-6 text-sm text-slate-600 text-center">
          Zealy Pay — The future of digital payments • © 2025 ZealyPay. All rights reserved.
        </div>
      </footer>

      {/* Page styles & animations */}
      <style jsx>{`
        /* entrance */
        .hp-unmounted { opacity: 0; transform: translateY(10px); }
        .hp-mounted { opacity: 1; transform: translateY(0); transition: opacity 450ms ease, transform 450ms ease; }

        /* headline shimmer */
        .headline-shimmer {
          position: relative;
          overflow: hidden;
        }
        .headline-shimmer::after {
          content: "";
          position: absolute;
          left: -30%;
          top: 0;
          width: 60%;
          height: 100%;
          transform: skewX(-18deg);
          background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.24), rgba(255,255,255,0.06));
          animation: slide 2.2s linear infinite;
          opacity: 0.95;
          pointer-events: none;
        }
        @keyframes slide {
          0% { left: -40%; }
          50% { left: 120%; }
          100% { left: 120%; }
        }

        /* feature cards fade / slide in */
        .feature-card { opacity: 0; transform: translateY(10px); animation: featureIn 520ms ease forwards; }
        .feature-card:nth-child(1) { animation-delay: 160ms; }
        .feature-card:nth-child(2) { animation-delay: 240ms; }
        .feature-card:nth-child(3) { animation-delay: 320ms; }
        @keyframes featureIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* quick card */
        .quick-card { opacity: 0; transform: translateY(6px); animation: quickIn 520ms ease forwards; animation-delay: 140ms; }
        @keyframes quickIn { to { opacity: 1; transform: translateY(0); } }

        /* tile style inside quick card */
        .tile { padding: 12px; border-radius: 10px; background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent); transition: transform 160ms ease, box-shadow 160ms ease; }
        .tile:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
        .tile-title { font-weight: 700; }
        .tile-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }

        /* CTA primary gradient */
        .cta-primary { background: linear-gradient(90deg,#6366f1,#06b6d4); color: white; border: none; }
        .cta-primary:active { transform: translateY(1px) scale(0.997); }

        /* prefer-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .headline-shimmer::after { animation: none; display: none; }
          .feature-card, .quick-card, .hp-mounted { transition: none; animation: none; opacity: 1; transform: none; }
          .cta-primary, .cta-ghost, .tile { transition: none; }
        }

        /* small screens tweak */
        @media (max-width: 900px) {
          section.container { padding-left: 1rem; padding-right: 1rem; }
          .headline-shimmer::after { display: none; } /* keep mobile simpler */
        }
      `}</style>
    </main>
  );
}
