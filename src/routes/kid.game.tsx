import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { gainXp, spendXp } from "@/lib/store";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/kid/game")({
  component: GameSelector,
});

const XP_COST = 10;
const DURATION = 20; // seconds

interface Coin {
  id: number;
  x: number;
  y: number;
  v: number;
  type: "coin" | "bomb";
}

function GameSelector() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();
  const [game, setGame] = useState<"select" | "coin" | "math">("select");

  if (!state.activeChildId) {
    nav({ to: "/kid" });
    return null;
  }
  const child = state.children.find((c) => c.id === state.activeChildId);
  if (!child) return null;

  if (game === "coin") return <CoinCatcher child={child} update={update} onBack={() => setGame("select")} />;
  if (game === "math") return <MathNinja child={child} update={update} onBack={() => setGame("select")} />;

  return (
    <div className="max-w-md mx-auto px-5 pt-6 text-center">
      <div className="text-6xl mb-4">🕹️</div>
      <h1 className="text-4xl font-black mb-8">Arcade</h1>
      <div className="grid gap-4">
        <button onClick={() => setGame("coin")} className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-soft hover:scale-105 transition flex items-center gap-4">
          <div className="text-5xl">🪙</div>
          <div className="text-left">
            <h2 className="font-bold text-2xl">Coin Catcher</h2>
            <p className="text-sm font-semibold opacity-90">Catch coins, avoid bombs!</p>
          </div>
        </button>
        <button onClick={() => setGame("math")} className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl p-6 text-white shadow-soft hover:scale-105 transition flex items-center gap-4">
          <div className="text-5xl">🧮</div>
          <div className="text-left">
            <h2 className="font-bold text-2xl">Math Ninja</h2>
            <p className="text-sm font-semibold opacity-90">Solve fast, earn XP!</p>
          </div>
        </button>
      </div>
      <Link to="/kid" className="block mt-8 text-white/70 hover:text-white font-bold underline bg-white/10 px-6 py-3 rounded-full inline-block">← Back Home</Link>
    </div>
  );
}

function CoinCatcher({ child, update, onBack }: any) {
  const nav = useNavigate();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [coins, setCoins] = useState<Coin[]>([]);
  const idRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const start = () => {
    if (child.xp.current < XP_COST) return;
    update((s: any) => spendXp(s, child.id, XP_COST));
    setScore(0);
    setTime(DURATION);
    setCoins([]);
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const spawn = setInterval(() => {
      setCoins((c) => [
        ...c,
        {
          id: idRef.current++,
          x: Math.random() * 80 + 5,
          y: -10,
          v: Math.random() * 1.5 + 1.2,
          type: Math.random() < 0.18 ? "bomb" : "coin",
        },
      ]);
    }, 600);
    const fall = setInterval(() => {
      setCoins((c) => c.map((x) => ({ ...x, y: x.y + x.v })).filter((x) => x.y < 110));
    }, 50);
    const tick = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(tick);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(fall);
      clearInterval(tick);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const xpReward = Math.max(7, Math.round(score / 2));
    update((s: any) => {
      let next = gainXp(s, child.id, xpReward);
      next = {
        ...next,
        children: next.children.map((c: any) =>
          c.id === child.id
            ? {
                ...c,
                stats: { ...c.stats, gamesPlayed: c.stats.gamesPlayed + 1 },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `🎮 Coin Catcher (+${xpReward} XP)`,
                  },
                  ...c.activity,
                ].slice(0, 30),
              }
            : c,
        ),
      };
      return next;
    });
  }, [phase]);

  const tap = (c: Coin) => {
    if (c.type === "bomb") setScore((s) => Math.max(0, s - 5));
    else setScore((s) => s + 1);
    setCoins((cs) => cs.filter((x) => x.id !== c.id));
  };

  if (phase === "intro") {
    return (
      <Wrap>
        <div className="text-center pt-10">
          <div className="text-7xl animate-float">🪙</div>
          <h1 className="text-3xl font-bold mt-4">Coin Catcher</h1>
          <p className="text-muted-foreground mt-2">Tap coins. Avoid 💣. {DURATION}s.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm">
            <img src="/kidvolt-logo.png" alt="Energy" className="w-4 h-4 inline-block" /> Costs {XP_COST} energy
          </div>
          <button onClick={start} disabled={child.xp.current < XP_COST} className="mt-8 w-full rounded-2xl bg-primary text-primary-foreground font-bold text-xl py-4 shadow-soft active:scale-95 disabled:opacity-50">
            {child.xp.current < XP_COST ? "Not enough energy" : "Start! 🎮"}
          </button>
          <button onClick={onBack} className="block w-full mt-4 text-sm text-muted-foreground font-bold underline">← Back to Arcade</button>
        </div>
      </Wrap>
    );
  }

  if (phase === "done") {
    const xpReward = Math.max(7, Math.round(score / 2));
    return (
      <Wrap>
        <div className="text-center pt-10 animate-pop-in">
          <div className="text-7xl">🏆</div>
          <h1 className="text-3xl font-bold mt-4">Game over!</h1>
          <div className="mt-6 rounded-3xl bg-gradient-coin text-accent-foreground p-6 shadow-soft">
            <div className="text-sm font-bold opacity-80">YOU EARNED</div>
            <div className="text-6xl font-bold">{xpReward} XP</div>
            <div className="text-sm mt-1 opacity-80">Caught {score} coins</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={start} disabled={child.xp.current < XP_COST} className="rounded-2xl bg-fun text-fun-foreground font-bold py-4 shadow-soft disabled:opacity-50">Play again</button>
            <button onClick={onBack} className="rounded-2xl bg-card border font-bold py-4 shadow-soft">Arcade</button>
          </div>
        </div>
      </Wrap>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="flex justify-between items-center font-bold">
        <span className="text-2xl">🪙 {score}</span>
        <span className={`text-xl ${time <= 5 ? "text-destructive" : ""}`}>⏱ {time}s</span>
      </div>
      <div ref={areaRef} className="relative mt-4 bg-gradient-hero rounded-3xl overflow-hidden shadow-soft" style={{ height: "70vh", touchAction: "manipulation" }}>
        {coins.map((c) => (
          <button key={c.id} onClick={() => tap(c)} className="absolute text-4xl select-none active:scale-125 transition-transform" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
            {c.type === "coin" ? "🪙" : "💣"}
          </button>
        ))}
        <div className="absolute bottom-3 inset-x-0 text-center text-xs text-white/80 font-semibold">Tap 🪙 · Avoid 💣</div>
      </div>
    </div>
  );
}

