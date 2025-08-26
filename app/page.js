"use client";
import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <Header />

      {/* Hero Section */}
      <section className="container py-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <h1 className="text-5xl font-bold leading-tight text-slate-900">
            Zealy Pay <span className="text-indigo-600">— Your Digital Wallet</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Register today and claim your{" "}
            <span className="font-semibold text-indigo-600">₦200,000 bonus</span>. 
            Manage payments, withdraw instantly, and enjoy a secure platform built for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex gap-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
            >
              Start with ₦200,000 Bonus 🎉
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 font-semibold shadow hover:bg-indigo-50 transition"
            >
              Login
            </Link>
          </div>

          {/* Features */}
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              ["⚡", "Fast Withdrawals", "Enjoy smooth withdrawals anytime."],
              ["🔐", "Secure Platform", "Top-notch security for your funds."],
              ["📞", "24/7 Support", "We’re always here to help you."],
            ].map(([emoji, title, desc], i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white shadow hover:shadow-md transition"
              >
                <div className="text-3xl">{emoji}</div>
                <div className="mt-2 font-semibold text-slate-800">{title}</div>
                <p className="text-sm text-slate-600 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Quick Access Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-semibold text-slate-800">
            🚀 Quick Access
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Jump straight into your favorite actions.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link href="/register" className="btn-ghost">
              Create Account
            </Link>
            <Link href="/login" className="btn-ghost">
              Access Dashboard
            </Link>
            <Link href="/withdraw" className="btn-ghost">
              Withdraw
            </Link>
            <Link href="/buy-zealy-code" className="btn-ghost">
              Buy Zealy Code
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
            and reliable 24/7 customer support. 
            It’s more than just a wallet — it’s your financial partner.
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 text-center container">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to get started?
        </h2>
        <p className="mt-2 text-slate-600">
          Create your account today and enjoy your ₦200,000 welcome bonus 🎉
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
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
    </main>
  );
}
