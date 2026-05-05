import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { playSound } from "@/lib/utils";

export const Route = createFileRoute("/kid/rewards")({
  component: RewardsRoute,
});

function RewardsRoute() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();
  const child = state.children.find((c) => c.id === state.activeChildId);

  if (!child) return null;

  const buyReward = (reward: any) => {
    if (child.xp.current < reward.costXp) return;

    update((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === child.id
          ? {
              ...c,
              xp: { ...c.xp, current: c.xp.current - reward.costXp },
              rewardsRedeemed: [
                {
                  id: crypto.randomUUID(),
                  rewardId: reward.id,
                  title: reward.title,
                  emoji: reward.emoji,
                  costXp: reward.costXp,
                  ts: Date.now(),
                  status: "pending",
                },
                ...c.rewardsRedeemed,
              ],
            }
          : c,
      ),
    }));

    playSound("coin");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFC700", "#FF0000", "#2E3192", "#1BFFFF"],
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 p-5">
      <div className="flex items-center mb-6 pt-2">
        <Link to="/kid" className="text-2xl mr-4">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Rewards Store 🎁</h1>
      </div>

      <div className="bg-card border rounded-3xl p-5 mb-6 flex justify-between items-center shadow-soft">
        <div className="font-bold flex items-center gap-2">
          <img src="/kidvolt-logo.png" alt="XP" className="w-6 h-6 animate-bolt" /> My XP
        </div>
        <div className="text-2xl font-black">{child.xp.current}</div>
      </div>

      <h2 className="font-bold text-lg mb-3">Available Rewards</h2>
      <div className="grid gap-3">
        {state.settings.rewardsCatalog.map((r, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={r.id}
            className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl bg-muted p-2 rounded-xl">{r.emoji}</div>
              <div>
                <div className="font-bold">{r.title}</div>
                <div className="text-sm font-semibold text-fun flex items-center gap-1">
                  <img src="/kidvolt-logo.png" alt="XP" className="w-3 h-3" /> {r.costXp} XP
                </div>
              </div>
            </div>
            <button
              disabled={child.xp.current < r.costXp}
              onClick={() => buyReward(r)}
              className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground active:scale-95 transition"
            >
              {child.xp.current >= r.costXp ? "Buy" : "Need XP"}
            </button>
          </motion.div>
        ))}
      </div>

      {child.rewardsRedeemed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-3">My Items</h2>
          <div className="space-y-3">
            {child.rewardsRedeemed.map((r: any) => (
              <div
                key={r.id}
                className="bg-muted border border-transparent rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">
                    {r.emoji} {r.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bought on {new Date(r.ts).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "pending" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}`}
                >
                  {r.status === "pending" ? "Waiting for parent" : "Enjoyed!"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
