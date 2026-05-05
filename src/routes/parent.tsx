import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { resetAll, ChildProfile, fundWallet } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { playSound } from "@/lib/utils";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/parent")({
  component: ParentRoute,
});

function ParentRoute() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();
  const [showAddChild, setShowAddChild] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup wizard if no parent yet
  if (!state.parent)
    return <Setup onDone={(name, pin) => update((s) => ({ ...s, parent: { name, pin } }))} />;

  if (!isAuthenticated) {
    return (
      <ParentLogin
        parent={state.parent}
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => nav({ to: "/" })}
      />
    );
  }

  if (state.children.length === 0 || showAddChild) {
    return (
      <ChildSetup
        onDone={(c) => {
          update((s) => ({
            ...s,
            children: [...s.children, c],
            activeChildId: s.children.length === 0 ? c.id : s.activeChildId,
          }));
          setShowAddChild(false);
        }}
        onCancel={state.children.length > 0 ? () => setShowAddChild(false) : undefined}
      />
    );
  }

  return (
    <Dashboard
      state={state}
      update={update}
      onAddChild={() => setShowAddChild(true)}
      onLogout={() => {
        if (confirm("Reset everything?")) {
          resetAll();
          nav({ to: "/" });
        }
      }}
    />
  );
}

function Setup({ onDone }: { onDone: (name: string, pin: string) => void }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  return (
    <div className="min-h-screen bg-gradient-parent flex items-center justify-center p-5">
      <div className="bg-card text-card-foreground rounded-3xl p-8 max-w-md w-full shadow-soft">
        <Link to="/" className="text-sm text-muted-foreground">
          ← Back
        </Link>
        <div className="text-5xl mt-4">👋</div>
        <h1 className="text-3xl font-bold mt-2">Welcome, parent!</h1>
        <p className="text-muted-foreground mt-1">Quick setup. No accounts, no email.</p>
        <label className="block mt-6 text-sm font-semibold">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="block mt-4 text-sm font-semibold">Create a Master PIN</label>
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="4-digit PIN"
          className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-center tracking-[1em] font-mono text-xl"
        />
        <button
          disabled={!name.trim() || pin.length !== 4}
          onClick={() => onDone(name.trim(), pin)}
          className="mt-6 w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 disabled:opacity-50 shadow-soft"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function ParentLogin({ parent, onSuccess, onCancel }: any) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin === parent.pin) {
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-parent flex items-center justify-center p-5">
      <div className="bg-card text-card-foreground rounded-3xl p-8 max-w-md w-full shadow-2xl border border-primary/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-5">🔒</div>
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <div className="text-5xl mt-4">🛡️</div>
        <h1 className="text-3xl font-bold mt-2">Parent Portal</h1>
        <p className="text-muted-foreground mt-1">Enter your Master PIN to access the dashboard.</p>
        
        <form onSubmit={handleSubmit} className="mt-8 relative z-10">
          <input
            autoFocus
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setError(false);
              setPin(e.target.value.replace(/[^0-9]/g, ""));
            }}
            placeholder="••••"
            className={`w-full rounded-2xl border-2 bg-background px-4 py-4 outline-none focus:ring-4 focus:ring-primary/20 text-center tracking-[1em] font-mono text-3xl transition-all ${error ? "border-destructive text-destructive animate-shake" : "border-primary/30"}`}
          />
          {error && <p className="text-destructive text-sm text-center mt-2 font-bold">Incorrect PIN. Try again.</p>}
          <button
            type="submit"
            disabled={pin.length !== 4}
            className="mt-6 w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 disabled:opacity-50 shadow-lg shadow-primary/30 hover:scale-[1.02] transition"
          >
            Unlock Dashboard 🔓
          </button>
        </form>
      </div>
    </div>
  );
}

