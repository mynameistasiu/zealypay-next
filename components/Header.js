"use client";
import Link from "next/link";

export default function Header({ showAuth=true }) {
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-30">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          <span className="text-brand">Zealy</span> Pay
        </Link>
        {showAuth && (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Login</Link>
            <Link href="/register" className="btn-primary">Create Account</Link>
          </div>
        )}
      </div>
    </header>
  );
}
