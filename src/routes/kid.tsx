import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { useState } from "react";

export const Route = createFileRoute("/kid")({
  component: KidLayout,
});

function KidLayout() {
  const { state, update } = useKidVolt();
  const loc = useLocation();
  const [authId, setAuthId] = useState<string | null>(null);

  if (state.children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-kid flex items-center justify-center p-5 text-fun-foreground text-center">
        <div>
          <div className="text-6xl">🤔</div>
          <h1 className="text-3xl font-bold mt-3">No profile yet!</h1>
          <p className="opacity-90 mt-1">Ask a parent to set you up.</p>
          <Link
            to="/parent"
            className="mt-6 inline-block px-6 py-3 rounded-full bg-white text-fun font-bold shadow-soft"
          >
            Open parent setup
          </Link>
        </div>
      </div>
    );
  }

  if (!state.activeChildId || !state.children.find((c) => c.id === state.activeChildId)) {
    return (
      <div className="min-h-screen bg-gradient-kid flex flex-col items-center justify-center p-5 text-fun-foreground text-center">
        <h1 className="text-4xl font-bold mb-8">Who's playing?</h1>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {state.children.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                update((s) => ({ ...s, activeChildId: c.id }));
                setAuthId(null);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-3xl p-6 transition flex flex-col items-center gap-3 shadow-soft hover:scale-105"
            >
              <div className="text-6xl">{c.emoji}</div>
              <div className="font-bold text-xl">{c.name}</div>
            </button>
          ))}
        </div>
        <Link to="/" className="mt-12 text-white/70 hover:text-white underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const activeChild = state.children.find((c) => c.id === state.activeChildId)!;
  if (authId !== state.activeChildId) {
    return (
      <KidLogin 
        child={activeChild} 
        onSuccess={() => setAuthId(state.activeChildId)} 
        onBack={() => {
          update((s) => ({ ...s, activeChildId: null }));
          setAuthId(null);
        }} 
      />
    );
  }

  const tabs = [
    { to: "/kid", label: "Home", emoji: "🏠" },
    { to: "/kid/quiz", label: "Quiz", emoji: "🧠" },
    { to: "/kid/game", label: "Game", emoji: "🎮" },
    { to: "/kid/tasks", label: "Tasks", emoji: "✅" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {loc.pathname === "/kid" ? <KidHome /> : <Outlet />}
      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {tabs.map((t) => {
            const active = loc.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to as any}
                className={`flex flex-col items-center py-3 text-xs font-semibold transition ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <span className={`text-2xl transition ${active ? "scale-125" : ""}`}>
                  {t.emoji}
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function KidHome() {
  const { state, update } = useKidVolt();
  const c = state.children.find((ch) => ch.id === state.activeChildId)!;
  const total = c.wallet.savings + c.wallet.spendable;
  const xpPct = (c.xp.current / c.xp.max) * 100;

  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="text-5xl animate-float cursor-pointer"
            title="Switch Profile"
            onClick={() => update((s) => ({ ...s, activeChildId: null }))}
          >
            {c.emoji}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Hey hero,</div>
            <div className="font-bold text-2xl">{c.name}!</div>
            {state.children.length > 1 && (
              <button
                onClick={() => update((s) => ({ ...s, activeChildId: null }))}
                className="mt-1 text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-bold shadow-sm inline-flex items-center gap-1 active:scale-95 transition"
              >
                🔄 Swap Kid
              </button>
            )}
          </div>
        </div>
        <Link
          to="/parent"
          className="text-xs text-muted-foreground bg-accent/20 px-2 py-1 rounded-lg"
        >
          Parent →
        </Link>
      </div>

      {/* Virtual Debit Card (If active) */}
      {c.card.status !== "unapplied" && (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="font-bold">My Card</h2>
            <span className="text-xs text-muted-foreground">
              {c.card.status === "frozen" ? "Frozen ❄️" : "Active ✅"}
            </span>
          </div>
          <div
            className={`relative w-full aspect-[1.6/1] rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-fuchsia-500/30 border border-white/10 ${c.card.status === "frozen" ? "bg-slate-700 grayscale" : "bg-gradient-to-br from-slate-900 via-fuchsia-900 to-indigo-900"}`}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-white/0 pointer-events-none mix-blend-overlay" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Personal Avatar Watermark */}
            <div className="absolute -right-8 -bottom-10 text-[180px] opacity-[0.08] pointer-events-none select-none z-0 rotate-[-15deg] mix-blend-overlay">
              {c.emoji}
            </div>

            {c.card.status === "frozen" && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-md z-20">
                <span className="font-black tracking-widest text-xl drop-shadow-md text-white flex items-center gap-2">
                  <span>❄️</span> FROZEN
                </span>
              </div>
            )}

            <div className="flex justify-between items-start z-10 relative">
              <div className="font-black italic tracking-wider text-2xl drop-shadow-md flex items-center gap-2">
                <div className="bg-white text-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                KidVolt
              </div>
              <div className="flex flex-col items-end">
                <div className="text-[10px] uppercase tracking-widest opacity-80 font-semibold mb-0.5 flex items-center gap-1">
                  Spendable
                </div>
                <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                  ₹{c.wallet.spendable}
                </div>
              </div>
            </div>

            <div className="z-10 relative mt-auto">
              <div className="flex items-center gap-2 mb-4">
                {/* EMV Chip */}
                <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md shadow-inner flex items-center justify-center overflow-hidden border border-yellow-500/50 relative">
                  <div className="w-full h-[1px] bg-yellow-700/30 absolute top-1/2" />
                  <div className="w-[1px] h-full bg-yellow-700/30 absolute left-1/2" />
                  <div className="w-5 h-4 border border-yellow-700/30 rounded-[2px]" />
                </div>
                {/* Contactless Icon */}
                <svg
                  className="w-5 h-5 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2.5-1.289-3.268" />
                  <path d="M11.5 17.5A6.5 6.5 0 0015 12c0-3.59-1.38-6.5-3.32-8.358" />
                  <path d="M15 21c3.5 0 6.5-3.5 6.5-9s-3-9-6.5-9" />
                </svg>
              </div>

              <div className="font-mono text-2xl tracking-[0.1em] mb-2 drop-shadow-sm text-white/95">
                {c.card.number}
              </div>
              <div className="flex justify-between items-end text-sm uppercase tracking-wider">
                <div>
                  <div className="text-[8px] opacity-70 mb-0.5 font-semibold">Cardholder</div>
                  <div className="font-bold drop-shadow-sm truncate max-w-[150px] flex items-center gap-1.5">
                    <span className="text-lg leading-none">{c.emoji}</span> {c.name}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[8px] opacity-70 mb-0.5 font-semibold">Expires</div>
                    <div className="font-bold drop-shadow-sm">12/28</div>
                  </div>
                  {/* Fake Mastercard circles */}
                  <div className="flex -space-x-3 opacity-90 relative">
                    <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen" />
                    <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-screen" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet card */}
      <div className="mt-5 rounded-3xl bg-gradient-coin text-accent-foreground p-6 shadow-soft relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-8xl opacity-20">💰</div>
        <div className="text-xs font-bold uppercase tracking-wider opacity-80">Total wallet</div>
        <div className="text-5xl font-bold mt-1">₹{total}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/40 backdrop-blur rounded-2xl p-3">
            <div className="text-xs opacity-80">🏦 Saved</div>
            <div className="font-bold text-xl">₹{c.wallet.savings}</div>
          </div>
          <div className="bg-white/40 backdrop-blur rounded-2xl p-3">
            <div className="text-xs opacity-80">💸 Spendable</div>
            <div className="font-bold text-xl">₹{c.wallet.spendable}</div>
          </div>
        </div>
      </div>

      {/* XP battery */}
      <div className="mt-4 rounded-3xl bg-card border p-5 shadow-soft">
        <div className="flex justify-between items-center">
          <div className="font-bold flex items-center gap-2">
            <img src="/kidvolt-logo.png" alt="Energy" className="w-6 h-6 animate-bolt" /> Energy
          </div>
          <div className="text-sm font-bold">
            {c.xp.current}/{c.xp.max}
          </div>
        </div>
        <div className="mt-3 h-5 rounded-full bg-muted overflow-hidden border-2 border-foreground/10">
          <div className="h-full bg-gradient-xp transition-all" style={{ width: `${xpPct}%` }} />
        </div>
        {c.xp.current === 0 && (
          <p className="text-xs text-destructive font-semibold mt-2">
            ⚠️ Out of energy! Do a task to recharge.
          </p>
        )}
      </div>

      {/* Financial Tools */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <Link
          to="/kid/scanner"
          className="rounded-3xl bg-slate-900 text-white p-5 shadow-soft active:scale-95 transition flex flex-col items-center justify-center text-center"
        >
          <div className="text-4xl mb-2">📷</div>
          <div className="font-bold">Scan to Pay</div>
          <div className="text-[10px] opacity-70 uppercase tracking-wider mt-1">UPI / QR</div>
        </Link>
        <Link
          to="/kid/invest"
          className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 shadow-soft active:scale-95 transition flex flex-col items-center justify-center text-center"
        >
          <div className="text-4xl mb-2">📈</div>
          <div className="font-bold">Invest</div>
          <div className="text-[10px] opacity-70 uppercase tracking-wider mt-1">Stocks & ETFs</div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Link
          to="/kid/quiz"
          className="rounded-3xl bg-fun text-fun-foreground p-5 shadow-soft active:scale-95 transition"
        >
          <div className="text-4xl">🧠</div>
          <div className="font-bold mt-2">Smart Quiz</div>
          <div className="text-xs opacity-90">Earn XP</div>
        </Link>
        <Link
          to="/kid/rewards"
          className="rounded-3xl bg-amber-400 text-amber-950 p-5 shadow-soft active:scale-95 transition"
        >
          <div className="text-4xl">🎁</div>
          <div className="font-bold mt-2">Reward Store</div>
          <div className="text-xs opacity-90">Spend XP</div>
        </Link>
        <Link
          to="/kid/game"
          className="rounded-3xl bg-primary text-primary-foreground p-5 shadow-soft active:scale-95 transition"
        >
          <div className="text-4xl">🎮</div>
          <div className="font-bold mt-2">Coin Catcher</div>
          <div className="text-xs opacity-90">Tap to win</div>
        </Link>
        <Link
          to="/kid/tasks"
          className="col-span-2 rounded-3xl bg-secondary text-secondary-foreground p-5 shadow-soft active:scale-95 transition flex items-center justify-between"
        >
          <div>
            <div className="font-bold text-lg">✅ My Tasks</div>
            <div className="text-xs opacity-80">
              {c.tasks.filter((t: any) => t.status === "open").length} waiting · earn big ₹
            </div>
          </div>
          <div className="text-4xl">→</div>
        </Link>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-6">
        Real money, secure platform. Backed by partner banks.
      </p>
    </div>
  );
}

function KidLogin({ child, onSuccess, onBack }: any) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === child.pin) {
          setTimeout(onSuccess, 300);
        } else {
          setTimeout(() => {
            setError(true);
            setPin("");
          }, 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-kid flex flex-col items-center justify-center p-5 text-fun-foreground text-center relative overflow-hidden">
      <div className="absolute top-10 left-10 text-8xl opacity-10">🔐</div>
      <div className="absolute bottom-10 right-10 text-8xl opacity-10">🛡️</div>
      <button onClick={onBack} className="absolute top-5 left-5 text-white/70 hover:text-white text-sm font-bold bg-white/10 px-4 py-2 rounded-full">← Switch User</button>
      
      <div className="text-7xl mb-4 animate-bounce">{child.emoji}</div>
      <h1 className="text-4xl font-black mb-2">Welcome, {child.name}!</h1>
      <p className="text-white/80 mb-8 font-semibold">Enter your secret Vault Code</p>

      <div className="flex gap-4 mb-10">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl font-black transition-all ${pin.length > i ? 'bg-white text-black scale-110 shadow-[0_0_15px_white]' : 'bg-white/20 text-transparent border-2 border-white/30'} ${error ? 'bg-red-500 border-red-500 shadow-[0_0_15px_red] animate-shake' : ''}`}>
            {pin.length > i ? "★" : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button key={num} onClick={() => handlePress(num.toString())} className="h-16 rounded-2xl bg-white/10 hover:bg-white/25 active:bg-white/40 text-2xl font-black border border-white/20 shadow-soft backdrop-blur transition-all active:scale-95 text-white">
            {num}
          </button>
        ))}
        <button onClick={() => setPin(pin.slice(0,-1))} className="h-16 rounded-2xl bg-red-500/20 hover:bg-red-500/40 text-xl font-black border border-red-500/30 text-white/90">
          ⌫
        </button>
        <button onClick={() => handlePress("0")} className="h-16 rounded-2xl bg-white/10 hover:bg-white/25 active:bg-white/40 text-2xl font-black border border-white/20 shadow-soft backdrop-blur transition-all active:scale-95 text-white">
          0
        </button>
        <button onClick={() => alert("Ask your parent to open the Family Security Center to reset your PIN!")} className="h-16 rounded-2xl bg-blue-500/20 hover:bg-blue-500/40 text-[10px] uppercase tracking-wider font-bold border border-blue-500/30 text-white/90 px-1 leading-tight flex items-center justify-center text-center">
          Forgot PIN?
        </button>
      </div>
      
      {error && <p className="text-red-300 font-bold mt-6 animate-pulse">Oops! Wrong code. Try again!</p>}
    </div>
  );
}
