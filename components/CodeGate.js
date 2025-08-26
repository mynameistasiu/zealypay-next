"use client";
import { useState } from "react";
import Modal from "./Modal";

export default function CodeGate({ open, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === "ZLP1054XM") {
      setError("");
      onSuccess?.();
      onClose?.();
    } else {
      setError("Invalid Zealy Code.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Enter Zealy Code">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Zealy Code</label>
          <input className="input" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter Zealy Code" />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <button className="btn-primary w-full">Continue</button>
      </form>
    </Modal>
  );
}
