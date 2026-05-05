import { createFileRoute, Link } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { useState } from "react";
import { playSound } from "@/lib/utils";

export const Route = createFileRoute("/kid/invest")({
  component: InvestRoute,
});

const STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple",
    price: 15420,
    change: "+1.2%",
    logo: "🍎",
    color: "bg-black text-white",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: 18500,
    change: "-0.5%",
    logo: "⚡",
    color: "bg-red-500 text-white",
  },
  {
    symbol: "DIS",
    name: "Disney",
    price: 8200,
    change: "+2.1%",
    logo: "🏰",
    color: "bg-blue-600 text-white",
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    price: 12100,
    change: "+0.8%",
    logo: "📦",
    color: "bg-yellow-500 text-black",
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "What is a stock?",
    options: ["A piece of a company", "A type of soup", "A loan to a bank"],
    a: 0,
  },
  {
    q: "What happens when a stock price goes up?",
    options: ["You lose money", "Your investment grows", "The company closes"],
    a: 1,
  },
  {
    q: "Is it better to put all your money in one stock or many?",
    options: ["Just one", "Spread it out (many)", "Neither"],
    a: 1,
  },
];

function InvestRoute() {
  const { state, update } = useKidVolt();
  const c = state.children.find((ch: any) => ch.id === state.activeChildId);
  const [selectedStock, setSelectedStock] = useState<(typeof STOCKS)[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  // Minigame state
  const [quizActive, setQuizActive] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const [authorized, setAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!c) return null;

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background pb-24 px-5 pt-6 flex flex-col items-center justify-center">
        <div className="bg-card p-6 rounded-3xl shadow-soft border w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2">Parent Permission</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Investments use money from your Savings wallet. Ask your parent to unlock this feature.
          </p>

          <div className="text-left mb-6 bg-muted/50 p-4 rounded-xl text-xs border border-border">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <span className="opacity-90 font-medium">
                I, the parent, agree to the KidVolt Investing Terms & Conditions and authorize my
                child to invest their savings. I understand that investing involves risk.
              </span>
            </label>
          </div>

          <input
            type="password"
            placeholder="Parent PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center text-2xl font-mono tracking-[0.5em] bg-background border rounded-2xl py-4 mb-4 outline-none focus:ring-2 focus:ring-primary shadow-inner"
            maxLength={4}
          />
          <div className="flex gap-3">
            <Link
              to="/kid"
              className="flex-1 bg-muted font-bold py-3.5 rounded-2xl active:scale-95 transition text-foreground"
            >
              Cancel
            </Link>
            <button
              disabled={!termsAccepted || pinInput !== state.parent?.pin}
              onClick={() => {
                setAuthorized(true);
                playSound("success");
              }}
              className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl disabled:opacity-50 active:scale-95 transition shadow-soft"
            >
              Unlock
            </button>
          </div>
          {pinInput.length === 4 && pinInput !== state.parent?.pin && (
            <p className="text-xs text-destructive mt-3 font-semibold animate-pulse">
              Incorrect PIN. Hint: Default is 0000
            </p>
          )}
        </div>
      </div>
    );
  }

  const handleBuy = () => {
    const val = Number(amount);
    if (!val || val <= 0 || val > c.wallet.savings) return;

    update((s: any) => {
      const child = s.children.find((x: any) => x.id === c.id);
      if (!child) return s;
      return {
        ...s,
        children: s.children.map((x: any) =>
          x.id === c.id
            ? {
                ...x,
                wallet: { ...x.wallet, savings: x.wallet.savings - val },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `📈 Bought ${selectedStock?.symbol} stock`,
                    delta: -val,
                  },
                  ...x.activity,
                ].slice(0, 30),
              }
            : x,
        ),
      };
    });
    setSuccess(true);
    playSound("coin");
    setTimeout(() => {
      setSuccess(false);
      setSelectedStock(null);
      setAmount("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-6">
      <header className="flex items-center justify-between mb-6">
        <Link
          to="/kid"
          className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">Investing</h1>
        <div className="w-10"></div>
      </header>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">📈</div>
        <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
          Your Portfolio
        </div>
        <div className="text-4xl font-bold">₹0.00</div>
        <p className="text-sm mt-2 opacity-90">Start building wealth with as little as ₹10.</p>
      </div>

      {/* Educational Minigame */}
      {!quizDone && (
        <div className="bg-card border rounded-3xl p-5 mb-8 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none"></div>
          {!quizActive ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
                    🎓 Stock Market 101
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn the basics before you invest and earn +50 XP!
                  </p>
                </div>
                <div className="text-4xl">🦉</div>
              </div>
              <button
                onClick={() => setQuizActive(true)}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-2xl active:scale-95 transition shadow-sm"
              >
                Start Minigame
              </button>
            </>
          ) : (
            <div className="animate-in fade-in">
              <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                Question {qIndex + 1} of {QUIZ_QUESTIONS.length}
              </div>
              <h3 className="font-bold text-lg mb-4">{QUIZ_QUESTIONS[qIndex].q}</h3>
              <div className="space-y-2">
                {QUIZ_QUESTIONS[qIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i === QUIZ_QUESTIONS[qIndex].a) {
                        playSound("pop");
                        if (qIndex < QUIZ_QUESTIONS.length - 1) {
                          setQIndex(qIndex + 1);
                        } else {
                          setQuizActive(false);
                          setQuizDone(true);
                          playSound("success");
                          update((s: any) => ({
                            ...s,
                            children: s.children.map((x: any) =>
                              x.id === c.id
                                ? {
                                    ...x,
                                    xp: { ...x.xp, current: Math.min(x.xp.max, x.xp.current + 50) },
                                    activity: [
                                      {
                                        id: crypto.randomUUID(),
                                        ts: Date.now(),
                                        text: `🎓 Passed Stock Market 101!`,
                                      },
                                      ...x.activity,
                                    ].slice(0, 30),
                                  }
                                : x,
                            ),
                          }));
                          setTimeout(
                            () => alert("🎉 You passed! +50 XP earned. You're ready to invest!"),
                            100,
                          );
                        }
                      } else {
                        playSound("error");
                        // alert("Oops! Try again.");
                      }
                    }}
                    className="w-full text-left p-4 rounded-xl border border-muted hover:border-primary hover:bg-primary/5 transition-colors font-medium text-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h2 className="font-bold text-lg mb-4">Popular Stocks</h2>
      <div className="space-y-3">
        {STOCKS.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => setSelectedStock(stock)}
            className="w-full bg-card border rounded-2xl p-4 flex items-center justify-between shadow-soft hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stock.color}`}
              >
                {stock.logo}
              </div>
              <div>
                <div className="font-bold">{stock.name}</div>
                <div className="text-xs text-muted-foreground">{stock.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">₹{stock.price}</div>
              <div
                className={`text-xs font-semibold ${stock.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
              >
                {stock.change}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-5 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selectedStock.color}`}
                >
                  {selectedStock.logo}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedStock.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedStock.symbol}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="py-10 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-success">Order Complete!</h3>
                <p className="text-muted-foreground mt-2">
                  You bought a piece of {selectedStock.name}.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-2xl mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Buy in ₹</span>
                    <span className="font-bold">From Savings: ₹{c.wallet.savings}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-3xl font-bold bg-background rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  {Number(amount) > 0 && (
                    <div className="mt-2 text-xs text-center text-muted-foreground">
                      Est. Shares: {(Number(amount) / selectedStock.price).toFixed(6)}
                    </div>
                  )}
                </div>

                <button
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > c.wallet.savings}
                  onClick={handleBuy}
                  className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-2xl disabled:opacity-50"
                >
                  Buy {selectedStock.symbol}
                </button>
                {Number(amount) > c.wallet.savings && (
                  <p className="text-xs text-destructive text-center mt-2 font-semibold">
                    Not enough in Savings!
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
