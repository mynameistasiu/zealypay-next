"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem("zealy:isLoggedIn") === "true";
    if (logged) router.push("/dashboard");
  }, [router]);

  const submit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("zealy:user") || "null");
    if (user && user.email === email && user.password === password) {
      localStorage.setItem("zealy:isLoggedIn", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <main>
      <Header />
      <section className="container py-10">
        <div className="max-w-md mx-auto card">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="btn-primary w-full">Login</button>
          </form>
        </div>
      </section>
    </main>
  );
}