function MathNinja({ child, update, onBack }: any) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [problem, setProblem] = useState({ q: "", a: 0, opts: [] as number[] });

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isAdd = Math.random() > 0.5;
    const q = isAdd ? `${a} + ${b}` : `${a + b} - ${a}`;
    const ans = isAdd ? a + b : b;
    
    let options = [ans];
    while(options.length < 4) {
      const wrong = ans + Math.floor(Math.random() * 10) - 5;
      if (wrong !== ans && !options.includes(wrong) && wrong >= 0) options.push(wrong);
    }
    setProblem({ q, a: ans, opts: options.sort(() => Math.random() - 0.5) });
  };

  const start = () => {
    if (child.xp.current < XP_COST) return;
    update((s: any) => spendXp(s, child.id, XP_COST));
    setScore(0);
    setTime(DURATION);
    generateProblem();
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "play") return;
    const tick = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(tick);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const xpReward = Math.max(7, Math.round(score * 1.5));
    update((s: any) => {
      let next = gainXp(s, child.id, xpReward);
      next = {
        ...next,
        children: next.children.map((c: any) =>
          c.id === child.id
            ? {
                ...c,
                stats: { ...c.stats, gamesPlayed: c.stats.gamesPlayed + 1 },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `🎮 Math Ninja (+${xpReward} XP)`,
                  },
                  ...c.activity,
                ].slice(0, 30),
              }
            : c,
        ),
      };
      return next;
    });
  }, [phase]);

  const tap = (ans: number) => {
    if (ans === problem.a) {
      setScore(s => s + 1);
      generateProblem();
    } else {
      setScore(s => Math.max(0, s - 1));
    }
  };

  if (phase === "intro") {
    return (
      <Wrap>
        <div className="text-center pt-10">
          <div className="text-7xl animate-float">🧮</div>
          <h1 className="text-3xl font-bold mt-4">Math Ninja</h1>
          <p className="text-muted-foreground mt-2">Solve fast. {DURATION}s.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm">
            <img src="/kidvolt-logo.png" alt="Energy" className="w-4 h-4 inline-block" /> Costs {XP_COST} energy
          </div>
          <button onClick={start} disabled={child.xp.current < XP_COST} className="mt-8 w-full rounded-2xl bg-primary text-primary-foreground font-bold text-xl py-4 shadow-soft active:scale-95 disabled:opacity-50">
            {child.xp.current < XP_COST ? "Not enough energy" : "Start! 🎮"}
          </button>
          <button onClick={onBack} className="block w-full mt-4 text-sm text-muted-foreground font-bold underline">← Back to Arcade</button>
        </div>
      </Wrap>
    );
  }

  if (phase === "done") {
    const xpReward = Math.max(7, Math.round(score * 1.5));
    return (
      <Wrap>
        <div className="text-center pt-10 animate-pop-in">
          <div className="text-7xl">🏆</div>
          <h1 className="text-3xl font-bold mt-4">Time's Up!</h1>
          <div className="mt-6 rounded-3xl bg-gradient-coin text-accent-foreground p-6 shadow-soft">
            <div className="text-sm font-bold opacity-80">YOU EARNED</div>
            <div className="text-6xl font-bold">{xpReward} XP</div>
            <div className="text-sm mt-1 opacity-80">Solved {score} equations</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={start} disabled={child.xp.current < XP_COST} className="rounded-2xl bg-fun text-fun-foreground font-bold py-4 shadow-soft disabled:opacity-50">Play again</button>
            <button onClick={onBack} className="rounded-2xl bg-card border font-bold py-4 shadow-soft">Arcade</button>
          </div>
        </div>
      </Wrap>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="flex justify-between items-center font-bold mb-8">
        <span className="text-2xl">✅ {score}</span>
        <span className={`text-xl ${time <= 5 ? "text-destructive animate-pulse" : ""}`}>⏱ {time}s</span>
      </div>
      <div className="mt-8 bg-card border shadow-soft rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-5">🧮</div>
        <div className="text-6xl font-black mb-8 relative z-10 text-foreground">{problem.q}</div>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {problem.opts.map((opt, i) => (
            <button key={i} onClick={() => tap(opt)} className="bg-primary/10 hover:bg-primary/20 text-primary font-black text-4xl py-6 rounded-2xl transition active:scale-95 border border-primary/20 shadow-sm">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md mx-auto px-5 pt-6">{children}</div>;
}
