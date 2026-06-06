import { useState, useEffect, useRef, useCallback } from "react";

const AUTO_SEC = 7;

const CHAPTERS = [
  { id: "known", label: "The Known",  color: "#6b7280", accent: "#6b7280", emoji: "📺" },
  { id: "aha",   label: "The Aha",    color: "#92400e", accent: "#b45309", emoji: "💡" },
];

const PAGES = [
  { type: "cover" },
  { type: "chapter", chapter: "known" },
  {
    type: "story", chapter: "known", num: "K1",
    accent: "#b91c1c",
    eyebrow: "Everyone says it. Here's the proof.",
    headline: "Score first.\nWin almost\n¾ of the time.",
    story: [
      "In **886** World Cup matches where at least one goal was scored, the team that struck first won **72.8%** of the time.",
      "They lost just **14 in every 100**. Even the away team, scoring first from a disadvantaged position, won **57.7%** — against a baseline of just 25%.",
    ],
    punchline: "You already knew this. Every pundit does.",
    caveat: "Confirmed — but not surprising.",
    viz: { type: "three-boxes", items: [
      { label: "Win",  val: "72.8%", color: "#15803d" },
      { label: "Draw", val: "12.8%", color: "#6b7280" },
      { label: "Lose", val: "14.4%", color: "#b91c1c" },
    ]},
    tag: "886 matches · 1930–2022",
  },
  {
    type: "story", chapter: "known", num: "K2",
    accent: "#b91c1c",
    eyebrow: "Tell me something I don't know.",
    headline: "Red card.\nHome team now\nwins just 18%.",
    story: [
      "Normal match: the home team wins **57.8%** of the time — a healthy advantage.",
      "Their player gets sent off: that crashes to **17.9%**. A **40-point collapse** in one referee's decision.",
    ],
    punchline: "Every commentator says \"this changes the game.\" They're right.",
    caveat: "Real and significant — but universally understood.",
    viz: { type: "compare-bars", items: [
      { label: "Clean game",         val: 57.8, color: "#15803d" },
      { label: "Home gets red card", val: 17.9, color: "#b91c1c" },
      { label: "Away gets red card", val: 68.4, color: "#1d4ed8" },
    ], label: "Home team win %" },
    tag: "39 isolated red-card matches",
  },
  {
    type: "story", chapter: "known", num: "K3",
    accent: "#b45309",
    eyebrow: "Tension breeds aggression.",
    headline: "More cards\nin a game?\nThe score is\nprobably tight.",
    story: [
      "Matches with **5 or more bookings** end with an average margin of just **1.15 goals**.",
      "Calm, low-card matches? The margin stretches to **1.87 goals**. Teams foul when desperate — which is when scores are close.",
    ],
    punchline: "Cards don't cause the tension. They ARE the tension.",
    caveat: "True — any fan who has watched 10 matches feels this already.",
    viz: { type: "gradient-bars", items: [
      { label: "0 cards",   val: 1.87 },
      { label: "1–2 cards", val: 1.54 },
      { label: "3–4 cards", val: 1.37 },
      { label: "5–7 cards", val: 1.16 },
      { label: "8+ cards",  val: 1.09 },
    ], label: "Avg goal margin — lower means a tighter match" },
    tag: "964 men's World Cup matches",
  },
  { type: "chapter", chapter: "aha" },
  {
    type: "story", chapter: "aha", num: "A1",
    accent: "#15803d",
    eyebrow: "Wait. Really?",
    headline: "The Soviet\nUnion were\nbetter than\nBrazil in groups.",
    story: [
      "The USSR won **58.3%** of group stage matches — better than Brazil's group stage win rate. Physical, gifted, dominant.",
      "Then the knockout rounds started. They won just **14.3%** — one win in seven attempts. The most group-dominant major nation in history, invisible when it mattered.",
    ],
    punchline: "They were excellent at the part of the tournament that doesn't count.",
    caveat: null,
    viz: { type: "arrow-chart", items: [
      { team: "Italy",   group: 44, ko: 74 },
      { team: "France",  group: 47, ko: 70 },
      { team: "Brazil",  group: 70, ko: 69 },
      { team: "USSR",    group: 58, ko: 14 },
      { team: "Mexico",  group: 32, ko: 10 },
    ]},
    tag: "Full group vs knockout records · 1930–2022",
  },
  {
    type: "story", chapter: "aha", num: "A2",
    accent: "#1d4ed8",
    eyebrow: "The beautiful losers — with numbers.",
    headline: "Netherlands:\nthe most gifted\nteam that never\nwon anything.",
    story: [
      "Netherlands win **63.6%** of group games — better than Argentina, Italy, and France. Total Football. Three finals.",
      "In knockout rounds they win just **45.5%**. A **−18 point collapse**. The data puts a precise number on 50 years of heartbreak.",
    ],
    punchline: "They are statistically the best team at not winning the World Cup.",
    caveat: null,
    viz: { type: "arrow-chart", items: [
      { team: "W.Germany",   group: 58, ko: 71 },
      { team: "Italy",       group: 44, ko: 74 },
      { team: "Argentina",   group: 58, ko: 66 },
      { team: "Netherlands", group: 64, ko: 45 },
      { team: "USSR",        group: 58, ko: 14 },
    ]},
    tag: "Min 5 knockout appearances each",
  },
  {
    type: "story", chapter: "aha", num: "A3",
    accent: "#b45309",
    eyebrow: "The number nobody ever mentions.",
    headline: "West Germany\nhit 92.9%\nfrom the spot.\nPerfect.",
    story: [
      "West Germany converted **13 of 14** penalty kicks in shootouts — **92.9%**. They won all three shootouts they entered.",
      "England converts 57.9%. The gap is **35 percentage points** of structural difference. We obsess over England's misses. Nobody asks why West Germany never missed.",
    ],
    punchline: "The England story is everywhere. The West Germany story is invisible.",
    caveat: null,
    viz: { type: "penalty-grid", items: [
      { team: "W. Germany", rate: 92.9, color: "#b45309" },
      { team: "Argentina",  rate: 80.6, color: "#15803d" },
      { team: "Croatia",    rate: 77.8, color: "#1d4ed8" },
      { team: "Brazil",     rate: 68.2, color: "#15803d" },
      { team: "England",    rate: 57.9, color: "#b91c1c" },
      { team: "Mexico",     rate: 28.6, color: "#7f1d1d" },
    ]},
    tag: "320 shootout penalties · men's WC only",
  },
  {
    type: "story", chapter: "aha", num: "A4",
    accent: "#6d28d9",
    eyebrow: "The game now has a hidden chapter.",
    headline: "1 in 10 goals\nis scored after\nthe clock\nshould have\nstopped.",
    story: [
      "Before 1990 — zero stoppage time goals in World Cup records. The 90th minute was the end.",
      "Since 2010, **10.2%** of all goals happen after the 90th minute. Qatar 2022 saw a goal in the **90+13th minute**. The final whistle is not where you think it is.",
    ],
    punchline: "The 93rd minute isn't extra time. It's the game now.",
    caveat: null,
    viz: { type: "stoppage-bars", items: [
      { label: "Pre-1990",  pct: 0,    note: "Not tracked" },
      { label: "1990–2009", pct: 6.4,  note: "47 goals" },
      { label: "2010–2022", pct: 10.2, note: "67 goals" },
    ]},
    tag: "2,720 goals · men's World Cup",
  },
  { type: "end" },
];

