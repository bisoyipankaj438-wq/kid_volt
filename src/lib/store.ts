// KidVolt — frontend-only store backed by localStorage.
// Single parent + multiple children.

export type TaskStatus = "open" | "submitted" | "approved";

export interface Task {
  id: string;
  title: string;
  emoji: string;
  reward: number; // ₹
  xp: number;
  status: TaskStatus;
  createdAt: number;
  photoUrl?: string; // For photo verification
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  costXp: number;
}

export interface RedeemedReward {
  id: string; // unique redemption id
  rewardId: string;
  title: string;
  emoji: string;
  costXp: number;
  ts: number;
  status: "pending" | "fulfilled";
}

export interface Activity {
  id: string;
  ts: number;
  text: string;
  delta?: number; // ₹ change
}

export interface ChildProfile {
  id: string;
  name: string;
  emoji: string;
  pin: string;
  wallet: { savings: number; spendable: number };
  xp: { current: number; max: number; lastReset: string }; // YYYY-MM-DD
  tasks: Task[];
  rewardsRedeemed: RedeemedReward[];
  activity: Activity[];
  stats: { gamesPlayed: number; quizzesDone: number; totalEarned: number };
  card: { status: "unapplied" | "active" | "frozen"; number: string; limit: number };
}

export interface KidVoltState {
  parent: { name: string; pin: string; linkedBank?: { name: string; last4: string } } | null;
  children: ChildProfile[];
  activeChildId: string | null;
  settings: {
    savingPct: number; // 0-100
    dailyXp: number;
    allowance: number; // weekly allowance ₹
    interestRate: number; // parent-paid interest %
    rewardsCatalog: Reward[];
  };
}

const KEY = "kidvolt:v2";

const today = () => new Date().toISOString().slice(0, 10);

const defaultState: KidVoltState = {
  parent: null,
  children: [],
  activeChildId: null,
  settings: {
    savingPct: 30,
    dailyXp: 80,
    allowance: 100,
    interestRate: 5,
    rewardsCatalog: [
      { id: "1", title: "1 Hour Extra Screen Time", emoji: "📺", costXp: 50 },
      { id: "2", title: "Pick Movie Night Movie", emoji: "🍿", costXp: 100 },
      { id: "3", title: "Skip One Chore", emoji: "🛋️", costXp: 150 },
    ],
  },
};

export function loadState(): KidVoltState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    // Migration: if they have old v1 state, we should ideally migrate it, but let's keep it simple
    // and just use v2 key so it starts fresh if they never used v2.
    // Wait, the user has data in v1. Let's try to load v1 and migrate to v2 if v2 is missing.
    if (!raw) {
      const v1Raw = localStorage.getItem("kidvolt:v1");
      if (v1Raw) {
        const v1 = JSON.parse(v1Raw);
        if (v1.child) {
          const migratedChild: ChildProfile = {
            id: crypto.randomUUID(),
            name: v1.child.name || "Kid/Teen",
            emoji: v1.child.emoji || "🦊",
            pin: v1.child.pin || "0000",
            wallet: v1.wallet || { savings: 0, spendable: 0 },
            xp: v1.xp || { current: 80, max: 80, lastReset: today() },
            tasks: v1.tasks || [],
            rewardsRedeemed: [],
            activity: v1.activity || [],
            stats: v1.stats || { gamesPlayed: 0, quizzesDone: 0, totalEarned: 0 },
            card: v1.card || { status: "unapplied", number: "", limit: 200 },
          };
          const migratedState: KidVoltState = {
            parent: v1.parent,
            children: [migratedChild],
            activeChildId: migratedChild.id,
            settings: { ...defaultState.settings, ...v1.settings },
          };
          return migratedState;
        }
      }
      return defaultState;
    }
    const s = JSON.parse(raw) as KidVoltState;

    // daily XP reset for all children
    let changed = false;
    s.children.forEach((c) => {
      if (!c.rewardsRedeemed) {
        c.rewardsRedeemed = [];
        changed = true;
      }
      if (c.xp && c.xp.lastReset !== today()) {
        c.xp.current = c.xp.max;
        c.xp.lastReset = today();
        changed = true;
      }
    });

    return {
      ...defaultState,
      ...s,
      settings: {
        ...defaultState.settings,
        ...s.settings,
        rewardsCatalog: s.settings.rewardsCatalog || defaultState.settings.rewardsCatalog,
      },
    };
  } catch {
    return defaultState;
  }
}

export function saveState(s: KidVoltState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("kidvolt:update"));
}

export function resetAll() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("kidvolt:v1");
  window.dispatchEvent(new Event("kidvolt:update"));
}

// Helpers
export function fundWallet(
  s: KidVoltState,
  childId: string,
  amount: number,
  destination: "spendable" | "savings",
): KidVoltState {
  const child = s.children.find((c) => c.id === childId);
  if (!child) return s;

  const updatedChild: ChildProfile = {
    ...child,
    wallet: {
      ...child.wallet,
      [destination]: child.wallet[destination] + amount,
    },
    activity: [
      {
        id: crypto.randomUUID(),
        ts: Date.now(),
        text: `🏦 Bank Transfer to ${destination}`,
        delta: amount,
      },
      ...child.activity,
    ].slice(0, 30),
  };

  return {
    ...s,
    children: s.children.map((c) => (c.id === childId ? updatedChild : c)),
  };
}

export function earn(
  s: KidVoltState,
  childId: string,
  amount: number,
  label: string,
): KidVoltState {
  const child = s.children.find((c) => c.id === childId);
  if (!child) return s;

  const save = Math.round((amount * s.settings.savingPct) / 100);
  const spend = amount - save;

  const updatedChild: ChildProfile = {
    ...child,
    wallet: { savings: child.wallet.savings + save, spendable: child.wallet.spendable + spend },
    stats: { ...child.stats, totalEarned: child.stats.totalEarned + amount },
    activity: [
      { id: crypto.randomUUID(), ts: Date.now(), text: label, delta: amount },
      ...child.activity,
    ].slice(0, 30),
  };

  return {
    ...s,
    children: s.children.map((c) => (c.id === childId ? updatedChild : c)),
  };
}

export function spendXp(s: KidVoltState, childId: string, amount: number): KidVoltState {
  const child = s.children.find((c) => c.id === childId);
  if (!child) return s;

  return {
    ...s,
    children: s.children.map((c) =>
      c.id === childId ? { ...c, xp: { ...c.xp, current: Math.max(0, c.xp.current - amount) } } : c,
    ),
  };
}

export function gainXp(s: KidVoltState, childId: string, amount: number): KidVoltState {
  const child = s.children.find((c) => c.id === childId);
  if (!child) return s;

  return {
    ...s,
    children: s.children.map((c) =>
      c.id === childId
        ? { ...c, xp: { ...c.xp, current: Math.min(c.xp.max, c.xp.current + amount) } }
        : c,
    ),
  };
}