function ChildSetup({
  onDone,
  onCancel,
}: {
  onDone: (c: ChildProfile) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [pin, setPin] = useState("1234");
  const emojis = ["🦊", "🐼", "🦄", "🐯", "🐸", "🦁", "🐶", "🐱", "🐵", "🐧", "🐙", "🦖"];

  const today = () => new Date().toISOString().slice(0, 10);

  const submit = () => {
    onDone({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji,
      pin: pin || "1234",
      wallet: { savings: 0, spendable: 0 },
      xp: { current: 80, max: 80, lastReset: today() },
      tasks: [
        {
          id: crypto.randomUUID(),
          title: "Make your bed",
          emoji: "🛏️",
          reward: 10,
          xp: 10,
          status: "open",
          createdAt: Date.now(),
        },
      ],
      rewardsRedeemed: [],
      activity: [],
      stats: { gamesPlayed: 0, quizzesDone: 0, totalEarned: 0 },
      card: { status: "unapplied", number: "", limit: 200 },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-parent flex items-center justify-center p-5">
      <div className="bg-card text-card-foreground rounded-3xl p-8 max-w-md w-full shadow-soft relative">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground font-bold text-xl"
          >
            ✕
          </button>
        )}
        <div className="text-5xl">👶👦👧</div>
        <h1 className="text-3xl font-bold mt-2">Add your kid/teen</h1>
        <label className="block mt-6 text-sm font-semibold">Kid/Teen's name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aarav"
          className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="block mt-4 text-sm font-semibold">Pick an avatar</label>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-3xl p-2 rounded-xl transition ${emoji === e ? "bg-accent scale-110 shadow-pop" : "bg-muted hover:bg-accent/50"}`}
            >
              {e}
            </button>
          ))}
        </div>
        <label className="block mt-4 text-sm font-semibold">Starting Vault PIN</label>
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-center tracking-[1em] font-mono text-xl"
        />
        <button
          disabled={!name.trim() || pin.length !== 4}
          onClick={submit}
          className="mt-6 w-full rounded-xl bg-primary text-primary-foreground font-bold py-3 disabled:opacity-50 shadow-soft"
        >
          Create profile →
        </button>
      </div>
    </div>
  );
}

function Dashboard({ state, update, onAddChild, onLogout }: any) {
  const [selectedChildId, setSelectedChildId] = useState(state.children[0]?.id);
  const [galaxyMode, setGalaxyMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  const allPendingTasks = state.children.flatMap((c: any) => 
    c.tasks.filter((t: any) => t.status === "submitted").map((t: any) => ({ ...t, childId: c.id }))
  );
  const prevPendingCountRef = useRef<number>(allPendingTasks.length);

  useEffect(() => {
    if (allPendingTasks.length > prevPendingCountRef.current) {
      toast("🔔 New Task Submitted!", {
        description: "A child has finished a task and is waiting for your review.",
      });
    }
    prevPendingCountRef.current = allPendingTasks.length;
  }, [allPendingTasks.length]);

  // Keep it synced if child gets deleted or something
  useEffect(() => {
    if (!state.children.find((c: any) => c.id === selectedChildId)) {
      setSelectedChildId(state.children[0]?.id);
    }
  }, [state.children, selectedChildId]);

  const child = state.children.find((c: any) => c.id === selectedChildId) || state.children[0];

  const [taskTitle, setTaskTitle] = useState("");
  const [taskReward, setTaskReward] = useState(20);
  const [taskEmoji, setTaskEmoji] = useState("✨");

  const [transferAmount, setTransferAmount] = useState("");
  const [transferDest, setTransferDest] = useState<"spendable" | "savings">("spendable");

  const addTask = () => {
    if (!taskTitle.trim() || !child) return;
    update((s: any) => ({
      ...s,
      children: s.children.map((c: any) =>
        c.id === child.id
          ? {
              ...c,
              tasks: [
                {
                  id: crypto.randomUUID(),
                  title: taskTitle,
                  emoji: taskEmoji,
                  reward: taskReward,
                  xp: Math.round(taskReward * 0.8),
                  status: "open",
                  createdAt: Date.now(),
                },
                ...c.tasks,
              ],
            }
          : c,
      ),
    }));
    setTaskTitle("");
  };

  const approve = (id: string) =>
    update((s: any) => {
      const c = s.children.find((x: any) => x.id === child.id);
      if (!c) return s;
      const t = c.tasks.find((x: any) => x.id === id);
      if (!t) return s;
      const save = Math.round((t.reward * s.settings.savingPct) / 100);
      const spend = t.reward - save;
      playSound("coin");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#10b981", "#FFC700"],
      });
      toast.success(`₹${t.reward} transferred to ${c.name}'s wallet!`);
      return {
        ...s,
        children: s.children.map((x: any) =>
          x.id === child.id
            ? {
                ...x,
                tasks: x.tasks.map((task: any) =>
                  task.id === id ? { ...task, status: "approved" } : task,
                ),
                wallet: { savings: x.wallet.savings + save, spendable: x.wallet.spendable + spend },
                xp: { ...x.xp, current: Math.min(x.xp.max, x.xp.current + t.xp) },
                stats: { ...x.stats, totalEarned: x.stats.totalEarned + t.reward },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `✅ Task approved: ${t.title}`,
                    delta: t.reward,
                  },
                  ...x.activity,
                ].slice(0, 30),
              }
            : x,
        ),
      };
    });

  const updateChildCard = (updater: (card: any) => any) => {
    update((s: any) => ({
      ...s,
      children: s.children.map((c: any) =>
        c.id === child.id ? { ...c, card: updater(c.card) } : c,
      ),
    }));
  };

  const updateChildXp = (max: number) => {
    update((s: any) => ({
      ...s,
      settings: { ...s.settings, dailyXp: max },
      children: s.children.map((c: any) => ({
        ...c,
        xp: { ...c.xp, max, current: Math.min(c.xp.current, max) },
      })),
    }));
  };

  if (!child) return null;

  const total = child.wallet.savings + child.wallet.spendable;
  const pending = child.tasks.filter((t: any) => t.status === "submitted");
  const pendingRewards = child.rewardsRedeemed?.filter((r: any) => r.status === "pending") || [];

  const fulfillReward = (id: string) =>
    update((s: any) => ({
      ...s,
      children: s.children.map((c: any) =>
        c.id === child.id
          ? {
              ...c,
              rewardsRedeemed: c.rewardsRedeemed.map((r: any) =>
                r.id === id ? { ...r, status: "fulfilled" } : r,
              ),
            }
          : c,
      ),
    }));

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-500 relative ${galaxyMode ? "galaxy-mode" : "bg-background"}`}
    >
      {galaxyMode && <div className="galaxy-stars" />}
      <div className="relative z-10">
        <header className="bg-gradient-parent text-primary-foreground px-5 py-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Parent dashboard</div>
              <div className="font-bold text-xl">Hi {state.parent.name} 👋</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGalaxyMode(!galaxyMode)}
                className="text-xs px-3 py-2 rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
              >
                {galaxyMode ? "☀️ Day Mode" : "🌌 Galaxy Mode"}
              </button>
              <Link
                to="/kid"
                className="text-xs px-3 py-2 rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
              >
                Kid/Teen view →
              </Link>
              <button
                onClick={onLogout}
                className="text-xs px-3 py-2 rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-5xl mx-auto mt-4 flex gap-4 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-bold transition-all ${activeTab === "dashboard" ? "text-white border-b-2 border-white pb-1" : "text-white/60 hover:text-white"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`font-bold transition-all ${activeTab === "history" ? "text-white border-b-2 border-white pb-1" : "text-white/60 hover:text-white"}`}
            >
              Transaction History
            </button>
          </div>

          {/* Child selector tabs */}
          <div className="max-w-5xl mx-auto mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {state.children.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition whitespace-nowrap ${selectedChildId === c.id ? "bg-white text-primary font-bold shadow-md scale-105" : "bg-white/10 hover:bg-white/20"}`}
              >
                <span>{c.emoji}</span> {c.name}
              </button>
            ))}
            <button
              onClick={onAddChild}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex-shrink-0"
              title="Add Child"
            >
              ➕
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-5 mt-6">
          {/* Child card */}
          <div className="bg-card border rounded-3xl p-5 shadow-soft flex items-center gap-4">
            <div className="text-5xl">{child.emoji}</div>
            <div className="flex-1">
              <div className="font-bold text-lg">{child.name}</div>
              <div className="text-xs text-muted-foreground">
                Daily XP: {child.xp.current}/{child.xp.max} · Saving {state.settings.savingPct}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total ₹</div>
              <div className="font-bold text-2xl">₹{total}</div>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Action Required Banner */}
              {allPendingTasks.length > 0 && (
                <div className="bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/30 rounded-2xl p-4 mt-4 flex items-center justify-between shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl animate-bounce">🔔</div>
                    <div>
                      <div className="font-bold text-warning-foreground">Action Required</div>
                      <div className="text-sm text-warning-foreground/80">
                        You have {allPendingTasks.length} task{allPendingTasks.length > 1 ? "s" : ""} waiting for your approval!
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (allPendingTasks[0].childId !== selectedChildId) {
                        setSelectedChildId(allPendingTasks[0].childId);
                      }
                      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                    }} 
                    className="bg-warning text-warning-foreground px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:scale-105 transition"
                  >
                    Review Now
                  </button>
                </div>
              )}
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <Stat label="Earned" value={`₹${child.stats.totalEarned}`} emoji="💰" />
                <Stat label="Saved" value={`₹${child.wallet.savings}`} emoji="🏦" />
                <Stat label="Quizzes" value={child.stats.quizzesDone} emoji="🧠" />
                <Stat label="Games" value={child.stats.gamesPlayed} emoji="🎮" />
              </div>

              {/* Family Security Center */}
              <Section title="🛡️ Family Security Center">
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl p-6 text-white border border-zinc-700/50 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg">
                  <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <span>{child.emoji}</span> {child.name}'s Vault Code
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Did {child.name} forget their PIN? You can reset it here securely.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
                    <span className="font-mono text-2xl tracking-[0.2em] font-black">{child.pin}</span>
                    <button
                      onClick={() => {
                        const newPin = prompt(`Enter new 4-digit PIN for ${child.name}:`, child.pin);
                        if (newPin && /^\d{4}$/.test(newPin)) {
                          update((s: any) => ({
                            ...s,
                            children: s.children.map((c: any) => c.id === child.id ? { ...c, pin: newPin } : c)
                          }));
                          alert(`PIN updated for ${child.name}!`);
                        } else if (newPin) {
                          alert("PIN must be exactly 4 digits.");
                        }
                      }}
                      className="text-xs bg-white text-black font-bold px-4 py-2 rounded-lg hover:scale-105 transition"
                    >
                      Change PIN
                    </button>
                  </div>
                </div>
              </Section>

              {/* Card Management */}
              <Section title={`💳 ${child.name}'s Debit Card`}>
                {child.card.status === "unapplied" ? (
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center shadow-lg">
                    <div className="text-4xl mb-2">✨</div>
                    <h3 className="font-bold text-xl mb-2">Give {child.name} Financial Freedom</h3>
                    <p className="text-sm opacity-90 mb-5">
                      Order a physical KidVolt debit card. The "Spendable" balance is automatically
                      linked. You control the limits.
                    </p>
                    <button
                      onClick={() =>
                        updateChildCard(() => ({
                          status: "active",
                          number: `4111 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
                          limit: 200,
                        }))
                      }
                      className="bg-white text-purple-600 font-bold px-6 py-2.5 rounded-full shadow-soft hover:scale-105 transition"
                    >
                      Apply Instantly (Free)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Physical Card */}
                    <div
                      className={`relative w-full max-w-[320px] aspect-[1.6/1] rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-fuchsia-500/30 border border-white/10 ${child.card.status === "frozen" ? "bg-slate-700 grayscale" : "bg-gradient-to-br from-slate-900 via-fuchsia-900 to-indigo-900"}`}
                    >
                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-white/0 pointer-events-none mix-blend-overlay" />
                      <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Personal Avatar Watermark */}
                      <div className="absolute -right-6 -bottom-8 text-[140px] opacity-[0.08] pointer-events-none select-none z-0 rotate-[-15deg] mix-blend-overlay">
                        {child.emoji}
                      </div>

                      {child.card.status === "frozen" && (
                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-md z-20">
                          <span className="font-black tracking-widest text-xl drop-shadow-md text-white flex items-center gap-2">
                            <span>❄️</span> FROZEN
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-start z-10 relative">
                        <div className="font-black italic tracking-wider text-xl drop-shadow-md flex items-center gap-2">
                          <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          </div>
                          KidVolt
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-[10px] uppercase tracking-widest opacity-80 font-semibold mb-0.5">
                            Spendable
                          </div>
                          <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                            ₹{child.wallet.spendable}
                          </div>
                        </div>
                      </div>

                      <div className="z-10 relative mt-auto">
                        <div className="flex items-center gap-2 mb-3">
                          {/* EMV Chip */}
                          <div className="w-9 h-6 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md shadow-inner flex items-center justify-center overflow-hidden border border-yellow-500/50 relative">
                            <div className="w-full h-[1px] bg-yellow-700/30 absolute top-1/2" />
                            <div className="w-[1px] h-full bg-yellow-700/30 absolute left-1/2" />
                            <div className="w-4 h-3 border border-yellow-700/30 rounded-[2px]" />
                          </div>
                          {/* Contactless Icon */}
                          <svg
                            className="w-4 h-4 opacity-70"
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

                        <div className="font-mono text-xl tracking-[0.1em] mb-1 drop-shadow-sm text-white/95">
                          {child.card.number}
                        </div>
                        <div className="flex justify-between items-end text-xs uppercase tracking-wider">
                          <div>
                            <div className="text-[8px] opacity-70 mb-0.5 font-semibold">Cardholder</div>
                            <div className="font-bold drop-shadow-sm truncate max-w-[120px] flex items-center gap-1.5">
                              <span className="text-sm leading-none">{child.emoji}</span> {child.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="text-[8px] opacity-70 mb-0.5 font-semibold">Expires</div>
                              <div className="font-bold drop-shadow-sm">12/28</div>
                            </div>
                            {/* Fake Mastercard circles */}
                            <div className="flex -space-x-2.5 opacity-90 relative">
                              <div className="w-6 h-6 rounded-full bg-red-500/80 mix-blend-screen" />
                              <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-screen" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between bg-muted rounded-xl p-3">
                        <div>
                          <div className="font-semibold text-sm">Card Status</div>
                          <div className="text-xs text-muted-foreground">
                            {child.card.status === "active" ? "Ready to use" : "Temporarily locked"}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            updateChildCard((c) => ({
                              ...c,
                              status: c.status === "active" ? "frozen" : "active",
                            }))
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${child.card.status === "active" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/10 text-success hover:bg-success/20"}`}
                        >
                          {child.card.status === "active" ? "Freeze Card" : "Unfreeze"}
                        </button>
                      </div>

                      <Slider
                        label="Weekly Spend Limit"
                        value={child.card.limit}
                        min={50}
                        max={1000}
                        step={50}
                        onChange={(v) => updateChildCard((c) => ({ ...c, limit: v }))}
                        prefix="₹"
                      />
                    </div>
                  </div>
                )}
              </Section>

              {/* Funding & Bank Link */}
              <Section title="🏦 Bank Linking & Funding">
                {!state.parent.linkedBank ? (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white text-center shadow-lg">
                    <div className="text-4xl mb-2">🏦</div>
                    <h3 className="font-bold text-xl mb-2">Link Your Bank</h3>
                    <p className="text-sm opacity-90 mb-5">
                      Connect your external bank account to transfer real funds instantly into your
                      child's KidVolt wallet.
                    </p>
                    <button
                      onClick={() =>
                        update((s: any) => ({
                          ...s,
                          parent: { ...s.parent, linkedBank: { name: "HDFC Bank", last4: "4092" } },
                        }))
                      }
                      className="bg-white text-emerald-600 font-bold px-6 py-2.5 rounded-full shadow-soft hover:scale-105 transition"
                    >
                      Link Bank Securely
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-5 items-center">
                    <div className="bg-muted p-4 rounded-xl flex-1 flex items-center gap-3">
                      <div className="text-3xl">🏦</div>
                      <div>
                        <div className="font-bold">{state.parent.linkedBank.name}</div>
                        <div className="text-xs text-muted-foreground">
                          •••• {state.parent.linkedBank.last4}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          update((s: any) => ({ ...s, parent: { ...s.parent, linkedBank: undefined } }))
                        }
                        className="ml-auto text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-full hover:bg-destructive/20 font-bold"
                      >
                        Unlink
                      </button>
                    </div>
                    <div className="flex-1 w-full bg-card border rounded-xl p-4 shadow-soft">
                      <div className="font-semibold mb-2 text-sm">Transfer to {child.name}</div>
                      <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0"
                            className="w-full rounded-xl border bg-background pl-8 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <button
                        disabled={!transferAmount || Number(transferAmount) <= 0}
                        onClick={() => {
                          const amount = Number(transferAmount);
                          update((s: any) => {
                            const save = Math.round((amount * s.settings.savingPct) / 100);
                            const spend = amount - save;
                            const childProfile = s.children.find((x: any) => x.id === child.id);
                            if (!childProfile) return s;
                            return {
                              ...s,
                              children: s.children.map((x: any) =>
                                x.id === child.id
                                  ? {
                                      ...x,
                                      wallet: {
                                        savings: x.wallet.savings + save,
                                        spendable: x.wallet.spendable + spend,
                                      },
                                      activity: [
                                        {
                                          id: crypto.randomUUID(),
                                          ts: Date.now(),
                                          text: `🏦 Bank Transfer`,
                                          delta: amount,
                                        },
                                        ...x.activity,
                                      ].slice(0, 30),
                                    }
                                  : x,
                              ),
                            };
                          });
                          setTransferAmount("");
                        }}
                        className="w-full rounded-xl bg-primary text-primary-foreground font-bold py-2.5 disabled:opacity-50"
                      >
                        Transfer Instantly
                      </button>
                    </div>
                  </div>
                )}
              </Section>

              {/* Settings */}
              <Section title="⚙️ Global Rules & limits (All Kids & Teens)">
                <Slider
                  label="Saving %"
                  value={state.settings.savingPct}
                  min={0}
                  max={80}
                  step={5}
                  onChange={(v) =>
                    update((s: any) => ({ ...s, settings: { ...s.settings, savingPct: v } }))
                  }
                  suffix="%"
                />
                <Slider
                  label="Daily XP limit"
                  value={state.settings.dailyXp}
                  min={20}
                  max={200}
                  step={10}
                  onChange={(v) => updateChildXp(v)}
                />
                <Slider
                  label="Weekly allowance ₹"
                  value={state.settings.allowance}
                  min={0}
                  max={500}
                  step={10}
                  onChange={(v) =>
                    update((s: any) => ({ ...s, settings: { ...s.settings, allowance: v } }))
                  }
                  prefix="₹"
                />

                <div className="mt-5 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
                  <h4 className="font-bold flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-400">
                    📈 Parent-Paid Interest
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Automatically pay kids interest based on their Savings balance. Encourages long-term
                    saving.
                  </p>
                  <Slider
                    label="Monthly Interest Rate"
                    value={state.settings.interestRate || 5}
                    min={0}
                    max={20}
                    step={1}
                    onChange={(v) =>
                      update((s: any) => ({ ...s, settings: { ...s.settings, interestRate: v } }))
                    }
                    suffix="%"
                  />
                </div>
              </Section>

              {/* Pending approvals */}
              {pending.length > 0 && (
                <Section title={`⏳ Awaiting your approval (${pending.length})`}>
                  <ul className="space-y-3">
                    {pending.map((t: any) => (
                      <li
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-warning/15 rounded-xl p-4 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {t.photoUrl ? (
                            <img
                              src={t.photoUrl}
                              alt="Proof"
                              className="w-16 h-16 object-cover rounded-lg shadow-sm border border-black/10"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center text-2xl">
                              {t.emoji}
                            </div>
                          )}
                          <div>
                            <div className="font-bold">
                              {t.emoji} {t.title}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium mt-0.5">
                              Reward: ₹{t.reward} · +{t.xp}XP
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => approve(t.id)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-success text-success-foreground font-bold hover:scale-105 transition shadow-sm"
                        >
                          Approve & Pay
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Pending Rewards */}
              {pendingRewards.length > 0 && (
                <Section title={`🎁 Rewards to Fulfill (${pendingRewards.length})`}>
                  <ul className="space-y-3">
                    {pendingRewards.map((r: any) => (
                      <li
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-400/15 border border-amber-400/30 rounded-xl p-4 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center text-3xl shadow-sm">
                            {r.emoji}
                          </div>
                          <div>
                            <div className="font-bold">{r.title}</div>
                            <div className="text-sm text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                              Paid {r.costXp} XP
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => fulfillReward(r.id)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-amber-500 text-white font-bold hover:scale-105 transition shadow-sm"
                        >
                          Mark as Given
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Add task */}
              <Section title={`➕ Assign a task for ${child.name}`}>
                <div className="grid sm:grid-cols-[auto_1fr_auto_auto] gap-2">
                  <input
                    value={taskEmoji}
                    onChange={(e) => setTaskEmoji(e.target.value)}
                    className="w-16 text-center text-2xl rounded-xl border bg-background py-2"
                    maxLength={2}
                  />
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="rounded-xl border bg-background px-4 py-2"
                  />
                  <input
                    type="number"
                    value={taskReward}
                    onChange={(e) => setTaskReward(Number(e.target.value))}
                    className="w-24 rounded-xl border bg-background px-3 py-2"
                  />
                  <button
                    onClick={addTask}
                    className="rounded-xl bg-primary text-primary-foreground font-semibold px-5"
                  >
                    Add
                  </button>
                </div>
                <ul className="mt-4 space-y-2">
                  {child.tasks
                    .filter((t: any) => t.status !== "approved")
                    .map((t: any) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between bg-muted rounded-xl p-3 text-sm"
                      >
                        <span>
                          {t.emoji} {t.title}
                        </span>
                        <span className="text-muted-foreground">
                          ₹{t.reward} · {t.status}
                        </span>
                      </li>
                    ))}
                </ul>
              </Section>
            </>
          )}

          {activeTab === "history" && (
            <Section title={`📜 ${child.name}'s Transaction History`}>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Complete record of all tasks, investments, and wallet transfers.
                </p>
                <button
                  onClick={() => {
                    const csvContent = [
                      "Transaction ID,Date,Time,Description,Amount (INR)",
                      ...child.activity.map((a: any) => {
                        const date = new Date(a.ts).toLocaleDateString();
                        const time = new Date(a.ts).toLocaleTimeString();
                        const amount = a.delta ? a.delta.toString() : "0";
                        return `"${a.id}","${date}","${time}","${a.text}",${amount}`;
                      })
                    ].join("\\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${child.name}_KidVolt_History.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition flex items-center gap-2"
                >
                  📥 Download CSV
                </button>
              </div>

              {child.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground p-8 text-center bg-muted/30 rounded-2xl border border-dashed">
                  No transactions found in the system yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-bold">Transaction ID</th>
                        <th className="px-6 py-4 font-bold">Date & Time</th>
                        <th className="px-6 py-4 font-bold">Description</th>
                        <th className="px-6 py-4 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {child.activity.map((a: any) => {
                        const isExpense = a.delta != null && a.delta < 0;
                        const isIncome = a.delta != null && a.delta > 0;
                        return (
                          <tr key={a.id} className="hover:bg-muted/30 transition">
                            <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground max-w-[120px] truncate" title={a.id}>
                              {a.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">{new Date(a.ts).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(a.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 font-medium">
                                <span>
                                  {a.text.includes("Bank Transfer") ? "🏦" :
                                   a.text.includes("Task") ? "✅" :
                                   a.text.includes("spent") ? "🛍️" :
                                   a.text.includes("Game") ? "🎮" : "💳"}
                                </span>
                                {a.text}
                              </div>
                            </td>
                            <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${isExpense ? "text-destructive" : isIncome ? "text-success" : ""}`}>
                              {a.delta != null ? (
                                <>
                                  {isExpense ? "-" : "+"}
                                  {a.delta === 0 ? "" : "₹"}
                                  {Math.abs(a.delta)}
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: any; emoji: string }) {
  return (
    <div className="bg-card border rounded-2xl p-4 shadow-soft">
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 bg-card border rounded-3xl p-5 shadow-soft">
      <h2 className="font-bold text-lg mb-3">{title}</h2>
      {children}
    </section>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}
function Slider({ label, value, min, max, step, onChange, prefix = "", suffix = "" }: SliderProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