// ── Pitch SVG background ──────────────────────────────────
function PitchBg({ opacity = 0.028 }) {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
      viewBox="0 0 780 460" preserveAspectRatio="xMidYMid slice">
      <g stroke="#1a3a1a" strokeWidth="1.2" fill="none" opacity={opacity * 35}>
        {/* pitch outline */}
        <rect x="30" y="24" width="720" height="412" />
        {/* halfway line */}
        <line x1="390" y1="24" x2="390" y2="436" />
        {/* centre circle */}
        <circle cx="390" cy="230" r="70" />
        <circle cx="390" cy="230" r="3" fill="#1a3a1a" />
        {/* left penalty box */}
        <rect x="30" y="126" width="132" height="208" />
        {/* left 6-yard box */}
        <rect x="30" y="178" width="44" height="104" />
        {/* right penalty box */}
        <rect x="618" y="126" width="132" height="208" />
        {/* right 6-yard box */}
        <rect x="706" y="178" width="44" height="104" />
        {/* penalty spots */}
        <circle cx="142" cy="230" r="3" fill="#1a3a1a" />
        <circle cx="638" cy="230" r="3" fill="#1a3a1a" />
        {/* corner arcs */}
        <path d="M30,40 Q46,24 62,24" />
        <path d="M718,24 Q750,24 750,40" />
        <path d="M30,420 Q30,436 46,436" />
        <path d="M734,436 Q750,436 750,420" />
      </g>
    </svg>
  );
}

