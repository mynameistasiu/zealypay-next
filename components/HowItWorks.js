"use client";
import { useState } from "react";
import Modal from "./Modal";

const slides = [
  {
    title: "Welcome to Zealy Pay 🎉",
    text: "You’ve received a ₦150,000 welcome bonus. Explore services from your dashboard."
  },
  {
    title: "Use Zealy Code to Unlock",
    text: "To access services (Data, Airtime, Withdraw, etc.), enter your Zealy Code when prompted."
  },
  {
    title: "Track Everything",
    text: "Every action you take is recorded in Transaction History with clear statuses."
  },
  {
    title: "Upgrade & Buy Code",
    text: "Use the top buttons to Upgrade or Buy Zealy Code. Follow the instructions in each popup."
  }
];

export default function HowItWorks({ open, onClose }) {
  const [i, setI] = useState(0);
  const next = () => setI((p) => Math.min(p + 1, slides.length - 1));
  const prev = () => setI((p) => Math.max(p - 1, 0));
  const done = () => onClose?.();

  return (
    <Modal open={open} onClose={done} title="How Zealy Pay Works">
      <div className="space-y-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xl font-semibold">{slides[i].title}</div>
          <p className="text-slate-600 mt-1">{slides[i].text}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="badge">Slide {i + 1} / {slides.length}</span>
          <div className="space-x-2">
            <button onClick={prev} className="btn-ghost" disabled={i===0}>Previous</button>
            {i < slides.length - 1 ? (
              <button onClick={next} className="btn-primary">Next</button>
            ) : (
              <button onClick={done} className="btn-primary">Finish</button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
