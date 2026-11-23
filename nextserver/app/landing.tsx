"use client";

import { useEffect, useMemo, useState } from "react";

const apk = "/download";

const androidIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.523 15.341a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-11.046 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm11.405-6.02 1.9-3.29a.4.4 0 1 0-.693-.4l-1.924 3.332A11.83 11.83 0 0 0 12 7.8c-1.85 0-3.59.42-5.165 1.163L4.91 5.63a.4.4 0 1 0-.693.4l1.9 3.29A10.97 10.97 0 0 0 1 18.25h22a10.97 10.97 0 0 0-5.118-8.929z" />
  </svg>
);

const faqs = [
  ["Do my friends need the app before I add them?", "Not at all. Just add their email address when you create the group. The moment they download VacayPay and sign in with that same email, the trip and all expenses are already waiting for them."],
  ["How do I install the Android APK?", "Tap any Download for Android button on this page to save vacaypay.apk. Open the downloaded file, allow installation from your browser if Android prompts you, and launch VacayPay in seconds."],
  ["Is VacayPay free to use?", "Yes — 100% free with no daily expense limits, no subscriptions, and no annoying ads interrupting your dinner split."],
  ["Can we use it for non-travel expenses like flats or dinners?", "Absolutely. Whether it’s monthly flat utilities, a birthday dinner, or a weekend trek, any shared group expense works seamlessly on VacayPay."],
  ["Does VacayPay connect to my bank account?", "No. VacayPay is a clean, private bill book. It tracks who paid and who owes whom without ever asking for bank credentials or card details."],
] as const;

const scenarios = {
  beach: {
    badge: "GOA · 4 FRIENDS",
    heading: "Scooters, shacks, and sunset tabs.",
    desc: "From Activa rentals in Anjuna to seafood dinners by the shore, log every spend in seconds so nobody plays accountant on the flight home.",
    ledgerTitle: "Goa, June — Ledger",
    ledgerTotal: "Total ₹9,400",
    rows: [
      ["Beach Shack Dinner", "Anuj paid · Split 4 ways", "₹1,800"],
      ["2-Day Scooter Rentals", "Riya paid · Split 4 ways", "₹2,400"],
      ["Boutique Hostel Stay", "Anuj paid · Split 4 ways", "₹5,200"],
    ],
    summaryLabel: "Net Settlement",
    summaryVal: "Anuj gets back ₹4,650",
    label: "🏖️ Beach Trips (Goa)",
  },
  flats: {
    badge: "FLAT 402 · 3 FLATMATES",
    heading: "Rent, Wi-Fi, and groceries — effortlessly even.",
    desc: "Keep one recurring group for your apartment. Whenever someone covers the electricity bill or Blinkit run, the monthly balance updates automatically.",
    ledgerTitle: "Flat 402 — Monthly Tab",
    ledgerTotal: "Total ₹11,100",
    rows: [
      ["Fiber Wi-Fi & Electricity", "Meera paid · Split 3 ways", "₹4,200"],
      ["Cook & Maid Salary", "Dev paid · Split 3 ways", "₹4,500"],
      ["Weekly Groceries", "Meera paid · Split 3 ways", "₹2,400"],
    ],
    summaryLabel: "Month-End Balance",
    summaryVal: "Meera gets back ₹2,900",
    label: "🏠 Shared Flats & Stays",
  },
  dinners: {
    badge: "FRIDAY NIGHT · 5 FRIENDS",
    heading: "One card pays. Everyone knows their exact share.",
    desc: "Skip the awkward 10-minute calculator pass-around when the cheque arrives. Tap the total, pick who paid, and head out for dessert.",
    ledgerTitle: "Indiranagar Dinner",
    ledgerTotal: "Total ₹4,500",
    rows: [
      ["Wood-Fired Pizza & Drinks", "Kabir paid · Split 5 ways", "₹3,600"],
      ["Gelato Stop", "Neha paid · Split 5 ways", "₹900"],
    ],
    summaryLabel: "End of Night",
    summaryVal: "Kabir gets back ₹2,700",
    label: "🍜 Group Dinners",
  },
  roadtrips: {
    badge: "MANALI DRIVE · 4 FRIENDS",
    heading: "Fuel, FASTag tolls, and highway chai.",
    desc: "Road trips mean dozens of small stops. Log each tank refill and dhaba meal along the highway and settle up in a single transfer back home.",
    ledgerTitle: "Delhi → Manali Road Trip",
    ledgerTotal: "Total ₹12,800",
    rows: [
      ["Full Tank Fuel + Tolls", "Arjun paid · Split 4 ways", "₹5,600"],
      ["Riverside Homestay", "Sana paid · Split 4 ways", "₹6,000"],
      ["Murthal Paratha Stop", "Arjun paid · Split 4 ways", "₹1,200"],
    ],
    summaryLabel: "Trip Settlement",
    summaryVal: "Arjun gets back ₹3,600",
    label: "🚗 Weekend Road Trips",
  },
} as const;