// ── Animated bar ──────────────────────────────────────────
function AnimBar({ val, max=100, color, delay=0, h=10 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setW((val/max)*100), delay);
    }, { threshold:0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [val,max,delay]);
  return (
    <div ref={ref} style={{ height:h, background:"#e5e7eb", borderRadius:h/2, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:h/2,
        transition:`width 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }} />
    </div>
  );
}

// ── Viz ───────────────────────────────────────────────────
function ThreeBoxes({ items }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {items.map(({ label, val, color }) => (
        <div key={label} style={{ flex:1, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:6, padding:"14px 8px", textAlign:"center" }}>
          <div style={{ fontSize:22, fontWeight:700, color, fontFamily:"Georgia,serif" }}>{val}</div>
          <div style={{ fontSize:10, color:"#9ca3af", marginTop:5, letterSpacing:1, fontFamily:"monospace" }}>{label.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

function CompareBars({ items, label }) {
  const max = Math.max(...items.map(d=>d.val));
  return (
    <div style={{ width:"100%" }}>
      {items.map(({ label:lbl, val, color }, i) => (
        <div key={lbl} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12, color:"#6b7280", fontFamily:"monospace" }}>{lbl}</span>
            <span style={{ fontSize:13, color, fontWeight:700, fontFamily:"monospace" }}>{val}%</span>
          </div>
          <AnimBar val={val} max={max} color={color} delay={i*100} />
        </div>
      ))}
      <div style={{ fontSize:11, color:"#d1d5db", marginTop:8, fontStyle:"italic" }}>{label}</div>
    </div>
  );
}

function GradientBars({ items, label }) {
  const max = Math.max(...items.map(d=>d.val));
  const colors = ["#9ca3af","#6b7280","#b45309","#dc2626","#991b1b"];
  return (
    <div style={{ width:"100%" }}>
      {items.map(({ label:lbl, val }, i) => (
        <div key={lbl} style={{ marginBottom:11 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ fontSize:12, color:"#6b7280", fontFamily:"monospace" }}>{lbl}</span>
            <span style={{ fontSize:13, color:colors[i], fontWeight:700, fontFamily:"monospace" }}>{val}</span>
          </div>
          <AnimBar val={val} max={max} color={colors[i]} delay={i*80} />
        </div>
      ))}
      <div style={{ fontSize:11, color:"#d1d5db", marginTop:8, fontStyle:"italic" }}>{label}</div>
    </div>
  );
}

function ArrowChart({ items }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(()=>setVis(true),100);
    },{ threshold:0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  },[]);
  return (
    <div ref={ref} style={{ width:"100%" }}>
      {items.map(({ team, group, ko },i) => {
        const up = ko > group;
        const ac = up ? "#15803d" : "#b91c1c";
        return (
          <div key={team} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:13,
            opacity:vis?1:0, transform:vis?"none":"translateX(-10px)",
            transition:`all 0.5s ease ${i*90}ms` }}>
            <div style={{ width:68, fontSize:11, color:"#9ca3af", fontFamily:"'Times New Roman',Georgia,serif", textAlign:"right" }}>{team}</div>
            <div style={{ flex:1, position:"relative", height:6, background:"#e5e7eb", borderRadius:3 }}>
              <div style={{ position:"absolute", left:`${group}%`, top:"50%", transform:"translate(-50%,-50%)", width:10, height:10, borderRadius:"50%", background:"#d1d5db", border:"2px solid #fff", boxShadow:"0 0 0 1px #e5e7eb" }} />
              <div style={{ position:"absolute", left:`${Math.min(group,ko)}%`, width:`${Math.abs(ko-group)}%`, height:"100%", background:up?"#15803d30":"#b91c1c25" }} />
              <div style={{ position:"absolute", left:`${ko}%`, top:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:ac, border:"2px solid #fff", boxShadow:`0 1px 4px ${ac}80` }} />
            </div>
            <div style={{ fontSize:12, color:ac, fontFamily:"monospace", width:46, textAlign:"right", fontWeight:700 }}>
              {up?"+":""}{ko-group}pp
            </div>
          </div>
        );
      })}
      <div style={{ display:"flex", gap:16, marginTop:4, fontSize:10, color:"#d1d5db", fontFamily:"monospace" }}>
        <span>⚫ Groups</span><span style={{ color:"#15803d" }}>● Knockouts</span>
      </div>
    </div>
  );
}

function PenaltyGrid({ items }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(()=>setVis(true),100);
    },{ threshold:0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  },[]);
  return (
    <div ref={ref} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, width:"100%" }}>
      {items.map(({ team, rate, color },i) => (
        <div key={team} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:6, padding:"10px 12px",
          opacity:vis?1:0, transform:vis?"none":"scale(0.93)",
          transition:`all 0.4s ease ${i*70}ms` }}>
          <div style={{ fontSize:11, color:"#9ca3af", fontFamily:"monospace", marginBottom:3 }}>{team}</div>
          <div style={{ fontSize:22, fontWeight:700, color, fontFamily:"Georgia,serif" }}>{rate}%</div>
          <div style={{ height:4, background:"#e5e7eb", borderRadius:2, marginTop:6 }}>
            <div style={{ height:"100%", width:`${rate}%`, background:color, borderRadius:2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StoppageBars({ items, accent }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(()=>setVis(true),100);
    },{ threshold:0.2 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  },[]);
  return (
    <div ref={ref} style={{ width:"100%", display:"flex", flexDirection:"column", gap:14 }}>
      {items.map(({ label, pct, note },i) => (
        <div key={label} style={{ opacity:vis?1:0, transform:vis?"none":"translateY(8px)", transition:`all 0.5s ease ${i*130}ms` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"#6b7280", fontFamily:"monospace" }}>{label}</span>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:10, color:"#d1d5db", fontFamily:"monospace" }}>{note}</span>
              <span style={{ fontSize:15, fontWeight:700, color:pct===0?"#e5e7eb":accent, fontFamily:"monospace" }}>
                {pct===0?"—":`${pct}%`}
              </span>
            </div>
          </div>
          <AnimBar val={pct*5.5} max={100} color={pct===0?"#e5e7eb":accent} delay={i*130} />
        </div>
      ))}
      <div style={{ fontSize:11, color:"#d1d5db", fontStyle:"italic" }}>% of all goals scored in stoppage time</div>
    </div>
  );
}

function Viz({ page }) {
  const { viz, accent } = page;
  if (!viz) return null;
  const t = viz.type;
  if (t==="three-boxes")   return <ThreeBoxes {...viz} />;
  if (t==="compare-bars")  return <CompareBars {...viz} />;
  if (t==="gradient-bars") return <GradientBars {...viz} />;
  if (t==="arrow-chart")   return <ArrowChart {...viz} />;
  if (t==="penalty-grid")  return <PenaltyGrid {...viz} />;
  if (t==="stoppage-bars") return <StoppageBars items={viz.items} accent={accent} />;
  return null;
}

function Bold({ text, accent }) {
  const parts=[], re=/\*\*(.+?)\*\*/g;
  let last=0, m;
  while ((m=re.exec(text))!==null) {
    if (m.index>last) parts.push({t:"t",v:text.slice(last,m.index)});
    parts.push({t:"b",v:m[1]}); last=re.lastIndex;
  }
  if (last<text.length) parts.push({t:"t",v:text.slice(last)});
  return <>{parts.map((p,i)=>p.t==="b"?<strong key={i} style={{color:accent,fontWeight:600}}>{p.v}</strong>:<span key={i}>{p.v}</span>)}</>;
}

// ── Page renderers ────────────────────────────────────────

function CoverPage() {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 28px", textAlign:"center", background:"#fffef9", position:"relative", overflow:"hidden" }}>
      <PitchBg opacity={0.022} />
      {/* newspaper-style top rule */}
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", flexDirection:"column" }}>
        <div style={{ height:4, background:"#1a1a1a" }} />
        <div style={{ height:1, background:"#1a1a1a", marginTop:3 }} />
      </div>
      <div style={{ position:"relative", paddingTop:8 }}>
        <div style={{ fontSize:9, letterSpacing:6, color:"#9ca3af", fontFamily:"'Times New Roman',Georgia,serif", marginBottom:6, textTransform:"uppercase" }}>
          World Cup · Data Edition · 1930–2022
        </div>
        {/* big masthead-style number */}
        <div style={{ fontSize:10, letterSpacing:3, color:"#d1d5db", fontFamily:"monospace", marginBottom:16 }}>
          964 matches · 2,720 goals · 22 tournaments
        </div>
        <h1 style={{ fontSize:"clamp(26px,7vw,44px)", fontFamily:"'Times New Roman',Georgia,serif", fontWeight:700, color:"#111827", lineHeight:1.1, marginBottom:6, letterSpacing:-0.5 }}>
          The World Cup
        </h1>
        <h1 style={{ fontSize:"clamp(26px,7vw,44px)", fontFamily:"'Times New Roman',Georgia,serif", fontWeight:400, color:"#111827", lineHeight:1.1, marginBottom:20, letterSpacing:-0.5, fontStyle:"italic" }}>
          You Think You Know
        </h1>
        {/* rule */}
        <div style={{ width:60, height:1, background:"#111827", margin:"0 auto 20px" }} />
        <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.75, maxWidth:300, margin:"0 auto 28px", fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic" }}>
          Two chapters. The facts everyone already knows — confirmed with numbers. And the ones nobody is talking about.
        </p>
        <div style={{ display:"flex", gap:28, justifyContent:"center" }}>
          {[["📺","The Known","#6b7280"],["💡","The Aha","#b45309"]].map(([e,l,c])=>(
            <div key={l}>
              <div style={{ fontSize:22 }}>{e}</div>
              <div style={{ fontSize:11, color:c, marginTop:5, fontFamily:"'Times New Roman',Georgia,serif", fontWeight:700, letterSpacing:0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterBreak({ page }) {
  const ch = CHAPTERS.find(c=>c.id===page.chapter);
  const isAha = ch.id==="aha";
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", background:isAha?"#fffdf4":"#f9fafb", position:"relative", overflow:"hidden" }}>
      <PitchBg opacity={isAha?0.025:0.018} />
      {/* chapter rule */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:isAha?4:2, background:isAha?ch.accent:"#e5e7eb" }} />
      <div style={{ position:"relative" }}>
        <div style={{ fontSize:10, letterSpacing:5, color:ch.color, fontFamily:"'Times New Roman',Georgia,serif", marginBottom:10, textTransform:"uppercase" }}>
          Chapter {isAha?"Two":"One"}
        </div>
        <div style={{ width:40, height:1, background:ch.accent, margin:"0 auto 16px" }} />
        <h2 style={{ fontSize:"clamp(32px,8vw,54px)", fontFamily:"'Times New Roman',Georgia,serif", fontWeight:isAha?700:400, fontStyle:isAha?"normal":"italic", color:ch.accent, marginBottom:16, letterSpacing:-1 }}>
          {ch.label}
        </h2>
        <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.75, maxWidth:270, fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic" }}>
          {isAha
            ? "Four findings hiding in 92 years of data — each one the sport hasn't properly reckoned with."
            : "Three things every pundit, coach, and serious fan already knows — confirmed with numbers."}
        </p>
        {isAha && (
          <div style={{ marginTop:24, display:"inline-block" }}>
            <div style={{ width:40, height:1, background:ch.accent, margin:"0 auto 12px" }} />
            <span style={{ fontSize:11, color:ch.accent, fontFamily:"monospace", letterSpacing:3 }}>NOW IT GETS INTERESTING</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryPage({ page, isMobile }) {
  const ch = CHAPTERS.find(c=>c.id===page.chapter);
  const isAha = ch.id==="aha";
  const [vis, setVis] = useState(false);
  useEffect(() => { const t=setTimeout(()=>setVis(true),60); return ()=>clearTimeout(t); }, [page.num]);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:isMobile?"column":"row", overflow:"hidden", background:"#fffef9", position:"relative" }}>
      <PitchBg opacity={0.018} />
      {/* top rule */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:isAha?3:2, background:isAha?page.accent:"#e5e7eb", zIndex:2 }} />

      {/* Left / story */}
      <div style={{ flex:1, padding:isMobile?"20px 18px 16px":"30px 28px", display:"flex", flexDirection:"column", justifyContent:"center", borderRight:isMobile?"none":"1px solid #e5e7eb", borderBottom:isMobile?"1px solid #e5e7eb":"none", position:"relative", zIndex:1, overflow:"hidden" }}>
        {/* faint page number */}
        <div style={{ position:"absolute", right:-6, bottom:-6, fontSize:120, fontFamily:"'Times New Roman',Georgia,serif", color:"#f3f4f6", fontWeight:700, userSelect:"none", lineHeight:1, zIndex:0 }}>{page.num}</div>

        <div style={{ position:"relative", zIndex:1, opacity:vis?1:0, transform:vis?"none":"translateY(10px)", transition:"all 0.45s ease" }}>
          {/* chapter label */}
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:9, letterSpacing:2, color:ch.color, fontFamily:"monospace", textTransform:"uppercase",
              background:`${ch.accent}12`, border:`1px solid ${ch.accent}28`, borderRadius:2, padding:"3px 8px" }}>
              {ch.emoji} {ch.label}
            </span>
            <span style={{ fontSize:9, color:"#d1d5db", fontFamily:"monospace" }}>{page.num}</span>
          </div>

          <div style={{ fontSize:11, color:"#9ca3af", fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic", marginBottom:10 }}>{page.eyebrow}</div>

          {/* NYT-style column rule above headline */}
          <div style={{ width:"100%", height:1, background:"#e5e7eb", marginBottom:14 }} />

          <h2 style={{ fontFamily:"'Times New Roman',Georgia,serif", fontSize:isMobile?"clamp(20px,5.5vw,26px)":"clamp(22px,3vw,32px)", fontWeight:700, color:"#111827", lineHeight:1.18, marginBottom:16, letterSpacing:-0.3 }}>
            {page.headline.split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br />}</span>)}
          </h2>

          {isMobile && <div style={{ marginBottom:16 }}><Viz page={page} /></div>}

          <div style={{ display:"flex", flexDirection:"column", gap:isMobile?8:10 }}>
            {page.story.map((s,i)=>(
              <p key={i} style={{ fontSize:isMobile?13:14, color:"#374151", lineHeight:1.75, fontFamily:"'Times New Roman',Georgia,serif",
                opacity:vis?1:0, transform:vis?"none":"translateY(6px)",
                transition:`all 0.45s ease ${(i+1)*100}ms` }}>
                <Bold text={s} accent={page.accent} />
              </p>
            ))}
          </div>

          {/* pull-quote style punchline */}
          <div style={{ marginTop:18, padding:"12px 16px", borderTop:`2px solid ${page.accent}`, borderBottom:`1px solid ${page.accent}40` }}>
            <p style={{ fontSize:isMobile?13:14, color:page.accent, fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic", lineHeight:1.55, fontWeight:isAha?700:400 }}>
              "{page.punchline}"
            </p>
          </div>

          {/* verdict for known */}
          {page.caveat && (
            <div style={{ marginTop:10, padding:"7px 11px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:3 }}>
              <span style={{ fontSize:10, color:"#9ca3af", fontFamily:"monospace", letterSpacing:1 }}>VERDICT: </span>
              <span style={{ fontSize:12, color:"#9ca3af", fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic" }}>{page.caveat}</span>
            </div>
          )}

          <div style={{ marginTop:12, fontSize:10, color:"#d1d5db", fontFamily:"monospace", letterSpacing:1 }}>{page.tag}</div>
        </div>
      </div>

      {/* Right / viz — desktop */}
      {!isMobile && (
        <div style={{ flex:"0 0 244px", padding:"30px 22px", display:"flex", flexDirection:"column", justifyContent:"center", gap:16, background:"#f9fafb", borderLeft:"1px solid #e5e7eb", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:9, letterSpacing:3, color:"#e5e7eb", fontFamily:"monospace", textAlign:"right" }}>{page.num}</div>
          <Viz page={page} />
        </div>
      )}
    </div>
  );
}

function EndPage({ onRestart }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", background:"#fffef9", position:"relative", overflow:"hidden" }}>
      <PitchBg opacity={0.022} />
      <div style={{ position:"absolute", top:0, left:0, right:0 }}>
        <div style={{ height:4, background:"#1a1a1a" }} />
        <div style={{ height:1, background:"#1a1a1a", marginTop:3 }} />
      </div>
      <div style={{ position:"relative" }}>
        <div style={{ fontSize:44, marginBottom:16 }}>🏆</div>
        <div style={{ width:40, height:1, background:"#111827", margin:"0 auto 16px" }} />
        <h2 style={{ fontFamily:"'Times New Roman',Georgia,serif", fontSize:28, color:"#111827", marginBottom:10, fontWeight:700 }}>Full time.</h2>
        <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.75, maxWidth:280, marginBottom:28, fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic" }}>
          Data: Fjelstul World Cup Database · 92 years of football, stress-tested and simplified.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:28 }}>
          {[["📺 The Known","3 confirmed facts","#6b7280"],["💡 The Aha","4 hidden stories","#b45309"]].map(([t,s,c])=>(
            <div key={t} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:6, padding:"14px 18px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:c, fontFamily:"'Times New Roman',Georgia,serif", fontWeight:700 }}>{t}</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:4, fontFamily:"'Times New Roman',Georgia,serif", fontStyle:"italic" }}>{s}</div>
            </div>
          ))}
        </div>
        <button onClick={onRestart} style={{ background:"#111827", color:"#fff", border:"none", padding:"12px 28px", borderRadius:3, fontSize:11, fontFamily:"monospace", letterSpacing:3, cursor:"pointer", fontWeight:700 }}>
          ↺ READ AGAIN
        </button>
        <div style={{ marginTop:24, fontSize:9, color:"#d1d5db", fontFamily:"monospace", letterSpacing:1, lineHeight:2 }}>
          github.com/jfjelstul/worldcup · Men's WC · 1930–2022
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────
export default function Flipbook() {
  const [cur, setCur]       = useState(0);
  const [flipping, setFl]   = useState(false);
  const [progress, setPr]   = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setMob]  = useState(false);
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const total = PAGES.length;

  useEffect(()=>{
    const check=()=>setMob(window.innerWidth<580);
    check(); window.addEventListener("resize",check);
    return ()=>window.removeEventListener("resize",check);
  },[]);

  const goTo = useCallback((idx)=>{
    if (flipping) return;
    setFl(true);
    setTimeout(()=>{ setCur(idx); setFl(false); setPr(0); startRef.current=null; },280);
  },[flipping]);

  const next = useCallback(()=>{ if(cur<total-1) goTo(cur+1); },[cur,total,goTo]);
  const prev = useCallback(()=>{ if(cur>0) goTo(cur-1); },[cur,goTo]);

  useEffect(()=>{
    if (paused) return;
    const dur=AUTO_SEC*1000;
    startRef.current=Date.now()-progress*dur;
    const tick=()=>{
      const p=Math.min((Date.now()-startRef.current)/dur,1);
      setPr(p);
      if (p>=1){ cur<total-1?goTo(cur+1):goTo(0); }
      else rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[cur,paused]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="ArrowRight") next();
      if(e.key==="ArrowLeft")  prev();
      if(e.key===" "){ e.preventDefault(); setPaused(p=>!p); }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[next,prev]);

  const page = PAGES[cur];
  const chDef = page.chapter ? CHAPTERS.find(c=>c.id===page.chapter) : null;
  const spineColor = page.accent || chDef?.accent || "#b45309";

  const knownIdx = PAGES.findIndex(p=>p.type==="chapter"&&p.chapter==="known");
  const ahaIdx   = PAGES.findIndex(p=>p.type==="chapter"&&p.chapter==="aha");

  return (
    <div style={{ background:"#e5e7eb", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:isMobile?"8px":"20px" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes flipIn{from{opacity:0;transform:perspective(900px) rotateY(-5deg) scale(0.98);}to{opacity:1;transform:perspective(900px) rotateY(0) scale(1);}}
      `}</style>

      <div style={{ width:"100%", maxWidth:isMobile?420:780, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Chapter tabs */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {[{label:"📺 The Known",idx:knownIdx,ch:"known"},{label:"💡 The Aha",idx:ahaIdx,ch:"aha"}].map(({label,idx,ch})=>{
            const c=CHAPTERS.find(x=>x.id===ch);
            const active=page.chapter===ch;
            return (
              <button key={ch} onClick={()=>goTo(idx)} style={{
                background:active?"#fff":"transparent",
                border:`1px solid ${active?c.accent:"#d1d5db"}`,
                color:active?c.accent:"#9ca3af",
                padding:"6px 14px", borderRadius:3, cursor:"pointer",
                fontSize:11, fontFamily:"'Times New Roman',Georgia,serif",
                fontWeight:active?700:400, letterSpacing:0.5,
                transition:"all 0.2s", boxShadow:active?"0 1px 4px #0001":"none"
              }}>{label}</button>
            );
          })}
          <div style={{ flex:1 }} />
          <span style={{ fontSize:10, color:"#9ca3af", fontFamily:"monospace" }}>{cur+1} / {total}</span>
        </div>

        {/* Book */}
        <div key={cur} style={{
          background:"#fff",
          border:"1px solid #d1d5db",
          borderRadius:isMobile?8:10,
          overflow:"hidden",
          display:"flex", flexDirection:"column",
          minHeight:isMobile?540:420,
          animation:"flipIn 0.28s cubic-bezier(0.22,1,0.36,1)",
          boxShadow:`0 1px 3px #0000001a, 0 4px 16px #00000012, inset 3px 0 0 ${spineColor}`,
        }}>
          {page.type==="cover"   && <CoverPage />}
          {page.type==="chapter" && <ChapterBreak page={page} />}
          {page.type==="story"   && <StoryPage page={page} isMobile={isMobile} />}
          {page.type==="end"     && <EndPage onRestart={()=>goTo(0)} />}
        </div>

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={prev} disabled={cur===0} style={{
            background:"#fff", border:"1px solid #d1d5db", color:cur===0?"#e5e7eb":"#6b7280",
            width:36, height:36, borderRadius:4, cursor:cur===0?"not-allowed":"pointer",
            fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 1px 2px #0000000f", flexShrink:0
          }}>‹</button>

          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
              {PAGES.map((p,i)=>{
                const dot=p.chapter?CHAPTERS.find(c=>c.id===p.chapter)?.accent:"#9ca3af";
                const isChap=p.type==="chapter";
                const active=cur===i;
                return (
                  <div key={i} onClick={()=>goTo(i)} style={{
                    width:active?22:isChap?10:7, height:7, borderRadius:4,
                    background:active?dot:isChap?dot+"55":"#d1d5db",
                    cursor:"pointer", transition:"all 0.3s ease",
                  }} />
                );
              })}
            </div>
            <div style={{ height:3, background:"#e5e7eb", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress*100}%`, background:spineColor, borderRadius:2, transition:"background 0.3s" }} />
            </div>
          </div>

          <button onClick={()=>setPaused(p=>!p)} style={{
            background:"#fff", border:"1px solid #d1d5db", color:"#6b7280",
            width:36, height:36, borderRadius:4, cursor:"pointer", fontSize:13,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 1px 2px #0000000f", flexShrink:0
          }}>{paused?"▶":"⏸"}</button>

          <button onClick={next} disabled={cur===total-1} style={{
            background:cur===total-1?"#fff":spineColor,
            border:`1px solid ${cur===total-1?"#d1d5db":spineColor}`,
            color:cur===total-1?"#d1d5db":"#fff",
            width:36, height:36, borderRadius:4,
            cursor:cur===total-1?"not-allowed":"pointer",
            fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:cur===total-1?"0 1px 2px #0000000f":`0 2px 8px ${spineColor}50`,
            flexShrink:0, fontWeight:700, transition:"all 0.2s"
          }}>›</button>
        </div>

        <div style={{ textAlign:"center", fontSize:9, color:"#9ca3af", fontFamily:"monospace", letterSpacing:1.5 }}>
          {paused?"PAUSED — SPACE TO RESUME":`AUTO · ${Math.ceil((1-progress)*AUTO_SEC)}s`} · ← → TO NAVIGATE
        </div>
      </div>
    </div>
  );
}
