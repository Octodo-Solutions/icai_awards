import React, { useState, useEffect, useRef } from "react";
import {
  Shield, Upload, FileText, CheckCircle2, Clock, AlertCircle,
  LayoutDashboard, Users, Search, Bell, Mail, Download, Send,
  ChevronRight, ChevronLeft, LogIn, UserPlus, Eye, X, Check, Circle,
  MessageSquare, Lock, ArrowRight, Plus, Award,
  Building2, Phone, Pencil, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";

/* ============================================================================
   ICAI SUSTAINABILITY AWARDS — NOMINATION PORTAL · INTERACTIVE PROTOTYPE
   Design: humanist sans (Hanken Grotesk) + IBM Plex Mono · restrained green.
   Placeholder data · mirrors the Next.js + PostgreSQL target build.
   ========================================================================= */

// ---- Palette: cool, green-forward, minimal (no warm cream, no acid green) --
const C = {
  bg:       "#f5f7f2",   // soft cool off-white
  surface:  "#ffffff",
  panel:    "#eaefe4",   // faint green-grey band
  deep:     "#123528",   // the one dark band
  green:    "#1e4a37",   // primary evergreen
  greenDk:  "#173b2c",
  leaf:     "#548a63",   // living accent, used sparingly
  leafSoft: "#e6efe6",   // accent tint
  mist:     "#cddccf",
  ink:      "#182521",   // near-black warm green
  body:     "#4b564e",   // muted body text
  faint:    "#8a938a",   // captions
  line:     "#e4e9de",   // hairline
  honey:    "#b28a4c",   // rare warm accent (winners only)
  honeySoft:"#f0e7d4",
  // editorial additions (add-only; existing keys must not change)
  hairline: "#d8dfd2",              // visible editorial rule
  hairDark: "rgba(255,255,255,0.16)", // rules on the deep-green band
  inkSerif: "#10201a",              // deeper ink for serif headlines
};

const STATUS = {
  Draft:                    { c: "#7f887f", bg: "#eef0eb", label: "Draft" },
  Submitted:                { c: "#3d6f7e", bg: "#e7eff1", label: "Submitted" },
  "Under Review":           { c: "#977f3f", bg: "#f2ecda", label: "Under Review" },
  "Clarification Required": { c: "#9c5a48", bg: "#f1e4df", label: "Clarification Required" },
  "Final Submitted":        { c: "#3d7a54", bg: "#e6efe6", label: "Final Submitted" },
};

// Every nomination carries an `owner` (the member email that created it) so the
// member dashboard and the admin console can read from one shared list. A
// nomination may also carry a `clarification` thread once an admin raises one.
const SEED = [
  { id: "NOM-2026-0001", company: "Verdant Steel Ltd.", email: "esg@verdantsteel.in", owner: "esg@verdantsteel.in", listing: "NSE Listed", cap: "Large Cap", sector: "Manufacturing", category: "Large Cap · Manufacturing", status: "Under Review", submitted: "18 Jun 2026", updated: "3 days ago", pct: 100, docs: 5, contacts: { primary: { name: "R. Menon", desig: "Head of ESG", mobile: "98200 11223", email: "esg@verdantsteel.in" } } },
  { id: "NOM-2026-0002", company: "Aarna Financial Services", email: "compliance@aarnafs.com", owner: "compliance@aarnafs.com", listing: "BSE Listed", cap: "Mid Cap", sector: "Service", category: "Mid Cap · Service", status: "Final Submitted", submitted: "20 Jun 2026", updated: "5 days ago", pct: 100, docs: 6, contacts: { primary: { name: "S. Iyer", desig: "Company Secretary", mobile: "99300 44556", email: "compliance@aarnafs.com" } } },
  { id: "NOM-2026-0003", company: "Kaveri Renewables Pvt. Ltd.", email: "hello@kaveriren.in", owner: "member@kaveriren.in", listing: "Unlisted", cap: "Voluntary", sector: "Manufacturing", category: "Voluntary · Manufacturing", status: "Clarification Required", submitted: "21 Jun 2026", updated: "2 days ago", pct: 100, docs: 3, contacts: { primary: { name: "A. Kulkarni", desig: "Sustainability Lead", mobile: "90040 77889", email: "hello@kaveriren.in" } }, clarification: { message: "The uploaded Chairman's message is not legible. Please re-upload a clear PDF.", at: "2 days ago", response: null } },
  { id: "NOM-2026-0004", company: "Meridian Logistics Corp.", email: "sustain@meridianlog.com", owner: "sustain@meridianlog.com", listing: "NSE Listed", cap: "Small Cap", sector: "Service", category: "Small Cap · Service", status: "Submitted", submitted: "22 Jun 2026", updated: "1 day ago", pct: 100, docs: 4, contacts: { primary: { name: "T. Rao", desig: "CFO", mobile: "98450 33221", email: "sustain@meridianlog.com" } } },
  { id: "NOM-2026-0005", company: "Indus Agro Foods Ltd.", email: "reports@indusagro.co.in", owner: "reports@indusagro.co.in", listing: "Listed Outside India", cap: "Mid Cap", sector: "Manufacturing", category: "Mid Cap · Manufacturing", status: "Draft", submitted: "—", updated: "6 hours ago", pct: 40, docs: 2, contacts: {} },
  { id: "NOM-2026-0011", company: "Kaveri Renewables — FY24 entry", email: "hello@kaveriren.in", owner: "member@kaveriren.in", listing: "Unlisted", cap: "Voluntary", sector: "Manufacturing", category: "Voluntary · Manufacturing", status: "Draft", submitted: "—", updated: "1 hour ago", pct: 60, docs: 2, contacts: {} },
];

const SEED_CATEGORIES = [
  { id: "cat-1", name: "Large Cap", desc: "Large-cap listed enterprises classified under prevailing SEBI norms.", sector: "All", active: true },
  { id: "cat-2", name: "Mid Cap", desc: "Mid-sized listed companies with maturing ESG disclosure.", sector: "All", active: true },
  { id: "cat-3", name: "Small Cap", desc: "Emerging companies demonstrating sustainability leadership.", sector: "All", active: true },
  { id: "cat-4", name: "Voluntary", desc: "Unlisted entities voluntarily preparing a BRSR.", sector: "All", active: true },
];

const DEMO = {
  member: { email: "member@kaveriren.in", password: "demo1234", name: "Kaveri Renewables" },
  admin:  { email: "admin@icai.in",       password: "admin1234", name: "SRSB Admin" },
};

// ---- Font loader (Fraunces display serif + Hanken Grotesk + IBM Plex Mono) --
function useFonts() {
  useEffect(() => {
    if (document.getElementById("ff-portal")) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect"; pre.href = "https://fonts.gstatic.com"; pre.crossOrigin = "";
    document.head.appendChild(pre);
    const link = document.createElement("link");
    link.id = "ff-portal"; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      :root{--sans:'Hanken Grotesk',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;--mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;--serif:'Fraunces',Georgia,'Times New Roman',serif}
      .ff-sans{font-family:var(--sans)}
      .ff-mono{font-family:var(--mono)}
      .ff-serif{font-family:var(--serif)}
      .ff-display{font-family:var(--serif);font-weight:500;letter-spacing:-.01em;font-variation-settings:'opsz' 40}
      .lbl{font-family:var(--mono);font-weight:500;letter-spacing:.08em;text-transform:uppercase}
    `;
    document.head.appendChild(style);
  }, []);
}

// ---- Motion hooks (CSS-only reveals + count-up; both respect reduced motion) --
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${delay ? `reveal-d${delay}` : ""} ${className}`}>{children}</div>;
}

function useCountUp(target, duration = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf; const t0 = performance.now();
    const tick = (t) => {
      if (reduce || !target) { setN(target); return; }
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

// ---- Primitives ------------------------------------------------------------
function Pill({ status }) {
  const s = STATUS[status] || STATUS.Draft;
  return (
    <span className="ff-mono inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: s.c, letterSpacing: ".02em" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} /> {s.label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-[3px] font-medium transition-all disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px";
  const sizes = { sm: "px-3.5 py-1.5 text-[13px]", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-sm" };
  const styles = {
    primary: { background: C.green, color: "#fff" },
    soft:    { background: C.leafSoft, color: C.green },
    outline: { border: `1px solid ${C.hairline}`, color: C.green, background: C.surface },
    ghost:   { color: C.green, background: "transparent" },
    light:   { background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" },
    cream:   { background: "#fff", color: C.green },
    danger:  { background: STATUS["Clarification Required"].c, color: "#fff" },
  };
  const hover = (variant === "primary" || variant === "danger") ? "hover:brightness-[1.12]" : (variant === "soft" || variant === "cream") ? "hover:brightness-[0.95]" : "hover:bg-black/[0.03]";
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${hover} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

function Card({ children, className = "", pad = true, hover = false }) {
  return (
    <div className={`rounded-lg bg-white ${pad ? "p-5" : ""} ${hover ? "transition-colors hover:border-[#9db4a0]" : ""} ${className}`}
      style={{ border: `1px solid ${C.hairline}` }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, light }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-px w-5" style={{ background: C.leaf }} />
      <span className="lbl text-[11px]" style={{ color: light ? C.mist : C.leaf }}>{children}</span>
    </div>
  );
}

// ---- Editorial primitives ---------------------------------------------------
// SectionHead: hairline top rule → mono "num — meta" row → serif title.
function SectionHead({ num, title, meta, light }) {
  const rule = light ? C.hairDark : C.hairline;
  return (
    <div style={{ borderTop: `1px solid ${rule}` }} className="pt-4">
      <span className="lbl text-[11px]" style={{ color: C.leaf }}>{num} — {meta}</span>
      <h2 className="ff-display mt-4 text-3xl sm:text-4xl" style={{ color: light ? "#fff" : C.inkSerif }}>{title}</h2>
    </div>
  );
}

// NumberedList: mono index + hairline-divided rows (replaces icon bullet lists).
function NumberedList({ items }) {
  return (
    <ul className="divide-y" style={{ borderColor: C.hairline }}>
      {items.map((x, i) => (
        <li key={x} className="flex gap-4 py-3 text-[15px]" style={{ color: C.body, borderColor: C.hairline }}>
          <span className="ff-mono w-6 flex-shrink-0 text-[11px] leading-6" style={{ color: C.leaf }}>{String(i + 1).padStart(2, "0")}</span>
          {x}
        </li>
      ))}
    </ul>
  );
}

// PageTitle: shared header for console views (eyebrow + serif title + rule).
function PageTitle({ eyebrow, title, sub, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="ff-display mt-3 text-2xl" style={{ color: C.inkSerif }}>{title}</h2>
        {sub && <p className="text-sm" style={{ color: C.faint }}>{sub}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// StatTab: member-dashboard stat block with count-up (hoisted — calls a hook).
function StatTab({ active, onClick, label, value, count }) {
  const n = useCountUp(count ?? 0);
  return (
    <button onClick={onClick} className="py-3 pl-4 text-left transition-colors"
      style={{ borderLeft: `2px solid ${active ? C.leaf : C.hairline}`, background: active ? "#fff" : "transparent" }}>
      <div className="lbl text-[10px]" style={{ color: C.faint }}>{label}</div>
      <div className="ff-display mt-1 text-2xl" style={{ color: C.inkSerif }}>
        {count !== undefined ? `${n}${value}` : value}
      </div>
    </button>
  );
}

// StatCard: admin-dashboard stat with count-up serif value (hoisted — calls a hook).
function StatCard({ label, value }) {
  const n = useCountUp(value);
  return (
    <Card>
      <div className="lbl text-[10px]" style={{ color: C.faint }}>{label}</div>
      <div className="ff-display mt-2 pt-2 text-4xl" style={{ color: C.inkSerif, borderTop: `1px solid ${C.hairline}` }}>{n}</div>
    </Card>
  );
}

// AwardMark: the 2026 award emblem — SVG laurel roundel, light/dark variants.
function AwardMark({ light, size = 200, className = "" }) {
  const ink = light ? "#ffffff" : C.green;
  const soft = light ? "rgba(255,255,255,0.6)" : C.leaf;
  const faint = light ? "rgba(255,255,255,0.28)" : C.mist;
  const leaves = [];
  for (let s = -1; s <= 1; s += 2) {          // two laurel branches, mirrored
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + s * (0.3 + i * 0.155); // from bottom centre, curling up each side
      const x = 100 + 80 * Math.cos(a);
      const y = 100 + 80 * Math.sin(a);
      const deg = (a * 180) / Math.PI + 90;
      leaves.push(<ellipse key={`${s}-${i}`} cx={x} cy={y} rx="2.7" ry="7.6" fill="none" stroke={soft} strokeWidth="1" transform={`rotate(${deg} ${x} ${y})`} />);
    }
  }
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="ICAI Sustainability Awards 2026 emblem">
      <circle cx="100" cy="100" r="97" stroke={faint} strokeWidth="1" fill="none" />
      <circle cx="100" cy="100" r="90" stroke={soft} strokeWidth="1" fill="none" />
      {leaves}
      <circle cx="100" cy="176" r="1.8" fill={soft} />
      <path d="M100 24 l4.5 7 -4.5 7 -4.5 -7 z" fill={soft} />
      <text x="100" y="64" textAnchor="middle" style={{ font: "500 9px var(--mono)", letterSpacing: "0.2em", fill: soft }}>SUSTAINABILITY</text>
      <text x="100" y="78" textAnchor="middle" style={{ font: "500 9px var(--mono)", letterSpacing: "0.2em", fill: soft }}>AWARDS</text>
      <text x="100" y="126" textAnchor="middle" style={{ font: "500 46px var(--serif)", fill: ink }}>2026</text>
      <line x1="82" y1="140" x2="118" y2="140" stroke={faint} strokeWidth="1" />
      <text x="100" y="156" textAnchor="middle" style={{ font: "500 8.5px var(--mono)", letterSpacing: "0.24em", fill: soft }}>SRSB · ICAI</text>
    </svg>
  );
}

// ChoiceChip: rectangular selectable chip (hoisted out of NominationWizard).
function ChoiceChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="rounded-[3px] px-4 py-2 text-[13px] font-medium transition"
      style={{ border: `1px solid ${active ? C.leaf : C.hairline}`, background: active ? C.leafSoft : "#fff", color: active ? C.green : C.body }}>
      {children}
    </button>
  );
}

function Field({ label, children, req, hint }) {
  return (
    <label className="block">
      <span className="lbl mb-1.5 flex items-center gap-1 text-[10px]" style={{ color: C.faint }}>
        {label} {req && <span style={{ color: STATUS["Clarification Required"].c }}>*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs" style={{ color: C.faint }}>{hint}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-[4px] px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#cddccf] focus:border-[#548a63]";
const inputStyle = { border: `1px solid ${C.hairline}`, color: C.ink, background: C.surface };

function SectionLabel({ children }) {
  return <h3 className="lbl mb-3 text-[11px]" style={{ color: C.faint }}>{children}</h3>;
}

// ============================================================================
// PUBLIC WEBSITE
// ============================================================================
function Countdown({ light }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const target = new Date("2026-08-15T17:00:00");
    const tick = () => {
      const d = target - new Date();
      setT({
        d: Math.max(0, Math.floor(d / 86400000)),
        h: Math.max(0, Math.floor((d / 3600000) % 24)),
        m: Math.max(0, Math.floor((d / 60000) % 60)),
        s: Math.max(0, Math.floor((d / 1000) % 60)),
      });
    };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);
  const box = (v, l) => (
    <div className="flex flex-col items-center">
      <span className="ff-mono text-2xl font-medium tabular-nums sm:text-[26px]" style={{ color: light ? "#fff" : C.ink }}>{String(v ?? 0).padStart(2, "0")}</span>
      <span className="lbl mt-0.5 text-[9px]" style={{ color: light ? C.mist : C.faint }}>{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      {box(t.d, "Days")}<span style={{ color: C.mist }}>·</span>{box(t.h, "Hrs")}<span style={{ color: C.mist }}>·</span>{box(t.m, "Min")}<span style={{ color: C.mist }}>·</span>{box(t.s, "Sec")}
    </div>
  );
}

function PublicSite({ goLogin, categories }) {
  const cats = categories.filter((c) => c.active).map((c) => ({ t: c.name, d: c.desc }));
  const dates = [
    { d: "15 Jun 2026", e: "Nominations open" },
    { d: "15 Aug 2026", e: "Last date for nomination" },
    { d: "10 Sep 2026", e: "Screening & evaluation" },
    { d: "30 Sep 2026", e: "Awards ceremony, New Delhi" },
  ];
  const winners = [
    { y: "2025", n: "Everest Cement Ltd.", c: "Large Cap · Manufacturing" },
    { y: "2025", n: "BlueLotus Bank", c: "Mid Cap · Service" },
    { y: "2024", n: "Sahyadri Textiles", c: "Small Cap · Manufacturing" },
  ];
  const faqs = [
    ["Who can nominate?", "Any company preparing a BRSR or sustainability report may register and self-nominate within the applicable category."],
    ["Is there a nomination fee?", "No. Registration and nomination on the portal are free of cost."],
    ["What documents are mandatory?", "The BRSR, Annual Report and Chairman's message are mandatory. ESG and Integrated reports are optional."],
    ["Can I edit after submitting?", "You may edit a draft any time before final submission. After final submission, changes require an admin clarification request."],
  ];
  const eligibility = [
    "Registered as a company in India, or an entity listed outside India with Indian operations.",
    "Preparing a BRSR, sustainability, ESG or integrated report for the reporting year.",
    "Nomination filed by an authorised representative of the company.",
    "Unlisted entities may self-nominate under the Voluntary category.",
  ];
  const process = [
    { t: "Register", d: "Create a member account and verify your official email via OTP." },
    { t: "Complete the form", d: "Enter company details, classification and contact persons." },
    { t: "Upload documents", d: "Attach the mandatory BRSR, Annual Report and Chairman's message." },
    { t: "Declare & submit", d: "Accept the declaration and finally submit your nomination." },
    { t: "Track & respond", d: "Monitor status and answer any admin clarification from your dashboard." },
  ];
  const guidelines = [
    "Upload PDFs only, up to 10 MB per file.",
    "Ensure scanned documents are legible; illegible files draw a clarification request.",
    "Classification (listing, market cap, sector) determines your award category.",
    "Drafts auto-save — you can return and finish any time before the closing date.",
    "Final submission locks the nomination; further edits need an admin clarification.",
  ];
  return (
    <div style={{ background: C.bg, color: C.body }}>
      {/* announcement */}
      <div className="px-4 py-2 text-center" style={{ background: C.leafSoft }}>
        <span className="lbl text-[10px]" style={{ color: C.green }}>Nominations for the 2026 awards are open — closing 15 August</span>
      </div>

      {/* hero — full-bleed evergreen block, layered washes, ghost year */}
      <section className="relative overflow-hidden" style={{ background: C.deep }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(90% 85% at 82% -12%, rgba(84,138,99,0.42) 0%, rgba(84,138,99,0) 62%)` }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(70% 60% at -8% 110%, rgba(84,138,99,0.22) 0%, rgba(84,138,99,0) 55%)` }} />
        <div className="bg-grain-light pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-14 sm:pb-20">
          <div className="flex items-baseline justify-between gap-4 pb-4" style={{ borderBottom: `1px solid ${C.hairDark}` }}>
            <span className="lbl text-[10px]" style={{ color: C.leafSoft }}>Sustainability Reporting Standards Board · ICAI</span>
            <span className="lbl hidden text-[10px] sm:block" style={{ color: C.mist }}>Edition 04 · New Delhi</span>
          </div>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 className="ff-display mt-10 text-5xl leading-[1.04] text-white sm:text-[64px]">
                Recognising India's leaders in&nbsp;sustainability reporting.
              </h1>
              <p className="mt-7 max-w-xl border-t pt-5 text-[15px] leading-relaxed" style={{ color: C.mist, borderColor: C.hairDark }}>
                The ICAI Sustainability Awards honour organisations setting the standard in credible,
                transparent BRSR and ESG disclosure. Register your company and submit your nomination online.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Btn size="lg" variant="cream" onClick={goLogin}><UserPlus size={16} /> Register your company</Btn>
                <Btn size="lg" variant="light" onClick={goLogin}><LogIn size={16} /> Applicant login</Btn>
              </div>
            </div>
            <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:items-center lg:justify-between lg:gap-8">
              <AwardMark light size={236} className="mt-8" />
              <div className="w-full border-t pt-4" style={{ borderColor: C.hairDark }}>
                <span className="lbl text-[10px]" style={{ color: C.mist }}>Nominations close in</span>
                <div className="mt-3"><Countdown light /></div>
              </div>
            </div>
          </div>
          {/* countdown for small screens */}
          <div className="mt-12 border-t pt-4 lg:hidden" style={{ borderColor: C.hairDark }}>
            <span className="lbl text-[10px]" style={{ color: C.mist }}>Nominations close in</span>
            <div className="mt-3"><Countdown light /></div>
          </div>
        </div>
      </section>

      {/* credibility stats strip */}
      <section className="border-b bg-white" style={{ borderColor: C.hairline }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 sm:grid-cols-4">
          {[["Edition", "04th · 2026"], ["Award categories", `${cats.length} active`], ["Nominations close", "15 Aug 2026"], ["Nomination fee", "Nil · free of cost"]].map(([k, v], i) => (
            <div key={k} className={`py-6 ${i > 0 ? "sm:border-l sm:pl-6" : ""} ${i % 2 === 1 ? "pl-6 sm:pl-6" : ""}`} style={{ borderColor: C.hairline }}>
              <div className="lbl text-[9px]" style={{ color: C.faint }}>{k}</div>
              <div className="ff-display mt-1.5 text-xl" style={{ color: C.inkSerif }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 01 · about + objectives — asymmetric 5/7 */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionHead num="01" meta="The awards" title="Credible disclosure, recognised." />
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="ff-serif text-lg leading-relaxed" style={{ color: C.inkSerif }}>
                Instituted by the Sustainability Reporting Standards Board of ICAI, the awards evaluate the
                depth, credibility and assurance of an organisation's sustainability disclosures.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.body }}>
                A structured screening process assesses each nomination against category-specific benchmarks.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <span className="lbl text-[10px]" style={{ color: C.faint }}>Objectives</span>
              <div className="mt-3">
                <NumberedList items={["Promote high-quality, assured sustainability reporting",
                  "Recognise leadership across market-cap and sector categories",
                  "Encourage voluntary BRSR adoption by unlisted entities",
                  "Build a public repository of exemplary disclosure practices"]} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 02 · categories — white band, editorial table rows */}
      <section className="border-y bg-white" style={{ borderColor: C.hairline }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <SectionHead num="02" meta="Classification" title="Award categories" />
          </Reveal>
          <div className="mt-8 divide-y" style={{ borderColor: C.hairline }}>
            {cats.map((c, i) => (
              <Reveal key={c.t} delay={i % 3}>
                <div className="grid gap-2 py-6 sm:grid-cols-12 sm:items-baseline" style={{ borderColor: C.hairline }}>
                  <span className="ff-mono text-[11px] sm:col-span-1" style={{ color: C.leaf }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="ff-display text-2xl sm:col-span-3" style={{ color: C.inkSerif }}>{c.t}</h3>
                  <p className="text-sm leading-relaxed sm:col-span-6" style={{ color: C.body }}>{c.d}</p>
                  <span className="lbl text-[10px] sm:col-span-2 sm:text-right" style={{ color: C.faint }}>All sectors</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03 · eligibility + guidelines — 5/7 split, numbered lists */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionHead num="03" meta="Before you apply" title="Eligibility & guidelines" />
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="lbl text-[10px]" style={{ color: C.faint }}>Eligibility criteria</span>
              <div className="mt-3"><NumberedList items={eligibility} /></div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <span className="lbl text-[10px]" style={{ color: C.faint }}>Submission guidelines</span>
              <div className="mt-3"><NumberedList items={guidelines} /></div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 04 · nomination process — white band, vertical editorial timeline */}
      <section className="border-t bg-white" style={{ borderColor: C.hairline }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <SectionHead num="04" meta="Five steps" title="How to nominate" />
          </Reveal>
          <div className="mt-8 max-w-3xl">
            {process.map((s, i) => (
              <Reveal key={s.t} delay={i % 3}>
                <div className="grid grid-cols-12 items-start gap-4 border-t py-6" style={{ borderColor: C.hairline }}>
                  <span className="ff-serif col-span-2 text-5xl leading-none" style={{ color: C.mist }}>{i + 1}</span>
                  <div className="col-span-10">
                    <h3 className="ff-display text-xl" style={{ color: C.inkSerif }}>{s.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.body }}>{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 · the one dark band */}
      <section className="relative overflow-hidden" style={{ background: C.deep }}>
        <span className="num-ghost num-ghost-light pointer-events-none absolute -right-6 bottom-4 hidden text-[9rem] xl:block">15 AUG</span>
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <SectionHead light num="05" meta="Timeline" title="Important dates" />
          <div className="mt-10 grid gap-y-8 sm:grid-cols-4 sm:gap-x-6">
            {dates.map((x, i) => (
              <div key={x.e} className="pl-5" style={{ borderLeft: `1px solid ${C.hairDark}` }}>
                <span className="ff-mono text-[11px]" style={{ color: C.leaf }}>0{i + 1}</span>
                <div className="ff-display mt-2 text-2xl text-white">{x.d}</div>
                <div className="mt-1 text-sm" style={{ color: C.mist }}>{x.e}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 · winners — the one warm (honey) touch */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionHead num="06" meta="Honour roll" title="Previous winners" />
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {winners.map((w, i) => (
            <Reveal key={w.n} delay={i % 3}>
              <Card className="h-full" hover>
                <div style={{ borderTop: `2px solid ${C.honey}`, margin: "-20px -20px 0", padding: "18px 20px 0" }}>
                  <div className="flex items-baseline justify-between">
                    <span className="ff-serif text-3xl" style={{ color: C.honey }}>&rsquo;{w.y.slice(2)}</span>
                    {i === 0 && <Award size={17} style={{ color: C.honey }} />}
                  </div>
                  <div className="ff-display mt-3 text-lg" style={{ color: C.inkSerif }}>{w.n}</div>
                  <div className="ff-mono mt-1 pb-1 text-[11px]" style={{ color: C.faint }}>{w.c}</div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 07 · FAQ + downloads + contact — white band */}
      <section className="border-y bg-white" style={{ borderColor: C.hairline }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionHead num="07" meta="Reference" title="Frequently asked" />
        </Reveal>
        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="divide-y border-t" style={{ borderColor: C.hairline }}>
              {faqs.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <span className="lbl text-[10px]" style={{ color: C.faint }}>Downloads</span>
              <div className="mt-3 divide-y border-t" style={{ borderColor: C.hairline }}>
                {["Nomination guidelines", "Category & sector definitions", "BRSR format reference"].map((d) => (
                  <a key={d} href="#" className="link-edit ff-mono flex items-center justify-between py-3 text-[13px]" style={{ color: C.green, borderColor: C.hairline }}>
                    {d} <span aria-hidden style={{ color: C.leaf }}>&darr;</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <span className="lbl text-[10px]" style={{ color: C.faint }}>Contact</span>
              <div className="mt-3 space-y-3 border-t pt-4 text-sm" style={{ color: C.body, borderColor: C.hairline }}>
                <div className="flex items-center gap-2.5"><Mail size={15} style={{ color: C.leaf }} /> Sustainability@icai.in</div>
                <div className="flex items-center gap-2.5"><Phone size={15} style={{ color: C.leaf }} /> 011-30110474</div>
                <div className="flex items-start gap-2.5"><Building2 size={15} style={{ color: C.leaf, marginTop: 2 }} /> ICAI Bhawan, Indraprastha Marg, New Delhi – 110002</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* footer rule */}
      <footer className="mx-auto max-w-6xl px-6 py-10">
        <div className="border-t pt-5 text-center" style={{ borderColor: C.hairline }}>
          <span className="lbl text-[9px]" style={{ color: C.faint }}>© 2026 The Institute of Chartered Accountants of India · SRSB</span>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [o, setO] = useState(false);
  return (
    <div>
      <button onClick={() => setO(!o)} className="ff-display flex w-full items-center justify-between gap-4 py-4 text-left text-[17px]" style={{ color: C.inkSerif }}>
        {q} <span className="ff-mono flex-shrink-0 text-sm" style={{ color: C.leaf }}>{o ? "–" : "+"}</span>
      </button>
      {o && <p className="pb-4 pr-8 text-sm leading-relaxed" style={{ color: C.body }}>{a}</p>}
    </div>
  );
}

// ============================================================================
// LOGIN — gate for protected modules. Roles: Member (applicant) + Admin.
// ============================================================================
function LoginScreen({ onLogin, onExit }) {
  const [role, setRole] = useState("member");
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState(DEMO.member.email);
  const [password, setPassword] = useState(DEMO.member.password);
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sentReset, setSentReset] = useState(false);
  const refs = useRef([]);

  const pickRole = (r) => { setRole(r); setStep("login"); setErr(""); setEmail(DEMO[r].email); setPassword(DEMO[r].password); };
  const handleOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const attempt = () => {
    const d = DEMO[role];
    // credentials OK → step up to email OTP verification (Module B). Demo: any 6 digits pass.
    if (email.trim().toLowerCase() === d.email && password === d.password) { setErr(""); setOtp(["", "", "", "", "", ""]); setStep("otp"); }
    else setErr("Email or password doesn't match the demo credentials for this role.");
  };

  const points = role === "admin"
    ? ["Review all nominations", "Raise clarifications", "Bulk email & SMS", "Reports & analytics"]
    : ["Email-verified account", "Auto-saved drafts", "Real-time status tracking", "Secure document vault"];

  return (
    // fixed viewport-based height so the brand panel doesn't resize when the
    // form column's content changes (member vs admin, login vs otp steps)
    <div className="grid lg:grid-cols-2" style={{ background: C.bg, minHeight: "calc(100vh - 61px)" }}>
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex" style={{ background: C.deep }}>
        <AwardMark light size={150} className="pointer-events-none absolute bottom-8 right-8 opacity-90" />
        <div className="relative flex items-center gap-2.5 text-white">
          <div className="grid h-9 w-9 place-items-center rounded-[4px] bg-white p-1">
            <img src="/logo-icai1.png" alt="ICAI" className="h-full w-full object-contain" />
          </div>
          <span className="ff-display text-lg">ICAI Sustainability Awards</span>
        </div>
        <div className="relative">
          <div className="mb-6 h-px w-full" style={{ background: C.hairDark }} />
          <h2 className="ff-display max-w-sm text-[34px] leading-tight text-white">
            {role === "admin" ? "The evaluation console for the Standards Board." : "Your nomination, in one calm, secure place."}
          </h2>
          <ul className="mt-7 space-y-3">
            {points.map((x) => (
              <li key={x} className="flex items-center gap-2.5 text-sm" style={{ color: C.mist }}>
                <Check size={14} style={{ color: C.mist }} /> {x}
              </li>
            ))}
          </ul>
          <div className="mt-6 h-px w-2/3" style={{ background: C.hairDark }} />
        </div>
        <span className="lbl relative text-[10px]" style={{ color: C.leaf }}>Protected area · encrypted · session-controlled</span>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <button onClick={onExit} className="mb-6 flex items-center gap-1 text-xs font-medium" style={{ color: C.leaf }}>
            <ChevronLeft size={14} /> Back to public site
          </button>

          {/* role toggle — rectangular segmented control */}
          <div className="mb-6 grid grid-cols-2 gap-0.5 rounded-[4px] border p-0.5" style={{ borderColor: C.hairline, background: "#fff" }}>
            {[{ k: "member", n: "Member", i: Users }, { k: "admin", n: "Admin", i: Shield }].map((r) => (
              <button key={r.k} onClick={() => pickRole(r.k)}
                className="flex items-center justify-center gap-1.5 rounded-[3px] px-3 py-2 text-[13px] font-medium transition"
                style={{ background: role === r.k ? C.green : "transparent", color: role === r.k ? "#fff" : C.body }}>
                <r.i size={14} /> {r.n} login
              </button>
            ))}
          </div>

          {step === "login" && (
            <>
              <h3 className="ff-display text-2xl" style={{ color: C.inkSerif }}>{role === "admin" ? "Admin sign in" : "Member sign in"}</h3>
              <div className="mt-2.5 h-px w-8" style={{ background: C.leaf }} />
              <p className="mt-2.5 text-sm" style={{ color: C.faint }}>{role === "admin" ? "Access the evaluation console." : "Access your nomination dashboard."}</p>
              <div className="mt-6 space-y-4">
                <Field label="Official email" req><input className={inputCls} style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field label="Password" req><input type="password" className={inputCls} style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
                {err && <div className="flex items-center gap-1.5 rounded-[4px] px-3 py-2 text-xs" style={{ background: STATUS["Clarification Required"].bg, color: STATUS["Clarification Required"].c }}><AlertCircle size={13} /> {err}</div>}
                <div className="flex justify-end"><button onClick={() => setStep("forgot")} className="text-xs font-medium" style={{ color: C.leaf }}>Forgot password?</button></div>
                <Btn className="w-full" size="lg" onClick={attempt}><LogIn size={16} /> Log in as {role === "admin" ? "Admin" : "Member"}</Btn>
                {role === "member" && (
                  <p className="text-center text-xs" style={{ color: C.faint }}>New here? <button onClick={() => setStep("register")} className="font-semibold" style={{ color: C.green }}>Register your company</button></p>
                )}
              </div>
              <div className="mt-6 rounded-[4px] border border-dashed p-3.5 text-xs" style={{ borderColor: C.mist, background: C.leafSoft + "70", color: C.body }}>
                <div className="lbl mb-1.5 flex items-center gap-1.5 text-[10px]" style={{ color: C.leaf }}><Lock size={11} /> Demo credentials · pre-filled</div>
                <div className="ff-mono">member@kaveriren.in · demo1234</div>
                <div className="ff-mono">admin@icai.in · admin1234</div>
              </div>
            </>
          )}

          {step === "register" && (
            <>
              <h3 className="ff-display text-2xl" style={{ color: C.inkSerif }}>Register your company</h3>
              <div className="mt-2.5 h-px w-8" style={{ background: C.leaf }} />
              <p className="mt-2.5 text-sm" style={{ color: C.faint }}>Create a member account to begin.</p>
              <div className="mt-6 space-y-4">
                <Field label="Company name" req><input className={inputCls} style={inputStyle} placeholder="e.g. Verdant Steel Ltd." /></Field>
                <Field label="Official email" req hint="An OTP will be sent to this address"><input className={inputCls} style={inputStyle} placeholder="esg@company.in" /></Field>
                <Field label="Create password" req><input type="password" className={inputCls} style={inputStyle} placeholder="••••••••" /></Field>
                <div className="flex items-center justify-between rounded-[4px] border px-3.5 py-2.5 text-xs" style={{ borderColor: C.hairline, color: C.faint }}>
                  <span className="flex items-center gap-2"><Shield size={14} style={{ color: C.leaf }} /> I'm not a robot</span>
                  <span className="ff-mono rounded-md px-2 py-0.5 text-[10px]" style={{ background: C.panel }}>CAPTCHA</span>
                </div>
                <Btn className="w-full" size="lg" onClick={() => setStep("otp")}>Send verification code <ArrowRight size={16} /></Btn>
                <p className="text-center text-xs" style={{ color: C.faint }}>Already registered? <button onClick={() => setStep("login")} className="font-semibold" style={{ color: C.green }}>Log in</button></p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <button onClick={() => setStep("login")} className="mb-4 flex items-center gap-1 text-xs font-medium" style={{ color: C.leaf }}><ChevronLeft size={14} /> Back</button>
              <h3 className="ff-display text-2xl" style={{ color: C.inkSerif }}>Verify your email</h3>
              <div className="mt-2.5 h-px w-8" style={{ background: C.leaf }} />
              <p className="mt-2.5 text-sm" style={{ color: C.faint }}>We sent a 6-digit code to <b style={{ color: C.body }}>{email}</b>.</p>
              <div className="mt-6 flex gap-2">
                {otp.map((v, i) => (
                  <input key={i} ref={(el) => (refs.current[i] = el)} value={v} onChange={(e) => handleOtp(i, e.target.value)} maxLength={1} inputMode="numeric"
                    className="ff-mono h-14 w-full rounded-[4px] border text-center text-xl outline-none focus:ring-2" style={{ borderColor: C.hairline, color: C.green }} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs" style={{ color: C.faint }}>
                <span className="flex items-center gap-1"><Clock size={12} /> Code expires in 04:59</span>
                <button className="font-semibold" style={{ color: C.leaf }}>Resend</button>
              </div>
              <Btn className="mt-6 w-full" size="lg" onClick={() => onLogin(role, DEMO[role])}>Verify &amp; continue <CheckCircle2 size={16} /></Btn>
              <p className="mt-3 text-center text-xs" style={{ color: C.faint }}>Prototype tip: any digits work.</p>
            </>
          )}

          {step === "forgot" && (
            <>
              <button onClick={() => setStep("login")} className="mb-4 flex items-center gap-1 text-xs font-medium" style={{ color: C.leaf }}><ChevronLeft size={14} /> Back to sign in</button>
              {!sentReset ? (
                <>
                  <h3 className="ff-display text-2xl" style={{ color: C.inkSerif }}>Reset your password</h3>
                  <div className="mt-2.5 h-px w-8" style={{ background: C.leaf }} />
                  <p className="mt-2.5 text-sm" style={{ color: C.faint }}>Enter your official email and we'll send a secure reset link.</p>
                  <div className="mt-6 space-y-4">
                    <Field label="Official email" req><input className={inputCls} style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.in" /></Field>
                    <Btn className="w-full" size="lg" onClick={() => setSentReset(true)} disabled={!email.trim()}><Mail size={16} /> Send reset link</Btn>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: STATUS["Final Submitted"].bg }}><CheckCircle2 size={22} style={{ color: STATUS["Final Submitted"].c }} /></div>
                  <h3 className="ff-display mt-4 text-2xl" style={{ color: C.ink }}>Check your inbox</h3>
                  <p className="mt-1 text-sm" style={{ color: C.faint }}>If an account exists for <b style={{ color: C.body }}>{email}</b>, a password-reset link is on its way. It expires in 30 minutes.</p>
                  <Btn className="mt-6 w-full" size="lg" variant="outline" onClick={() => { setSentReset(false); setStep("login"); }}>Back to sign in</Btn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// APPLICANT (MEMBER) DASHBOARD
// ============================================================================
function ApplicantPortal({ startNomination, noms, onView, onRespond }) {
  const [tab, setTab] = useState("all");
  const [respondTo, setRespondTo] = useState(null);   // nomination we're responding to
  const drafts = noms.filter((n) => n.status === "Draft");
  const submitted = noms.filter((n) => n.status !== "Draft");
  const shown = tab === "all" ? noms : tab === "draft" ? drafts : submitted;
  const notifs = [
    ...noms.filter((n) => n.status === "Clarification Required").map((n) => ({
      icon: MessageSquare, t: `Clarification requested on ${n.id}`, s: `Admin asks: ${n.clarification?.message ?? "please review your submission."}`, time: n.clarification?.at ?? "recently",
    })),
    { icon: Bell, t: "Nomination window closing soon", s: "Nominations close 15 Aug 2026.", time: "3h ago" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-6 py-10" style={{ color: C.ink }}>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
        <div>
          <Eyebrow>Member dashboard</Eyebrow>
          <h2 className="ff-display mt-3 text-3xl" style={{ color: C.inkSerif }}>Welcome back, Kaveri Renewables</h2>
          <p className="mt-1 text-sm" style={{ color: C.faint }}>Manage and track your award nominations.</p>
        </div>
        <Btn size="lg" onClick={startNomination}><Plus size={16} /> New nomination</Btn>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatTab active={tab === "all"} onClick={() => setTab("all")} label="Login account" value="1 active" />
        <StatTab active={tab === "draft"} onClick={() => setTab("draft")} label="Drafts / partial"
          count={drafts.length} value={` nomination${drafts.length === 1 ? "" : "s"}`} />
        <StatTab active={tab === "submitted"} onClick={() => setTab("submitted")} label="Submitted"
          count={submitted.length} value={` nomination${submitted.length === 1 ? "" : "s"}`} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionLabel>Your nominations</SectionLabel>
          <div className="space-y-3">
            {shown.length === 0 && (
              <Card className="text-center"><p className="text-sm" style={{ color: C.faint }}>No nominations here yet. Start one with “New nomination”.</p></Card>
            )}
            {shown.map((m) => (
              <Card key={m.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="ff-display text-[17px]" style={{ color: C.inkSerif }}>{m.company}</span>
                    <Pill status={m.status} />
                  </div>
                  <div className="ff-mono mt-1 text-[11px]" style={{ color: C.faint }}>{m.id} · updated {m.updated}</div>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="h-[3px] w-40 overflow-hidden" style={{ background: C.panel }}>
                      <div className="h-full" style={{ width: `${m.pct}%`, background: m.pct === 100 ? C.leaf : C.honey }} />
                    </div>
                    <span className="ff-mono text-[11px]" style={{ color: C.faint }}>{m.pct}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {m.status === "Draft" ? <Btn size="sm" onClick={startNomination}>Continue</Btn> : <Btn size="sm" variant="outline" onClick={() => onView(m)}><Eye size={14} /> View</Btn>}
                  {m.status === "Clarification Required" && <Btn size="sm" variant="soft" onClick={() => setRespondTo(m)}><MessageSquare size={14} /> Respond</Btn>}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-9"><SectionLabel>Nomination lifecycle</SectionLabel></div>
          <Card>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {["Draft", "Submitted", "Under Review", "Clarification Required", "Final Submitted"].map((s, i, a) => (
                <React.Fragment key={s}>
                  <Pill status={s} />
                  {i < a.length - 1 && <ChevronRight size={13} style={{ color: C.mist }} />}
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <SectionLabel>Notifications & reminders</SectionLabel>
          <div className="space-y-2.5">
            {notifs.map((n, i) => (
              <div key={i} className="py-3 pl-3.5" style={{ borderLeft: `2px solid ${C.leaf}` }}>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.ink }}><n.icon size={14} style={{ color: C.leaf, flexShrink: 0 }} /> {n.t}</div>
                <div className="mt-0.5 text-xs leading-relaxed" style={{ color: C.faint }}>{n.s}</div>
                <div className="ff-mono mt-1.5 text-[10px]" style={{ color: C.mist }}>{n.time} · email + SMS sent</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* respond-to-clarification modal — closes the loop back to the admin */}
      {respondTo && (
        <RespondModal nom={respondTo} onClose={() => setRespondTo(null)}
          onSend={(text) => { onRespond(respondTo.id, text); setRespondTo(null); }} />
      )}
    </div>
  );
}

function RespondModal({ nom, onClose, onSend }) {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4" style={{ background: "rgba(18,37,33,0.42)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6" style={{ boxShadow: "0 20px 50px rgba(18,37,33,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="pb-4" style={{ borderBottom: `1px solid ${C.hairline}` }}>
          <h3 className="ff-display text-xl" style={{ color: C.inkSerif }}>Respond to clarification</h3>
          <div className="ff-mono mt-1 text-[11px]" style={{ color: C.faint }}>{nom.id} · {nom.company}</div>
        </div>
        <div className="mt-4 py-1 pl-3.5 text-sm" style={{ borderLeft: `2px solid ${STATUS["Clarification Required"].c}`, color: C.body }}>
          <span className="lbl text-[10px]" style={{ color: C.faint }}>Admin asked</span>
          <p className="mt-1">{nom.clarification?.message}</p>
        </div>
        <div className="mt-4">
          <Field label="Your response" req>
            <textarea rows={4} className={inputCls} style={inputStyle} value={text} onChange={(e) => setText(e.target.value)} autoFocus placeholder="Explain or note the re-uploaded document…" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => onSend(text.trim())} disabled={!text.trim()}><Send size={15} /> Send response</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOMINATION WIZARD
// ============================================================================
const INITIAL_DOCS = [
  { n: "Business Responsibility & Sustainability Report", req: true, done: true, size: "4.2 MB" },
  { n: "Annual Report", req: true, done: true, size: "8.1 MB" },
  { n: "Chairman's message", req: true, done: false },
  { n: "Sustainability Report", req: false, done: true, size: "2.7 MB" },
  { n: "ESG Report", req: false, done: false },
  { n: "Integrated Report", req: false, done: false },
  { n: "Others (please specify)", req: false, done: false, other: true, specify: "" },
];

function NominationWizard({ onExit, onSubmit, session }) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState("");
  const [data, setData] = useState({
    company: "Kaveri Renewables Pvt. Ltd.", email: "hello@kaveriren.in", website: "", address: "",
    listing: "Unlisted", cap: "Voluntary", sector: "Manufacturing",
    pName: "", pDesig: "", pMobile: "", pEmail: "", sName: "", sDesig: "", sMobile: "", sEmail: "",
  });
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [accepted, setAccepted] = useState([false, false, false]);
  const steps = ["Company", "Classification", "Contacts", "Documents", "Declaration"];

  const doneReq = docs.filter((d) => d.req && d.done).length;
  const totalReq = docs.filter((d) => d.req).length;
  const doneDocs = docs.filter((d) => d.done).length;
  const mandatoryComplete = doneReq === totalReq;

  useEffect(() => { const t = setTimeout(() => setSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 600); return () => clearTimeout(t); }, [data, docs, step]);
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = () => {
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    onSubmit({
      id: "NOM-2026-" + (1000 + Math.floor(Math.random() * 8999)),
      company: data.company || "Untitled nomination",
      email: data.email, owner: session.email,
      listing: data.listing, cap: data.cap, sector: data.sector,
      category: `${data.cap} · ${data.sector}`,
      status: "Final Submitted", submitted: today, updated: "just now", pct: 100, docs: doneDocs,
      contacts: {
        primary: { name: data.pName || "—", desig: data.pDesig || "—", mobile: data.pMobile || "—", email: data.pEmail || data.email },
        ...(data.sName ? { secondary: { name: data.sName, desig: data.sDesig, mobile: data.sMobile, email: data.sEmail } } : {}),
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" style={{ color: C.ink }}>
      <button onClick={onExit} className="mb-5 flex items-center gap-1 text-sm font-medium" style={{ color: C.leaf }}><ChevronLeft size={16} /> Back to dashboard</button>

      <div className="mb-7 flex items-center justify-between">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              {i < step ? (
                <span className="grid h-6 w-6 place-items-center"><Check size={13} style={{ color: C.leaf }} /></span>
              ) : i === step ? (
                <span className="ff-mono grid h-6 w-6 place-items-center rounded-[3px] text-[12px] text-white" style={{ background: C.deep }}>{i + 1}</span>
              ) : (
                <span className="ff-mono grid h-6 w-6 place-items-center text-[12px]" style={{ color: C.faint }}>{i + 1}</span>
              )}
              <span className="hidden text-[13px] font-medium sm:block" style={{ color: i === step ? C.ink : C.faint }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-2 h-px flex-1" style={{ background: i < step ? C.leaf : C.hairline }} />}
          </React.Fragment>
        ))}
      </div>

      {saved && <div className="ff-mono mb-4 flex items-center gap-1.5 text-[11px]" style={{ color: C.leaf }}><CheckCircle2 size={13} /> Draft auto-saved at {saved}</div>}

      <Card className="!p-7 sm:!p-9">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <span className="lbl text-[10px]" style={{ color: C.leaf }}>Step 1 of 5</span>
              <h3 className="ff-display mt-1.5 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>Company information</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" req><input className={inputCls} style={inputStyle} value={data.company} onChange={(e) => set("company", e.target.value)} /></Field>
              <Field label="Official email" req><input className={inputCls} style={inputStyle} value={data.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Official website"><input className={inputCls} style={inputStyle} value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
              <Field label="Corporate office address" req><input className={inputCls} style={inputStyle} value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="City, State" /></Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="lbl text-[10px]" style={{ color: C.leaf }}>Step 2 of 5</span>
              <h3 className="ff-display mt-1.5 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>Classification</h3>
            </div>
            <div>
              <span className="lbl mb-2.5 block text-[10px]" style={{ color: C.faint }}>Listing information *</span>
              <div className="flex flex-wrap gap-2">{["NSE Listed", "BSE Listed", "Listed Outside India", "Unlisted"].map((o) => <ChoiceChip key={o} active={data.listing === o} onClick={() => set("listing", o)}>{o}</ChoiceChip>)}</div>
            </div>
            <div>
              <span className="lbl mb-2.5 block text-[10px]" style={{ color: C.faint }}>Market capitalisation *</span>
              <div className="flex flex-wrap gap-2">{["Large Cap", "Mid Cap", "Small Cap", "Voluntary"].map((o) => <ChoiceChip key={o} active={data.cap === o} onClick={() => set("cap", o)}>{o}</ChoiceChip>)}</div>
              {data.listing === "Unlisted" && data.cap !== "Voluntary" && (
                <div className="mt-2.5 flex items-center gap-1.5 py-2 pl-3 text-xs" style={{ borderLeft: `2px solid ${STATUS["Under Review"].c}`, color: STATUS["Under Review"].c }}>
                  <AlertCircle size={13} /> Unlisted entities are usually nominated under <b className="mx-1">Voluntary</b>. Please confirm.
                </div>
              )}
            </div>
            <div>
              <span className="lbl mb-2.5 block text-[10px]" style={{ color: C.faint }}>Sector *</span>
              <div className="flex flex-wrap gap-2">{["Manufacturing", "Service"].map((o) => <ChoiceChip key={o} active={data.sector === o} onClick={() => set("sector", o)}>{o}</ChoiceChip>)}</div>
            </div>
            <div className="py-2.5 pl-4 text-sm" style={{ borderLeft: `2px solid ${C.leaf}` }}>
              <span style={{ color: C.body }}>Nomination category resolves to </span><b className="ff-serif" style={{ color: C.green }}>{data.cap} · {data.sector}</b>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="lbl text-[10px]" style={{ color: C.leaf }}>Step 3 of 5</span>
              <h3 className="ff-display mt-1.5 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>Contact persons</h3>
            </div>
            {[{ label: "Primary contact", req: true, keys: ["pName", "pDesig", "pMobile", "pEmail"] },
              { label: "Secondary contact", req: false, keys: ["sName", "sDesig", "sMobile", "sEmail"] }].map(({ label, req, keys }) => (
              <div key={label}>
                <span className="lbl mb-2.5 block text-[10px]" style={{ color: req ? C.faint : C.mist }}>{label} {req && "*"}</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[["Name", keys[0]], ["Designation", keys[1]], ["Mobile number", keys[2]], ["Email ID", keys[3]]].map(([ph, k]) => (
                    <input key={k} className={inputCls} style={inputStyle} placeholder={ph} value={data[k]} onChange={(e) => set(k, e.target.value)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && <DocumentUpload docs={docs} setDocs={setDocs} />}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="lbl text-[10px]" style={{ color: C.leaf }}>Step 5 of 5</span>
              <h3 className="ff-display mt-1.5 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>Declaration</h3>
            </div>

            {/* mandatory-document status — informational, does NOT block submission */}
            <div className="flex items-center gap-2.5 py-2.5 pl-4 text-sm"
              style={{ borderLeft: `2px solid ${mandatoryComplete ? STATUS["Final Submitted"].c : STATUS["Under Review"].c}`, color: mandatoryComplete ? STATUS["Final Submitted"].c : STATUS["Under Review"].c }}>
              {mandatoryComplete ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{doneReq}/{totalReq} mandatory documents uploaded{mandatoryComplete ? " — all set." : ". You can still submit for the demo; production would flag this before final submission."}</span>
            </div>

            <div className="divide-y rounded-[4px] border text-sm" style={{ borderColor: C.hairline, color: C.body }}>
              {["I confirm the category and sector classification selected above is accurate.",
                "I confirm all information and documents submitted are authentic and complete.",
                "I accept the nomination terms and consent to evaluation by the ICAI Sustainability Reporting Standards Board."].map((t, i) => (
                <label key={i} className="flex items-start gap-2.5 px-4 py-3.5" style={{ borderColor: C.hairline }}>
                  <input type="checkbox" className="mt-0.5 h-4 w-4" style={{ accentColor: C.green }}
                    checked={accepted[i]} onChange={(e) => setAccepted((a) => a.map((v, j) => (j === i ? e.target.checked : v)))} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            <div className="py-2.5 text-center text-sm" style={{ color: STATUS["Final Submitted"].c }}>
              Once finally submitted, edits require an admin clarification request.
            </div>
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <Btn variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={16} /> Previous</Btn>
        {step < steps.length - 1
          ? <Btn onClick={() => setStep((s) => s + 1)}>Save & continue <ChevronRight size={16} /></Btn>
          : <Btn onClick={submit}><CheckCircle2 size={16} /> Final submit</Btn>}
      </div>
    </div>
  );
}

const FAKE_SIZES = ["3.4 MB", "5.1 MB", "1.9 MB", "6.7 MB", "2.2 MB"];

function DocumentUpload({ docs, setDocs }) {
  const [drag, setDrag] = useState(false);
  const doneReq = docs.filter((d) => d.req && d.done).length, totalReq = docs.filter((d) => d.req).length;

  const markDone = (i) => setDocs((ds) => ds.map((d, j) => (j === i ? { ...d, done: true, size: d.size || FAKE_SIZES[i % FAKE_SIZES.length] } : d)));
  const clearDoc = (i) => setDocs((ds) => ds.map((d, j) => (j === i ? { ...d, done: false, size: undefined } : d)));
  const setSpecify = (i, v) => setDocs((ds) => ds.map((d, j) => (j === i ? { ...d, specify: v } : d)));
  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    // simulate accepting a dropped PDF: fill the first still-missing mandatory doc
    const idx = docs.findIndex((d) => d.req && !d.done);
    markDone(idx === -1 ? docs.findIndex((d) => !d.done) : idx);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="lbl text-[10px]" style={{ color: C.leaf }}>Step 4 of 5</span>
          <span className="ff-mono text-[11px]" style={{ color: doneReq === totalReq ? C.leaf : C.honey }}>{doneReq}/{totalReq} mandatory uploaded</span>
        </div>
        <h3 className="ff-display mt-1.5 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>Documents</h3>
      </div>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className="grid cursor-pointer place-items-center rounded-[4px] border border-dashed py-9 text-center transition"
        style={{ borderColor: drag ? C.leaf : C.mist, background: drag ? C.leafSoft : "#fff" }}
        onClick={() => { const idx = docs.findIndex((d) => d.req && !d.done); if (idx !== -1) markDone(idx); }}>
        <Upload size={22} style={{ color: C.leaf }} />
        <p className="mt-2.5 text-sm font-medium" style={{ color: C.ink }}>Drag & drop PDFs here, or click to browse</p>
        <p className="ff-mono mt-0.5 text-[11px]" style={{ color: C.faint }}>PDF only · max 10 MB per file</p>
      </div>
      <div>
        <span className="lbl mb-2.5 block text-[10px]" style={{ color: C.faint }}>Submission checklist</span>
        <div className="divide-y border-t" style={{ borderColor: C.hairline }}>
          {docs.map((d, i) => (
            <div key={d.n} className="flex items-center justify-between gap-3 py-3.5" style={{ borderColor: C.hairline }}>
              <div className="flex min-w-0 items-center gap-3">
                {d.done ? <CheckCircle2 size={18} style={{ color: C.leaf }} /> : <Circle size={18} style={{ color: d.req ? STATUS["Clarification Required"].c : C.mist }} />}
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color: C.ink }}>{d.n} <span className="ff-mono text-[10px]" style={{ color: d.req ? STATUS["Clarification Required"].c : C.faint }}>· {d.req ? "required" : "optional"}</span></div>
                  {d.other && <input className="mt-1.5 w-full rounded-[4px] px-2.5 py-1.5 text-xs outline-none" style={{ border: `1px solid ${C.hairline}`, color: C.ink }} placeholder="Specify document name…" value={d.specify || ""} onChange={(e) => setSpecify(i, e.target.value)} />}
                  {d.done && <div className="ff-mono text-[11px]" style={{ color: C.faint }}>{(d.other && d.specify ? d.specify : "document").replace(/\s+/g, "-").toLowerCase()}.pdf · {d.size} · validated</div>}
                </div>
              </div>
              {d.done
                ? <div className="flex flex-shrink-0 gap-1"><Btn size="sm" variant="ghost" onClick={() => clearDoc(i)}>Replace</Btn></div>
                : <Btn size="sm" variant="outline" onClick={() => markDone(i)}><Upload size={14} /> Upload</Btn>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN CONSOLE
// ============================================================================
function AdminConsole({ categories, setCategories, noms, onView, onClarify }) {
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [filters, setFilters] = useState({ q: "", status: "All", sector: "All", cap: "All" });
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);     // category being added/edited
  const [confirmDel, setConfirmDel] = useState(null); // category pending delete
  const [clarifyFor, setClarifyFor] = useState(null); // nomination we're raising a clarification on
  const [clarForm, setClarForm] = useState({ id: "", msg: "" }); // inline "Clarifications" view form

  const saveCat = () => {
    if (!editing.name.trim()) return;
    const rec = { id: editing.id, name: editing.name.trim(), desc: editing.desc.trim(), sector: editing.sector, active: editing.active };
    if (editing.isNew) setCategories((cs) => [...cs, { ...rec, id: "cat-" + Date.now() }]);
    else setCategories((cs) => cs.map((c) => (c.id === editing.id ? rec : c)));
    setEditing(null);
  };
  const deleteCat = () => { setCategories((cs) => cs.filter((c) => c.id !== confirmDel.id)); setConfirmDel(null); };

  const rows = noms.filter(r =>
    (filters.status === "All" || r.status === filters.status) &&
    (filters.sector === "All" || r.sector === filters.sector) &&
    (filters.cap === "All" || r.cap === filters.cap) &&
    (r.company.toLowerCase().includes(filters.q.toLowerCase()) || r.id.toLowerCase().includes(filters.q.toLowerCase())));

  const statusData = Object.keys(STATUS).map(s => ({ name: STATUS[s].label, value: noms.filter(r => r.status === s).length, c: STATUS[s].c })).filter(d => d.value);
  const sectorData = [{ name: "Manufacturing", value: noms.filter(r => r.sector === "Manufacturing").length }, { name: "Service", value: noms.filter(r => r.sector === "Service").length }];
  // keep the open detail in sync with shared state (status changes after raising a clarification)
  const selLive = sel ? (noms.find((n) => n.id === sel.id) || sel) : null;

  return (
    <div className="flex min-h-[620px]" style={{ background: C.bg, color: C.ink }}>
      <aside className="hidden w-56 flex-shrink-0 border-r p-4 lg:block" style={{ borderColor: C.line, background: "#fff" }}>
        <div className="mb-6 flex items-center gap-2.5 px-1">
          <div className="grid h-8 w-8 place-items-center rounded-[4px]" style={{ background: C.deep }}><Shield size={15} color="#fff" /></div>
          <div><div className="ff-display text-[13px]" style={{ color: C.inkSerif }}>Admin Console</div><div className="lbl text-[9px]" style={{ color: C.faint }}>SRSB · ICAI</div></div>
        </div>
        <div className="lbl mb-2 border-t px-1 pt-4 text-[9px]" style={{ color: C.faint, borderColor: C.hairline }}>Modules</div>
        {[
          { k: "dashboard", n: "Dashboard", i: LayoutDashboard },
          { k: "nominations", n: "Nominations", i: FileText },
          { k: "categories", n: "Award Categories", i: Award },
          { k: "clarify", n: "Clarifications", i: MessageSquare },
          { k: "comms", n: "Communications", i: Mail },
        ].map((m) => (
          <button key={m.k} onClick={() => { setView(m.k); setSel(null); }}
            className="mb-1 flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2.5 text-[13px] font-medium transition"
            style={{ background: view === m.k ? C.leafSoft : "transparent", color: view === m.k ? C.green : C.body, borderLeft: `2px solid ${view === m.k ? C.green : "transparent"}` }}>
            <m.i size={16} /> {m.n}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 sm:p-8">
        {view === "dashboard" && (
          <>
            <PageTitle eyebrow="Overview" title="Nomination overview" sub="2026 ICAI Sustainability Awards · live figures" />
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <StatCard label="Total nominations" value={noms.length} />
              <StatCard label="Final submitted" value={noms.filter(r => r.status === "Final Submitted").length} />
              <StatCard label="Awaiting review" value={noms.filter(r => r.status === "Under Review" || r.status === "Submitted").length} />
              <StatCard label="Clarifications open" value={noms.filter(r => r.status === "Clarification Required").length} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Card>
                <SectionLabel>By status</SectionLabel>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: C.body, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: C.panel }} contentStyle={{ borderRadius: 4, border: `1px solid ${C.hairline}`, fontSize: 11, fontFamily: "var(--mono)", boxShadow: "none" }} />
                    <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={12}>{statusData.map((d, i) => <Cell key={i} fill={d.c} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <SectionLabel>By sector</SectionLabel>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={sectorData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={72} paddingAngle={2}><Cell fill={C.green} /><Cell fill={C.leaf} /></Pie>
                    <Tooltip contentStyle={{ borderRadius: 4, border: `1px solid ${C.hairline}`, fontSize: 11, fontFamily: "var(--mono)", boxShadow: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ff-mono flex justify-center gap-5 text-[11px]" style={{ color: C.body }}>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2" style={{ background: C.green }} /> Manufacturing</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2" style={{ background: C.leaf }} /> Service</span>
                </div>
              </Card>
            </div>
          </>
        )}

        {view === "nominations" && !sel && (
          <>
            <PageTitle eyebrow="All records" title="Nominations" actions={<>
              {selected.length > 0 && <Btn size="sm" variant="soft"><Mail size={14} /> Email {selected.length} selected</Btn>}
              <Btn size="sm" variant="outline"><Download size={14} /> Export</Btn>
            </>} />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="relative flex-1" style={{ minWidth: 200 }}>
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.faint }} />
                <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search company or ID…"
                  className="w-full rounded-[4px] border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2" style={{ borderColor: C.hairline }} />
              </div>
              {[{ k: "status", opts: ["All", ...Object.keys(STATUS)] }, { k: "sector", opts: ["All", "Manufacturing", "Service"] }, { k: "cap", opts: ["All", "Large Cap", "Mid Cap", "Small Cap", "Voluntary"] }].map((f) => (
                <select key={f.k} value={filters[f.k]} onChange={(e) => setFilters({ ...filters, [f.k]: e.target.value })}
                  className="rounded-[4px] border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2" style={{ borderColor: C.hairline, color: C.green }}>
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.deep}` }}>
                    <th className="w-10 px-4 py-3"></th>
                    {["Nomination", "Category", "Status", "Submitted", ""].map((h) => <th key={h} className="lbl px-4 py-3 text-left text-[10px]" style={{ color: C.faint }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: C.hairline }}>
                  {rows.map((r) => (
                    <tr key={r.id} className="transition hover:bg-white" style={{ borderColor: C.hairline }}>
                      <td className="px-4 py-3.5"><input type="checkbox" checked={selected.includes(r.id)} style={{ accentColor: C.green }} onChange={(e) => setSelected(e.target.checked ? [...selected, r.id] : selected.filter(x => x !== r.id))} /></td>
                      <td className="px-4 py-3.5"><div className="font-medium" style={{ color: C.ink }}>{r.company}</div><div className="ff-mono text-[11px]" style={{ color: C.faint }}>{r.id} · {r.docs} docs</div></td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: C.body }}>{r.category}</td>
                      <td className="px-4 py-3.5"><Pill status={r.status} /></td>
                      <td className="px-4 py-3.5 ff-mono text-[11px]" style={{ color: C.faint }}>{r.submitted}</td>
                      <td className="px-4 py-3.5 text-right"><Btn size="sm" variant="ghost" onClick={() => setSel(r)}>Open <ChevronRight size={14} /></Btn></td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: C.faint }}>No nominations match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "nominations" && selLive && (
          <div>
            <button onClick={() => setSel(null)} className="mb-5 flex items-center gap-1 text-sm font-medium" style={{ color: C.leaf }}><ChevronLeft size={16} /> Back to list</button>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="ff-display text-2xl" style={{ color: C.inkSerif }}>{selLive.company}</h2>
                <div className="ff-mono mt-1.5 flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>{selLive.id} · {selLive.email} <Pill status={selLive.status} /></div>
              </div>
              <div className="flex gap-2">
                <Btn size="sm" variant="soft" onClick={() => setClarifyFor(selLive)}><MessageSquare size={14} /> Raise clarification</Btn>
                <Btn size="sm" variant="outline" onClick={() => onView(selLive)}><Eye size={14} /> Full preview</Btn>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <SectionLabel>Submission summary</SectionLabel>
                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
                  {[["Listing", selLive.listing], ["Market cap", selLive.cap], ["Sector", selLive.sector], ["Category", selLive.category], ["Submitted on", selLive.submitted], ["Documents", `${selLive.docs} files`]].map(([k, v]) => (
                    <div key={k}><dt className="lbl text-[10px]" style={{ color: C.faint }}>{k}</dt><dd className="mt-0.5 font-medium" style={{ color: C.ink }}>{v}</dd></div>
                  ))}
                </dl>
                {selLive.clarification && (
                  <div className="mt-5 py-1 pl-3.5" style={{ borderLeft: `2px solid ${STATUS["Clarification Required"].c}` }}>
                    <span className="lbl text-[10px]" style={{ color: STATUS["Clarification Required"].c }}>Clarification thread</span>
                    <p className="mt-1.5 text-xs" style={{ color: C.body }}><b>Admin:</b> {selLive.clarification.message}</p>
                    <p className="mt-1 text-xs" style={{ color: C.faint }}><b>Applicant:</b> {selLive.clarification.response || "Awaiting response…"}</p>
                  </div>
                )}
              </Card>
              <Card>
                <SectionLabel>Documents</SectionLabel>
                <div className="divide-y border-t" style={{ borderColor: C.hairline }}>
                  {["BRSR report", "Annual Report", "Chairman's message"].map((d) => (
                    <div key={d} className="flex items-center justify-between py-2.5 text-sm" style={{ borderColor: C.hairline }}>
                      <span className="flex items-center gap-2" style={{ color: C.ink }}><FileText size={14} style={{ color: C.leaf }} /> {d}</span>
                      <a href="#" className="link-edit ff-mono text-[11px]" style={{ color: C.green }}>view</a>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === "categories" && (
          <>
            <PageTitle eyebrow="Configuration" title="Award categories"
              sub="Add, edit or remove the categories shown on the public site and used for classification."
              actions={<Btn size="sm" onClick={() => setEditing({ id: null, name: "", desc: "", sector: "All", active: true, isNew: true })}>
                <Plus size={14} /> Add category
              </Btn>} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {categories.map((c) => (
                <Card key={c.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="ff-display text-lg" style={{ color: C.inkSerif }}>{c.name}</span>
                      {c.active
                        ? <span className="ff-mono text-[10px] uppercase tracking-wider" style={{ color: C.leaf }}>Active</span>
                        : <span className="ff-mono text-[10px] uppercase tracking-wider" style={{ color: C.faint }}>Inactive</span>}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.faint }}>{c.desc || "No description."}</p>
                    <div className="ff-mono mt-2.5 text-[11px]" style={{ color: C.faint }}>Sector: {c.sector}</div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Btn size="sm" variant="ghost" onClick={() => setEditing({ ...c, isNew: false })} aria-label="Edit"><Pencil size={15} /></Btn>
                    <button onClick={() => setConfirmDel(c)} aria-label="Delete"
                      className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-black/[0.04]" style={{ color: STATUS["Clarification Required"].c }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Card>
              ))}
              {categories.length === 0 && (
                <Card className="sm:col-span-2 text-center">
                  <p className="text-sm" style={{ color: C.faint }}>No categories yet. Add one to display it on the public site.</p>
                </Card>
              )}
            </div>
            <p className="ff-mono mt-4 text-[11px]" style={{ color: C.mist }}>Changes reflect immediately on the public “Award categories” section.</p>
          </>
        )}

        {view === "clarify" && (
          <>
            <PageTitle eyebrow="Workflow" title="Clarification requests" sub="Raise a query to an applicant; they respond from their dashboard." />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Card>
                <SectionLabel>New clarification</SectionLabel>
                <Field label="Nomination">
                  <select className={inputCls} style={inputStyle} value={clarForm.id} onChange={(e) => setClarForm((f) => ({ ...f, id: e.target.value }))}>
                    <option value="">Select a nomination…</option>
                    {noms.map(r => <option key={r.id} value={r.id}>{r.id} — {r.company}</option>)}
                  </select>
                </Field>
                <div className="mt-4"><Field label="Message to applicant"><textarea rows={4} className={inputCls} style={inputStyle} value={clarForm.msg} onChange={(e) => setClarForm((f) => ({ ...f, msg: e.target.value }))} placeholder="e.g. The uploaded Chairman's message is not legible. Please re-upload a clear PDF."></textarea></Field></div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Btn variant="soft" disabled={!clarForm.id || !clarForm.msg.trim()}
                    onClick={() => { onClarify(clarForm.id, clarForm.msg.trim()); setClarForm({ id: "", msg: "" }); }}>
                    <Send size={15} /> Send &amp; flag "Clarification Required"
                  </Btn>
                  <label className="flex items-center gap-1.5 text-xs" style={{ color: C.faint }}><input type="checkbox" defaultChecked style={{ accentColor: C.green }} /> notify by email + SMS</label>
                </div>
              </Card>
              <Card>
                <SectionLabel>Open threads</SectionLabel>
                <div className="space-y-2.5">
                  {noms.filter((n) => n.clarification).length === 0 && <p className="text-sm" style={{ color: C.faint }}>No clarification threads yet.</p>}
                  {noms.filter((n) => n.clarification).map((n) => (
                    <div key={n.id} className="py-1.5 pl-3.5" style={{ borderLeft: `2px solid ${STATUS[n.status]?.c || C.leaf}` }}>
                      <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium" style={{ color: C.ink }}>{n.id} · {n.company}</span><Pill status={n.status} /></div>
                      <p className="mt-2 text-xs" style={{ color: C.body }}><b>Admin:</b> {n.clarification.message}</p>
                      <p className="mt-1 text-xs" style={{ color: C.faint }}><b>Applicant:</b> {n.clarification.response || "Awaiting response…"}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {view === "comms" && (
          <>
            <PageTitle eyebrow="Outreach" title="Bulk communication" sub="Send announcements or reminders to nominees by segment." />
            <Card className="mt-6 max-w-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Recipients"><select className={inputCls} style={inputStyle}><option>All nominees (5)</option><option>Drafts only (1)</option><option>Under review (1)</option><option>By category…</option></select></Field>
                <Field label="Channel"><select className={inputCls} style={inputStyle}><option>Email + SMS</option><option>Email only</option><option>SMS only</option></select></Field>
              </div>
              <div className="mt-4"><Field label="Subject"><input className={inputCls} style={inputStyle} defaultValue="Reminder: nominations close 15 Aug 2026" /></Field></div>
              <div className="mt-4"><Field label="Message"><textarea rows={4} className={inputCls} style={inputStyle} defaultValue="Dear Nominee, this is a reminder that the nomination window for the 2026 ICAI Sustainability Awards closes on 15 August 2026…"></textarea></Field></div>
              <div className="mt-5 flex justify-end"><Btn variant="soft"><Send size={15} /> Send to segment</Btn></div>
            </Card>
          </>
        )}
      </main>

      {/* add / edit category modal */}
      {editing && (
        <div className="fixed inset-0 z-30 grid place-items-center p-4" style={{ background: "rgba(18,37,33,0.42)", backdropFilter: "blur(2px)" }} onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6" style={{ boxShadow: "0 20px 50px rgba(18,37,33,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div className="pb-4" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <h3 className="ff-display text-xl" style={{ color: C.inkSerif }}>{editing.isNew ? "Add category" : "Edit category"}</h3>
              <div className="lbl mt-1 text-[10px]" style={{ color: C.faint }}>Portal configuration</div>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Category name" req>
                <input className={inputCls} style={inputStyle} value={editing.name} autoFocus
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Large Cap" />
              </Field>
              <Field label="Description">
                <textarea rows={3} className={inputCls} style={inputStyle} value={editing.desc}
                  onChange={(e) => setEditing({ ...editing, desc: e.target.value })} placeholder="Short description shown on the public site." />
              </Field>
              <Field label="Applicable sector">
                <select className={inputCls} style={inputStyle} value={editing.sector} onChange={(e) => setEditing({ ...editing, sector: e.target.value })}>
                  <option value="All">All sectors</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Service">Service</option>
                </select>
              </Field>
              <label className="flex items-center justify-between rounded-[4px] border px-3.5 py-3" style={{ borderColor: C.hairline }}>
                <span className="text-sm" style={{ color: C.ink }}>Active <span style={{ color: C.faint }}>· visible on public site</span></span>
                <input type="checkbox" className="h-4 w-4" style={{ accentColor: C.green }} checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Btn variant="outline" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={saveCat} disabled={!editing.name.trim()}><Check size={16} /> {editing.isNew ? "Add category" : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* delete confirm modal — usage-aware */}
      {confirmDel && (() => {
        const used = noms.filter((r) => r.cap === confirmDel.name).length;
        return (
          <div className="fixed inset-0 z-30 grid place-items-center p-4" style={{ background: "rgba(18,37,33,0.42)", backdropFilter: "blur(2px)" }} onClick={() => setConfirmDel(null)}>
            <div className="w-full max-w-sm rounded-lg bg-white p-6" style={{ boxShadow: "0 20px 50px rgba(18,37,33,0.25)" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {used ? <AlertCircle size={18} style={{ color: STATUS["Under Review"].c }} /> : <Trash2 size={18} style={{ color: STATUS["Clarification Required"].c }} />}
                <span className="lbl text-[10px]" style={{ color: used ? STATUS["Under Review"].c : STATUS["Clarification Required"].c }}>{used ? "Category in use" : "Confirm deletion"}</span>
              </div>
              <h3 className="ff-display mt-3 border-b pb-3 text-xl" style={{ color: C.inkSerif, borderColor: C.hairline }}>
                {used ? `“${confirmDel.name}” is in use` : `Delete “${confirmDel.name}”?`}
              </h3>
              {used ? (
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.faint }}>
                  {used} nomination{used !== 1 ? "s are" : " is"} classified under this category. Deleting it would orphan {used !== 1 ? "those records" : "that record"}. Deactivate it instead to hide it from new nominations while preserving history.
                </p>
              ) : (
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.faint }}>
                  No nominations use this category. It will be removed from classification and the public site. This can’t be undone.
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Btn variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Btn>
                {used ? (
                  <Btn variant="soft" onClick={() => { setCategories((cs) => cs.map((c) => (c.id === confirmDel.id ? { ...c, active: false } : c))); setConfirmDel(null); }}>
                    Deactivate instead
                  </Btn>
                ) : (
                  <Btn variant="danger" onClick={deleteCat}><Trash2 size={15} /> Delete</Btn>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* raise-clarification modal (from a nomination detail) */}
      {clarifyFor && (
        <ClarifyModal nom={clarifyFor} onClose={() => setClarifyFor(null)}
          onSend={(text) => { onClarify(clarifyFor.id, text); setClarifyFor(null); }} />
      )}
    </div>
  );
}

function ClarifyModal({ nom, onClose, onSend }) {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4" style={{ background: "rgba(18,37,33,0.42)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6" style={{ boxShadow: "0 20px 50px rgba(18,37,33,0.25)" }} onClick={(e) => e.stopPropagation()}>
        <div className="pb-4" style={{ borderBottom: `1px solid ${C.hairline}` }}>
          <h3 className="ff-display text-xl" style={{ color: C.inkSerif }}>Raise clarification</h3>
          <div className="ff-mono mt-1 text-[11px]" style={{ color: C.faint }}>{nom.id} · {nom.company}</div>
        </div>
        <div className="mt-4">
          <Field label="Message to applicant" req>
            <textarea rows={4} className={inputCls} style={inputStyle} value={text} onChange={(e) => setText(e.target.value)} autoFocus placeholder="e.g. The uploaded Chairman's message is not legible. Please re-upload a clear PDF." />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: C.faint }}><input type="checkbox" defaultChecked style={{ accentColor: C.green }} /> notify by email + SMS</label>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="soft" onClick={() => onSend(text.trim())} disabled={!text.trim()}><Send size={15} /> Send &amp; flag</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOMINATION PREVIEW — full captured data, shared by member "View" + admin
// ============================================================================
function NominationModal({ nom, onClose }) {
  const p = nom.contacts?.primary, s = nom.contacts?.secondary;
  const fields = [
    ["Official email", nom.email], ["Listing", nom.listing], ["Market capitalisation", nom.cap],
    ["Sector", nom.sector], ["Nomination category", nom.category], ["Documents uploaded", `${nom.docs} files`],
  ];
  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" style={{ background: "rgba(18,37,33,0.5)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white" style={{ boxShadow: "0 24px 60px rgba(18,37,33,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b bg-white px-6 py-5" style={{ borderColor: C.hairline }}>
          <div>
            <div className="flex items-center gap-2.5"><h3 className="ff-display text-xl" style={{ color: C.inkSerif }}>{nom.company}</h3><Pill status={nom.status} /></div>
            <div className="ff-mono mt-1 text-[11px]" style={{ color: C.faint }}>{nom.id} · submitted {nom.submitted}</div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full transition hover:bg-black/[0.05]" style={{ color: C.faint }}><X size={18} /></button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <SectionLabel>Company &amp; classification</SectionLabel>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {fields.map(([k, v]) => (
                <div key={k}><dt className="lbl text-[10px]" style={{ color: C.faint }}>{k}</dt><dd className="mt-0.5 text-sm font-medium" style={{ color: C.ink }}>{v || "—"}</dd></div>
              ))}
            </dl>
          </div>

          <div>
            <SectionLabel>Contact persons</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              {[["Primary", p], ["Secondary", s]].map(([label, c]) => (
                <div key={label} className="rounded-[4px] border p-3.5" style={{ borderColor: C.hairline }}>
                  <div className="lbl text-[10px]" style={{ color: C.leaf }}>{label} contact</div>
                  {c && (c.name || c.email) ? (
                    <div className="mt-1.5 text-sm" style={{ color: C.ink }}>
                      <div className="font-medium">{c.name || "—"}</div>
                      <div className="text-xs" style={{ color: C.faint }}>{c.desig || "—"}</div>
                      <div className="ff-mono mt-1 text-[11px]" style={{ color: C.body }}>{c.mobile || "—"} · {c.email || "—"}</div>
                    </div>
                  ) : <div className="mt-1.5 text-sm" style={{ color: C.mist }}>Not provided</div>}
                </div>
              ))}
            </div>
          </div>

          {nom.clarification && (
            <div>
              <SectionLabel>Clarification thread</SectionLabel>
              <div className="py-1 pl-3.5" style={{ borderLeft: `2px solid ${STATUS["Clarification Required"].c}` }}>
                <p className="text-xs" style={{ color: C.body }}><b>Admin:</b> {nom.clarification.message}</p>
                <p className="mt-1 text-xs" style={{ color: C.faint }}><b>Applicant:</b> {nom.clarification.response || "Awaiting response…"}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white px-6 py-4" style={{ borderColor: C.hairline }}>
          <Btn variant="outline" onClick={() => window.print()}><Download size={15} /> Download / print</Btn>
          <Btn onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ROOT — public site open; modules below are login-gated.
// ============================================================================
export default function App() {
  useFonts();
  const [route, setRoute] = useState("site");
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("dash");
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [noms, setNoms] = useState(SEED);          // shared nomination list (member ↔ admin)
  const [viewNom, setViewNom] = useState(null);    // nomination shown in the full-data preview modal

  const login = (role, d) => { setSession({ role, name: d.name, email: d.email }); setScreen("dash"); setRoute("app"); };
  const logout = () => { setSession(null); setRoute("site"); };

  // --- the loop: member submits → appears in admin; admin clarifies → member responds ---
  const addNom = (nom) => setNoms((ns) => [nom, ...ns]);
  const raiseClarification = (id, message) => setNoms((ns) => ns.map((n) =>
    n.id === id ? { ...n, status: "Clarification Required", updated: "just now", clarification: { message, at: "just now", response: null } } : n));
  const respondClarification = (id, response) => setNoms((ns) => ns.map((n) =>
    n.id === id ? { ...n, status: "Under Review", updated: "just now", clarification: { ...n.clarification, response } } : n));

  return (
    <div className="ff-sans min-h-screen" style={{ background: C.bg, fontFamily: "var(--sans)" }}>
      <header className="sticky top-0 z-20 border-b" style={{ borderColor: C.hairline, background: "rgba(245,247,242,0.82)", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <button className="flex items-center gap-2.5" onClick={() => { if (!session) setRoute("site"); }}>
            <img src="/logo-icai1.png" alt="ICAI" className="h-9 w-9 object-contain" />
            <div className="text-left leading-tight">
              <div className="ff-display text-[15px]" style={{ color: C.inkSerif }}>Sustainability Awards</div>
              <div className="lbl text-[9px]" style={{ color: C.leaf }}>SRSB · ICAI · Prototype</div>
            </div>
          </button>
          {!session ? (
            <Btn size="sm" onClick={() => setRoute("login")}><LogIn size={14} /> Log in</Btn>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: session.role === "admin" ? C.deep : C.leaf }}>
                  {session.role === "admin" ? <Shield size={14} /> : <Users size={14} />}
                </div>
                <div className="leading-tight">
                  <div className="text-[13px] font-semibold" style={{ color: C.ink }}>{session.name}</div>
                  <div className="lbl text-[9px]" style={{ color: C.faint }}>{session.role === "admin" ? "Administrator" : "Member · Applicant"}</div>
                </div>
              </div>
              <Btn size="sm" variant="outline" onClick={logout}><X size={14} /> Log out</Btn>
            </div>
          )}
        </div>
      </header>

      {!session && route === "site" && <PublicSite goLogin={() => setRoute("login")} categories={categories} />}
      {!session && route === "login" && <LoginScreen onLogin={login} onExit={() => setRoute("site")} />}
      {session?.role === "member" && screen === "dash" && (
        <ApplicantPortal
          startNomination={() => setScreen("wizard")}
          noms={noms.filter((n) => n.owner === session.email)}
          onView={setViewNom}
          onRespond={respondClarification}
        />
      )}
      {session?.role === "member" && screen === "wizard" && (
        <NominationWizard session={session} onExit={() => setScreen("dash")} onSubmit={(nom) => { addNom(nom); setScreen("dash"); }} />
      )}
      {session?.role === "admin" && (
        <AdminConsole categories={categories} setCategories={setCategories} noms={noms} onView={setViewNom} onClarify={raiseClarification} />
      )}

      {viewNom && <NominationModal nom={viewNom} onClose={() => setViewNom(null)} />}
    </div>
  );
}