type ScenarioKey = keyof typeof scenarios;

function inr(num: number) {
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [settled, setSettled] = useState(false);
  const [title, setTitle] = useState("Goa Beach Dinner");
  const [amount, setAmount] = useState("1800");
  const [payer, setPayer] = useState("Anuj");
  const [people, setPeople] = useState(4);
  const [scene, setScene] = useState<ScenarioKey>("beach");
  const [faq, setFaq] = useState(0);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const split = useMemo(() => {
    const total = Number(amount);
    const safe = Number.isFinite(total) && total > 0 ? total : 0;
    const count = Math.min(12, Math.max(2, people));
    return { total: safe, count, each: safe / count, owed: safe - safe / count, who: payer.trim() || "You", name: title.trim() || "Group Expense" };
  }, [amount, people, payer, title]);

  const active = scenarios[scene];

  return (
    <div className="relative bg-grid-pattern font-sans text-slate-100 selection:bg-mint/30 selection:text-mint">
      <style>{`
        .glass { background: rgba(17, 19, 28, 0.65); backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-strong { background: rgba(15, 17, 26, 0.82); backdrop-filter: blur(22px); border: 1px solid rgba(255, 255, 255, 0.12); }
        .text-gradient { background: linear-gradient(135deg, #22F59E 0%, #06B6D4 55%, #A78BFA 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
        .bg-grid-pattern { background-size: 48px 48px; background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
        .reveal.visible { opacity: 1; transform: none; }
        .faq-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .32s ease; }
        .faq-item[data-open="true"] .faq-content { grid-template-rows: 1fr; }
        .faq-item[data-open="true"] .faq-chevron { transform: rotate(180deg); color: #22F59E; }
        input.split-range { -webkit-appearance: none; appearance: none; background: rgba(255,255,255,.1); height: 6px; border-radius: 999px; }
        input.split-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #22F59E; border: 2px solid #090A0F; box-shadow: 0 0 14px rgba(34,245,158,.7); }
      `}</style>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-mint/10 blur-[130px]" />
        <div className="animate-pulse-glow absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-violet-glow/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-glow/10 blur-[130px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav className="glass-strong mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 shadow-2xl shadow-black/40 sm:px-6">
          <a href="#" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mint via-cyan-glow to-violet-glow p-px shadow-lg shadow-mint/20">
              <span className="flex h-full w-full items-center justify-center rounded-[11px] bg-obsidian">
                <svg className="h-5 w-5 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 6l7 13 7-13" />
                  <circle cx="12" cy="8" r="1.5" fill="#22F59E" stroke="none" />
                </svg>
              </span>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">Vacay<span className="text-mint">Pay</span></span>
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-300 lg:flex">
            <a href="#how" className="hover:text-mint">How it works</a>
            <a href="#features" className="hover:text-mint">Features</a>
            <a href="#calculator" className="hover:text-mint">Try Calculator</a>
            <a href="#use-cases" className="hover:text-mint">Use Cases</a>
            <a href="#faq" className="hover:text-mint">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={apk} className="hidden items-center gap-2 rounded-full bg-mint px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-mint/25 hover:bg-emerald-300 sm:inline-flex">
              {androidIcon}
              <span>Download APK</span>
            </a>
            <button type="button" aria-label="Toggle navigation menu" aria-expanded={menu} onClick={() => setMenu((open) => !open)} className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-200 hover:text-mint lg:hidden">
              {menu ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </nav>
        <div className={`${menu ? "" : "hidden"} glass-strong mx-auto mt-3 max-w-7xl rounded-3xl border border-white/10 p-5 shadow-2xl lg:hidden`}>
          <div className="flex flex-col gap-3 text-base font-medium text-slate-200">
            {[
              ["#how", "How it works"],
              ["#features", "Features"],
              ["#calculator", "Try Calculator"],
              ["#use-cases", "Use Cases"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenu(false)} className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-mint">{label}</a>
            ))}
            <a href={apk} className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-3 font-bold text-obsidian shadow-lg shadow-mint/20">
              {androidIcon} Download for Android (APK)
            </a>
          </div>
        </div>
      </header>

      <main className="pt-28 sm:pt-36">
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="reveal space-y-7 lg:col-span-7">
              <div className="glass inline-flex items-center gap-2.5 rounded-full border border-mint/25 px-4 py-2 text-xs font-medium text-mint sm:text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mint" />
                </span>
                For the group chat that never settles up
              </div>
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Split the trip.<br /><span className="text-gradient">Keep the peace.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                VacayPay is the bill book for people who travel together. Create a group, add the expense, and see who owes whom — zero spreadsheets, zero awkward reminders.
              </p>
              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
                <a href={apk} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-mint to-emerald-400 px-7 py-4 text-base font-bold text-obsidian shadow-[0_0_35px_rgba(34,245,158,0.3)]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-11.046 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm11.405-6.02 1.9-3.29a.4.4 0 1 0-.693-.4l-1.924 3.332A11.83 11.83 0 0 0 12 7.8c-1.85 0-3.59.42-5.165 1.163L4.91 5.63a.4.4 0 1 0-.693.4l1.9 3.29A10.97 10.97 0 0 0 1 18.25h22a10.97 10.97 0 0 0-5.118-8.929z" /></svg>
                  Download for Android — v1.0 APK
                </a>
                <a href="#calculator" className="glass inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white">
                  Try Live Split
                  <svg className="h-4 w-4 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Check className="text-mint" /> Direct APK · Free forever</span>
                <span className="inline-flex items-center gap-1.5"><Check className="text-cyan-glow" /> Google & OTP Email Sign-In</span>
              </div>
            </div>

            <div className="reveal relative flex items-center justify-center py-6 lg:col-span-5">
              <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-gradient-to-tr from-mint/20 via-cyan-glow/15 to-violet-glow/25 blur-3xl" />
              <div className="glass-strong animate-float-slow absolute top-12 -left-6 z-20 hidden items-center gap-2.5 rounded-2xl border border-mint/25 px-4 py-2.5 shadow-xl sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-glow/30 bg-violet-glow/20 text-xs font-bold text-violet-300">R</span>
                <div className="text-xs"><p className="font-semibold text-white">Riya joined Goa Trip</p><p className="text-slate-400">Synced via email</p></div>
              </div>
              <div className="glass-strong animate-float-delayed absolute -right-4 bottom-16 z-20 hidden items-center gap-2.5 rounded-2xl border border-mint/30 px-4 py-2.5 shadow-xl sm:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint/20 text-mint"><Check /></span>
                <div className="text-xs"><p className="font-semibold text-white">Settled ₹450</p><p className="font-medium text-mint">All square ✓</p></div>
              </div>
              <div className="w-full max-w-[330px] rounded-[44px] bg-gradient-to-b from-white/20 via-white/5 to-white/10 p-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
                <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0C0E16]">
                  <div className="flex items-center justify-between px-6 pt-3.5 pb-2 text-[11px] font-medium text-slate-400">
                    <span>9:41</span>
                    <div className="h-5 w-20 rounded-full border border-white/10 bg-black" />
                    <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-mint/80" />5G</div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-mint uppercase">GOA, JUNE</p>
                        <h2 className="font-display mt-0.5 text-2xl font-bold text-white">Dinner</h2>
                      </div>
                      <div className="flex -space-x-2">
                        {[["A", "bg-mint text-obsidian"], ["R", "bg-violet-glow text-white"], ["K", "bg-cyan-glow text-obsidian"], ["M", "bg-slate-700 text-white"]].map(([letter, tone]) => (
                          <span key={letter} className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-2 ring-[#0C0E16] ${tone}`}>{letter}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 rounded-3xl border border-mint/25 bg-gradient-to-br from-emerald-500/20 via-cyan-glow/10 to-violet-glow/15 p-5">
                      <div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-300">Total Bill</span><span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-xs font-semibold text-mint">Equal Split</span></div>
                      <div className="font-display text-4xl font-bold tracking-tight text-white">₹1,800</div>
                      <div className="h-px bg-white/10" />
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Anuj paid</span><span className="font-semibold text-white">₹1,800</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Split 4 ways</span><span className="font-semibold text-white">₹450 / person</span></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div><p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Net Balance</p><p className="mt-0.5 text-sm font-medium text-slate-200">Someone owes you</p></div>
                      <span className="font-display text-xl font-bold text-mint">+₹1,350</span>
                    </div>
                    <button type="button" onClick={() => setSettled((on) => !on)} className={`flex w-full items-center justify-center rounded-2xl py-3 text-xs font-semibold ${settled ? "bg-mint text-obsidian" : "bg-white/10 text-white"}`}>
                      {settled ? "All 3 friends marked settled! 🎉" : "Tap to preview instant settle ✓"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-6 text-center sm:p-8 lg:grid-cols-4 lg:text-left">
            <Stat tone="mint" title="0% Awkwardness" body="Clear math, zero drama" />
            <Stat tone="cyan" title="3 Taps to Split" body="Faster than texting the bill" />
            <Stat tone="violet" title="Instant Email Sync" body="Shared live across devices" />
            <Stat tone="mint" title="100% Free Android App" body="No paywalls or hidden fees" />
          </div>
        </section>

        <section id="calculator" className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">Interactive Sandbox</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Try it before the trip.</h2>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">Punch in a real bill below and see how VacayPay calculates shares and running balances in real time.</p>
          </div>
          <div className="glass-strong grid grid-cols-1 items-center gap-8 rounded-[32px] p-6 shadow-2xl sm:p-10 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-slate-400">Quick fill:</span>
                {[
                  ["Goa Dinner (₹1,800)", "Goa Beach Dinner", "1800", "Anuj", 4],
                  ["Villa Stay (₹14,400)", "Airbnb Villa Stay", "14400", "Riya", 6],
                  ["Cab Ride (₹960)", "Airport Cab", "960", "Kabir", 3],
                ].map(([label, nextTitle, nextAmount, nextPayer, nextPeople]) => (
                  <button key={String(label)} type="button" onClick={() => { setTitle(String(nextTitle)); setAmount(String(nextAmount)); setPayer(String(nextPayer)); setPeople(Number(nextPeople)); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-mint/15 hover:text-mint">
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Expense Title
                  <input value={title} maxLength={40} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-obsidian/80 px-4 py-3.5 text-base font-normal text-white normal-case focus:border-mint focus:ring-1 focus:ring-mint focus:outline-none" />
                </label>
                <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Total Amount (₹)
                  <span className="relative mt-2 block">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-mint">₹</span>
                    <input type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-obsidian/80 py-3.5 pr-4 pl-9 font-semibold text-white normal-case focus:border-mint focus:ring-1 focus:ring-mint focus:outline-none" />
                  </span>
                </label>
                <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Who Paid?
                  <input value={payer} maxLength={24} onChange={(event) => setPayer(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-obsidian/80 px-4 py-3.5 text-base font-normal text-white normal-case focus:border-mint focus:ring-1 focus:ring-mint focus:outline-none" />
                </label>
              </div>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-obsidian/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Split Between</span>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Decrease people" onClick={() => setPeople((count) => Math.max(2, count - 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-bold hover:bg-mint hover:text-obsidian">−</button>
                    <span className="font-display min-w-[4.5rem] text-center text-lg font-bold text-white">{people} people</span>
                    <button type="button" aria-label="Increase people" onClick={() => setPeople((count) => Math.min(12, count + 1))} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-bold hover:bg-mint hover:text-obsidian">+</button>
                  </div>
                </div>
                <input className="split-range w-full" type="range" min={2} max={12} value={people} onChange={(event) => setPeople(Number(event.target.value))} />
                <div className="flex justify-between text-[11px] font-medium text-slate-500"><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span><span>12</span></div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative space-y-6 overflow-hidden rounded-3xl border border-mint/30 bg-gradient-to-br from-[#122620] via-[#101827] to-[#1C1330] p-6 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-mint uppercase">Live Trip Card</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_10px_#22F59E]" />
                </div>
                <div>
                  <h3 className="font-display truncate text-2xl font-bold text-white sm:text-3xl">{split.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">Divided equally across the group</p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-400"><span className="font-medium text-white">{split.who}</span> paid</span><span className="font-semibold text-white">{inr(split.total)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Split {split.count} ways</span><span className="font-semibold text-cyan-glow">{inr(split.each)} each</span></div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-mint/30 bg-mint/15 p-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-mint uppercase">Running Balance</p>
                    <p className="mt-0.5 text-sm font-medium text-white">Someone owes <span className="font-bold">{split.who}</span></p>
                  </div>
                  <span className="font-display text-2xl font-bold text-mint sm:text-3xl">{inr(split.owed)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">How It Works</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Three taps, then the beach.</h2>
            </div>
            <p className="max-w-md text-base text-slate-400">No onboarding mazes or bank-linking headaches. Just your email, your crew, and the bill.</p>
          </div>
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            <div aria-hidden="true" className="absolute top-14 right-16 left-16 -z-10 hidden h-px bg-gradient-to-r from-mint/40 via-cyan-glow/40 to-violet-glow/40 md:block" />
            <Step n="01" tone="mint" title="Sign in with email" body="A one-time code, or Google. The same address is how friends find you and pull you straight into trips." />
            <Step n="02" tone="cyan" title="Open a group" body="Name the trip and add people by email. They see the group and every expense the moment they sign in." />
            <Step n="03" tone="violet" title="Split the bill" body="Say who paid. VacayPay divides it equally and keeps the running balance updated automatically." />
          </div>
        </section>

        <section id="features" className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">Built for Real Trips</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Everything you need. Nothing you don’t.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <article className="glass relative overflow-hidden rounded-[28px] p-7 sm:p-8 md:col-span-7">
              <span className="text-xs font-bold tracking-[0.18em] text-mint uppercase">Groups</span>
              <h3 className="font-display mt-3 text-3xl font-bold text-white">One trip, one tab</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-slate-400">Goa, a shared flat, a Friday dinner. Everyone in the group shares the exact same live ledger — no conflicting notes apps or lost screenshots.</p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <Mini label="Goa June" value="₹24,600" />
                <Mini label="Flat 402" value="₹11,200" />
                <Mini label="Active" value="Live Sync" mint />
              </div>
            </article>
            <article className="glass rounded-[28px] p-7 sm:p-8 md:col-span-5">
              <span className="text-xs font-bold tracking-[0.18em] text-cyan-glow uppercase">People</span>
              <h3 className="font-display mt-3 text-3xl font-bold text-white">Invite by email</h3>
              <p className="mt-3 leading-relaxed text-slate-400">They get a note, then the group is already waiting under their own login. No invite codes to fumble with at the restaurant table.</p>
              <div className="mt-7 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-obsidian/70 p-3.5">
                <span className="truncate text-xs text-slate-300">riya.sharma@gmail.com</span>
                <span className="shrink-0 rounded-full bg-cyan-glow/15 px-2.5 py-1 text-[11px] font-bold text-cyan-glow">Added ✓</span>
              </div>
            </article>
            <article className="glass rounded-[28px] p-7 sm:p-8 md:col-span-5">
              <span className="text-xs font-bold tracking-[0.18em] text-violet-300 uppercase">Balances</span>
              <h3 className="font-display mt-3 text-3xl font-bold text-white">Someone owes you</h3>
              <p className="mt-3 leading-relaxed text-slate-400">Or you owe them. VacayPay boils down dozens of receipts into the single net number that actually matters at the end of the night.</p>
              <div className="mt-7 flex items-center justify-between rounded-2xl border border-mint/25 bg-mint/10 px-4 py-3.5">
                <span className="text-xs font-medium text-slate-200">Your net position</span>
                <span className="font-display text-xl font-bold text-mint">+₹1,350</span>
              </div>
            </article>
            <article className="glass rounded-[28px] p-7 sm:p-8 md:col-span-7">
              <span className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">Zero Clutter</span>
              <h3 className="font-display mt-3 text-3xl font-bold text-white">Instant clarity on patchy beach Wi-Fi</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-slate-400">Designed for speed during late-night dinners, mountain road trips, and low-signal coastal shacks. Open, log who paid, lock your phone, and get back to the moment.</p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {["⚡ Lightweight Android build", "🌙 Clean dark-ready UI", "🔒 No bank access needed"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200">{item}</span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="use-cases" className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">Use Cases</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Built for every kind of getaway.</h2>
          </div>
          <div className="mb-10 flex flex-wrap justify-center gap-2.5" role="tablist">
            {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
              <button key={key} type="button" role="tab" aria-selected={scene === key} onClick={() => setScene(key)} className={scene === key ? "rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-mint/20" : "glass rounded-full px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white"}>
                {scenarios[key].label}
              </button>
            ))}
          </div>
          <div className="glass-strong grid grid-cols-1 items-center gap-8 rounded-[32px] p-6 sm:p-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <span className="inline-block text-xs font-bold tracking-[0.18em] text-mint uppercase">{active.badge}</span>
              <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">{active.heading}</h3>
              <p className="text-base leading-relaxed text-slate-300">{active.desc}</p>
              <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium text-mint"><span className="h-2 w-2 rounded-full bg-mint" /> Auto-equal splits</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-cyan-glow"><span className="h-2 w-2 rounded-full bg-cyan-glow" /> Real-time net balance</span>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="space-y-3.5 rounded-3xl border border-white/10 bg-obsidian/80 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-display font-bold text-white">{active.ledgerTitle}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">{active.ledgerTotal}</span>
                </div>
                <div className="space-y-3 text-sm">
                  {active.rows.map(([item, meta, value]) => (
                    <div key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                      <div><p className="font-medium text-white">{item}</p><p className="mt-0.5 text-xs text-slate-400">{meta}</p></div>
                      <span className="font-display shrink-0 font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{active.summaryLabel}</span>
                  <span className="font-display text-lg font-bold text-mint">{active.summaryVal}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">Group Chat Vibes</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Finally, a Goa plan that settled up.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Quote text="For the first time in 5 years, our Goa trip didn’t end with a 47-message WhatsApp debate over who paid for the scooter fuel. Settled everything before boarding." initials="RS" name="Rohan Sen" meta="6-person Goa trip" tone="mint" />
            <Quote text="Zero bloat. I added my flatmates by email, dropped in the Wi-Fi and grocery bills, and everyone saw their exact share instantly. Cleanest splitter I’ve used." initials="MK" name="Meera Kulkarni" meta="Bengaluru shared flat" tone="cyan" />
            <Quote text="Manali homestays, Maggi stops, and cabs — we logged 19 bills on patchy mountain network. One look at the final balance and everyone UPI’d in two minutes." initials="AV" name="Arjun Verma" meta="Manali road trip" tone="violet" />
          </div>
        </section>

        <section id="faq" className="reveal mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-mint uppercase">FAQ</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Quick answers.</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(([question, answer], index) => (
              <div key={question} className="faq-item glass overflow-hidden rounded-2xl" data-open={faq === index ? "true" : "false"}>
                <button type="button" onClick={() => setFaq((current) => (current === index ? -1 : index))} className="font-display flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-semibold text-white hover:text-mint">
                  <span>{question}</span>
                  <svg className="faq-chevron h-5 w-5 shrink-0 text-slate-400 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="faq-content"><div className="overflow-hidden"><p className="px-6 pb-5 text-sm leading-relaxed text-slate-400 sm:text-base">{answer}</p></div></div>
              </div>
            ))}
          </div>
        </section>

        <section id="download" className="reveal mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] border border-mint/25 bg-gradient-to-br from-[#0F241D] via-[#101322] to-[#1D1233] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-14 lg:p-16">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-mint/20 blur-[100px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-glow/20 blur-[100px]" />
            <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-3.5 py-1.5 text-xs font-bold tracking-[0.2em] text-mint uppercase">Android Build</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300">🍎 iOS Coming Soon</span>
                </div>
                <h2 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Put VacayPay on your phone.</h2>
                <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Install the Android build, then sign in with the same email you use in the group. Your trips and balances sync the second you open the app.</p>
                <a href={apk} className="inline-flex items-center gap-3.5 rounded-2xl bg-mint px-7 py-4 text-base font-bold text-obsidian shadow-[0_0_40px_rgba(34,245,158,0.35)] sm:text-lg">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-11.046 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm11.405-6.02 1.9-3.29a.4.4 0 1 0-.693-.4l-1.924 3.332A11.83 11.83 0 0 0 12 7.8c-1.85 0-3.59.42-5.165 1.163L4.91 5.63a.4.4 0 1 0-.693.4l1.9 3.29A10.97 10.97 0 0 0 1 18.25h22a10.97 10.97 0 0 0-5.118-8.929z" /></svg>
                  Download vacaypay.apk
                  <span className="rounded-lg bg-obsidian/15 px-2.5 py-1 font-mono text-xs font-bold">v1.0</span>
                </a>
              </div>
              <div className="lg:col-span-5">
                <div className="glass-strong space-y-4 rounded-3xl p-6">
                  <p className="text-xs font-bold tracking-[0.18em] text-cyan-glow uppercase">Quick 3-Step Install</p>
                  <ol className="space-y-3.5 text-sm text-slate-300">
                    <li className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/15 text-xs font-bold text-mint">1</span><span>Tap <strong className="text-white">Download vacaypay.apk</strong> to save the installer to your Android device.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-glow/15 text-xs font-bold text-cyan-glow">2</span><span>Open the downloaded file and allow <strong className="text-white">Install unknown apps</strong> if prompted.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-glow/20 text-xs font-bold text-violet-300">3</span><span>Sign in with your email or Google and start splitting right away.</span></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display flex h-8 w-8 items-center justify-center rounded-lg border border-mint/30 bg-mint/15 font-bold text-mint">V</span>
            <div>
              <span className="font-display font-bold tracking-tight text-white">Vacay<span className="text-mint">Pay</span></span>
              <p className="text-xs text-slate-500">Split the trip. Keep the peace.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <a href="#how" className="hover:text-mint">How it works</a>
            <a href="#features" className="hover:text-mint">Features</a>
            <a href="#calculator" className="hover:text-mint">Calculator</a>
            <a href="#use-cases" className="hover:text-mint">Use Cases</a>
            <a href="#faq" className="hover:text-mint">FAQ</a>
            <a href="#download" className="font-medium text-mint">Download APK</a>
          </div>
          <p className="text-xs text-slate-500">© 2026 VacayPay. Built for travelers.</p>
        </div>
      </footer>
    </div>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Stat({ tone, title, body }: { tone: "mint" | "cyan" | "violet"; title: string; body: string }) {
  const toneClass = tone === "mint" ? "bg-mint/15 border-mint/25 text-mint" : tone === "cyan" ? "bg-cyan-glow/15 border-cyan-glow/25 text-cyan-glow" : "bg-violet-glow/15 border-violet-glow/25 text-violet-400";
  return (
    <div className="flex flex-col items-center gap-3.5 lg:flex-row">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
        <Check />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-white">{title}</p>
        <p className="text-xs text-slate-400">{body}</p>
      </div>
    </div>
  );
}

function Step({ n, tone, title, body }: { n: string; tone: "mint" | "cyan" | "violet"; title: string; body: string }) {
  const pill = tone === "mint" ? "bg-mint/15 border-mint/30 text-mint" : tone === "cyan" ? "bg-cyan-glow/15 border-cyan-glow/30 text-cyan-glow" : "bg-violet-glow/15 border-violet-glow/30 text-violet-300";
  return (
    <article className="glass rounded-3xl p-7">
      <div className="mb-6 flex items-center justify-between">
        <span className={`font-display inline-flex rounded-full border px-3.5 py-1.5 text-sm font-bold ${pill}`}>{n}</span>
      </div>
      <h3 className="font-display mb-3 text-2xl font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{body}</p>
    </article>
  );
}

function Mini({ label, value, mint = false }: { label: string; value: string; mint?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${mint ? "border-mint/25 bg-mint/10" : "border-white/10 bg-white/[0.04]"}`}>
      <p className={`text-xs ${mint ? "text-mint" : "text-slate-400"}`}>{label}</p>
      <p className="font-display mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function Quote({ text, initials, name, meta, tone }: { text: string; initials: string; name: string; meta: string; tone: "mint" | "cyan" | "violet" }) {
  const avatar = tone === "mint" ? "bg-mint/20 border-mint/40 text-mint" : tone === "cyan" ? "bg-cyan-glow/20 border-cyan-glow/40 text-cyan-glow" : "bg-violet-glow/20 border-violet-glow/40 text-violet-300";
  return (
    <blockquote className="glass flex flex-col justify-between space-y-6 rounded-3xl p-7">
      <p className="text-base leading-relaxed text-slate-200">“{text}”</p>
      <footer className="flex items-center gap-3.5 border-t border-white/10 pt-2">
        <div className={`font-display flex h-10 w-10 items-center justify-center rounded-full border font-bold ${avatar}`}>{initials}</div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-400">{meta}</p>
        </div>
      </footer>
    </blockquote>
  );
}
