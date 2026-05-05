import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { QUIZ } from "@/lib/quiz";
import { gainXp, spendXp } from "@/lib/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/kid/quiz")({
  component: QuizPage,
});

const XP_COST = 5;
const TIME = 15;

function QuizPage() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  const [time, setTime] = useState(TIME);
  const [done, setDone] = useState(false);

  if (!state.activeChildId) {
    nav({ to: "/kid" });
    return null;
  }

  const child = state.children.find((c) => c.id === state.activeChildId);
  if (!child) return null;

  useEffect(() => {
    if (!started || reaction || done) return;
    if (time <= 0) {
      pick(-1);
      return;
    }
    const id = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(id);
  }, [time, started, reaction, done]);

  const start = () => {
    if (child.xp.current < XP_COST) return;
    update((s) => spendXp(s, child.id, XP_COST));
    setStarted(true);
  };

  const pick = (idx: number) => {
    const q = QUIZ[i];
    const opt = idx >= 0 ? q.options[idx] : null;
    if (opt?.good) {
      setScore(score + 10);
      setStreak(streak + 1);
      setReaction(opt.reaction);
    } else {
      setStreak(0);
      setReaction(opt?.reaction ?? "Time's up! ⏰");
    }
    setTimeout(() => {
      if (i + 1 >= QUIZ.length) finish();
      else {
        setI(i + 1);
        setReaction(null);
        setTime(TIME);
      }
    }, 1300);
  };

  const finish = () => {
    setDone(true);
    const correctAnswers = Math.floor(score / 10);
    const xpReward = Math.round((correctAnswers / QUIZ.length) * 10);
    update((s) => {
      let next = gainXp(s, child.id, xpReward);
      next = {
        ...next,
        children: next.children.map((c) =>
          c.id === child.id
            ? {
                ...c,
                stats: { ...c.stats, quizzesDone: c.stats.quizzesDone + 1 },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `🧠 Quiz finished (+${xpReward} XP)`,
                  },
                  ...c.activity,
                ].slice(0, 30),
              }
            : c,
        ),
      };
      return next;
    });
  };

  if (!started) {
    return (
      <Wrap>
        <div className="text-center pt-10">
          <div className="text-7xl animate-float">🧠</div>
          <h1 className="text-3xl font-bold mt-4">Smart Money Quiz</h1>
          <p className="text-muted-foreground mt-2">8 quick scenarios. {TIME}s each.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm">
            <img src="/kidvolt-logo.png" alt="Energy" className="w-4 h-4 inline-block" /> Costs{" "}
            {XP_COST} energy
          </div>
          <button
            onClick={start}
            disabled={child.xp.current < XP_COST}
            className="mt-8 w-full rounded-2xl bg-fun text-fun-foreground font-bold text-xl py-4 shadow-soft active:scale-95 disabled:opacity-50"
          >
            {child.xp.current < XP_COST ? (
              <span className="flex items-center justify-center gap-2">
                Not enough energy{" "}
                <img src="/kidvolt-logo.png" alt="Energy" className="w-5 h-5 inline-block" />
              </span>
            ) : (
              "Let's go! 🚀"
            )}
          </button>
          <Link to="/kid" className="block mt-4 text-sm text-muted-foreground">
            ← Back home
          </Link>
        </div>
      </Wrap>
    );
  }

  if (done) {
    const correctAnswers = Math.floor(score / 10);
    const xpReward = Math.round((correctAnswers / QUIZ.length) * 10);
    return (
      <Wrap>
        <div className="text-center pt-10 animate-pop-in">
          <div className="text-7xl">🎉</div>
          <h1 className="text-3xl font-bold mt-4">Quiz done!</h1>
          <div className="mt-6 rounded-3xl bg-gradient-coin text-accent-foreground p-6 shadow-soft">
            <div className="text-sm font-bold opacity-80">YOU EARNED</div>
            <div className="text-6xl font-bold">{xpReward} XP</div>
            <div className="text-sm mt-1 opacity-80">
              Score {score} · Best streak {streak}
            </div>
          </div>
          <button
            onClick={() => nav({ to: "/kid" })}
            className="mt-6 w-full rounded-2xl bg-primary text-primary-foreground font-bold py-4 shadow-soft"
          >
            Back home →
          </button>
        </div>
      </Wrap>
    );
  }

  const q = QUIZ[i];
  return (
    <Wrap>
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>
          Q {i + 1}/{QUIZ.length}
        </span>
        <span className="text-fun">🔥 Streak {streak}</span>
        <span className={time <= 5 ? "text-destructive" : ""}>⏱ {time}s</span>
      </div>
      <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-gradient-kid transition-all"
          style={{ width: `${((i + 1) / QUIZ.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div key={i} className="mt-8 text-center animate-pop-in">
        <div className="text-7xl">{q.emoji}</div>
        <h2 className="text-2xl font-bold mt-4">{q.q}</h2>
      </div>

      {/* Options */}
      <div className="mt-6 space-y-3">
        {q.options.map((o, idx) => (
          <button
            key={idx}
            onClick={() => !reaction && pick(idx)}
            disabled={!!reaction}
            className="w-full text-left rounded-2xl bg-card border p-4 font-semibold shadow-soft hover:bg-accent/30 active:scale-[0.98] transition disabled:opacity-60"
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Reaction */}
      {reaction && (
        <div className="mt-5 text-center bg-fun text-fun-foreground rounded-2xl p-4 font-bold animate-pop-in">
          {reaction}
        </div>
      )}
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md mx-auto px-5 pt-6">{children}</div>;
}
