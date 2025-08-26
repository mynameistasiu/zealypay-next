"use client";
import { useState } from "react";

function useTxn(setTxns) {
  return (data) => {
    setTxns((prev) => [data, ...prev]);
  };
}

export function WithdrawForm({ balance, setBalance, setTxns, onDone }) {
  const [amount, setAmount] = useState("");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    const newBal = Math.max(0, balance - amt);
    setBalance(newBal);
    addTxn({
      date: new Date().toLocaleString(),
      type: "Withdraw",
      details: "User withdrawal request",
      amount: amt,
      status: "Pending"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Amount (₦)</label>
        <input className="input" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="1000" />
      </div>
      <button className="btn-primary w-full">Submit Withdrawal</button>
      <p className="text-xs text-slate-500 text-center">After processing, status updates to “Successful”.</p>
    </form>
  );
}

export function UpgradeForm({ setTxns, onDone }) {
  const [pkg, setPkg] = useState("Bronze");
  const [ref, setRef] = useState("");
  const addTxn = useTxn(setTxns);
  const prices = { Bronze: 5500, Silver: 7500, Gold: 10000 };
  const submit = (e) => {
    e.preventDefault();
    addTxn({
      date: new Date().toLocaleString(),
      type: "Upgrade",
      details: `${pkg} package (ref: ${ref||"N/A"})`,
      amount: prices[pkg],
      status: "Pending"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Select Package</label>
        <select className="input" value={pkg} onChange={(e)=>setPkg(e.target.value)}>
          <option>Bronze</option>
          <option>Silver</option>
          <option>Gold</option>
        </select>
      </div>
      <div>
        <label className="label">Proof of Payment / Ref</label>
        <input className="input" value={ref} onChange={(e)=>setRef(e.target.value)} placeholder="e.g. TRANS12345" />
      </div>
      <button className="btn-primary w-full">Submit Upgrade</button>
      <p className="text-xs text-slate-500 text-center">You’ll see a countdown after approval (demo).</p>
    </form>
  );
}

export function BuyCodeForm({ setTxns, onDone }) {
  const [ref, setRef] = useState("");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    addTxn({
      date: new Date().toLocaleString(),
      type: "Buy Zealy Code",
      details: `Single code purchase (ref: ${ref||"N/A"})`,
      amount: 0,
      status: "Successful"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        The current code is <span className="font-semibold">ZLP1054XM</span>. Enter proof/ref if needed.
      </div>
      <div>
        <label className="label">Payment Ref (optional)</label>
        <input className="input" value={ref} onChange={(e)=>setRef(e.target.value)} placeholder="e.g. TRANS12345" />
      </div>
      <button className="btn-primary w-full">Mark as Purchased</button>
    </form>
  );
}

export function AirtimeForm({ setTxns, onDone }) {
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    const amt = Number(amount||0);
    addTxn({
      date: new Date().toLocaleString(),
      type: "Airtime",
      details: `${network} - ${phone}`,
      amount: amt,
      status: "Successful"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="row">
        <div>
          <label className="label">Network</label>
          <select className="input" value={network} onChange={(e)=>setNetwork(e.target.value)}>
            <option>MTN</option><option>Glo</option><option>Airtel</option><option>9mobile</option>
          </select>
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="080..." />
        </div>
      </div>
      <div>
        <label className="label">Amount (₦)</label>
        <input className="input" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="500" />
      </div>
      <button className="btn-primary w-full">Buy Airtime</button>
    </form>
  );
}

export function DataForm({ setTxns, onDone }) {
  const [network, setNetwork] = useState("MTN");
  const [plan, setPlan] = useState("1.5GB Daily");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("1000");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    addTxn({
      date: new Date().toLocaleString(),
      type: "Data",
      details: `${network} - ${plan} - ${phone}`,
      amount: Number(amount),
      status: "Successful"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="row">
        <div>
          <label className="label">Network</label>
          <select className="input" value={network} onChange={(e)=>setNetwork(e.target.value)}>
            <option>MTN</option><option>Glo</option><option>Airtel</option><option>9mobile</option>
          </select>
        </div>
        <div>
          <label className="label">Plan</label>
          <select className="input" value={plan} onChange={(e)=>setPlan(e.target.value)}>
            <option>1.5GB Daily</option><option>2GB Weekly</option><option>10GB Monthly</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="080..." />
        </div>
        <div>
          <label className="label">Amount (₦)</label>
          <input className="input" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        </div>
      </div>
      <button className="btn-primary w-full">Buy Data</button>
    </form>
  );
}

export function PayBillsForm({ setTxns, onDone }) {
  const [biller, setBiller] = useState("Electricity");
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    addTxn({
      date: new Date().toLocaleString(),
      type: "Bill Payment",
      details: `${biller} - ${customer}`,
      amount: Number(amount||0),
      status: "Successful"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="row">
        <div>
          <label className="label">Biller</label>
          <select className="input" value={biller} onChange={(e)=>setBiller(e.target.value)}>
            <option>Electricity</option><option>TV</option><option>Education</option>
          </select>
        </div>
        <div>
          <label className="label">Customer/Ref</label>
          <input className="input" value={customer} onChange={(e)=>setCustomer(e.target.value)} placeholder="Customer ID" />
        </div>
      </div>
      <div>
        <label className="label">Amount (₦)</label>
        <input className="input" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="2000" />
      </div>
      <button className="btn-primary w-full">Pay Bill</button>
    </form>
  );
}

export function InvestmentForm({ setTxns, onDone }) {
  const [plan, setPlan] = useState("Starter");
  const [amount, setAmount] = useState("5000");
  const addTxn = useTxn(setTxns);
  const submit = (e) => {
    e.preventDefault();
    addTxn({
      date: new Date().toLocaleString(),
      type: "Investment",
      details: `${plan} savings`,
      amount: Number(amount||0),
      status: "Successful"
    });
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="row">
        <div>
          <label className="label">Plan</label>
          <select className="input" value={plan} onChange={(e)=>setPlan(e.target.value)}>
            <option>Starter</option><option>Standard</option><option>Pro</option>
          </select>
        </div>
        <div>
          <label className="label">Amount (₦)</label>
          <input className="input" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        </div>
      </div>
      <button className="btn-primary w-full">Invest</button>
    </form>
  );
}
