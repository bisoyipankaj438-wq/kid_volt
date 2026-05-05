import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useKidVolt } from "@/hooks/useKidVolt";
import { useState, useEffect } from "react";
import { playSound } from "@/lib/utils";

export const Route = createFileRoute("/kid/scanner")({
  component: ScannerRoute,
});

function ScannerRoute() {
  const { state, update } = useKidVolt();
  const nav = useNavigate();
  const c = state.children.find((ch: any) => ch.id === state.activeChildId);

  const [scanState, setScanState] = useState<"scanning" | "processing" | "success">("scanning");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");

  if (!c) return null;

  useEffect(() => {
    if (scanState === "scanning") {
      const timer = setTimeout(() => {
        setMerchant(
          ["McDonald's", "Starbucks", "Local Grocery", "Bookstore"][Math.floor(Math.random() * 4)],
        );
        setScanState("processing");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [scanState]);

  const handlePay = () => {
    const val = Number(amount);
    if (!val || val <= 0 || val > c.wallet.spendable) return;

    update((s: any) => {
      const child = s.children.find((x: any) => x.id === c.id);
      if (!child) return s;
      return {
        ...s,
        children: s.children.map((x: any) =>
          x.id === c.id
            ? {
                ...x,
                wallet: { ...x.wallet, spendable: x.wallet.spendable - val },
                activity: [
                  {
                    id: crypto.randomUUID(),
                    ts: Date.now(),
                    text: `🛍️ Paid at ${merchant}`,
                    delta: -val,
                  },
                  ...x.activity,
                ].slice(0, 30),
              }
            : x,
        ),
      };
    });
    setScanState("success");
    playSound("success");
    setTimeout(() => nav({ to: "/kid" }), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-5 flex justify-between items-center z-10">
        <button
          onClick={() => nav({ to: "/kid" })}
          className="text-xl w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur hover:bg-white/30 transition"
        >
          ✕
        </button>
        <div className="font-bold tracking-widest text-sm uppercase">Scan any QR</div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center">
        {scanState === "scanning" && (
          <>
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center overflow-hidden">
              <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#3b82f6] rounded-tl-3xl -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#3b82f6] rounded-tr-3xl -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#3b82f6] rounded-bl-3xl -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#3b82f6] rounded-br-3xl -mb-0.5 -mr-0.5"></div>
                <div
                  className="w-full h-0.5 bg-[#3b82f6] absolute top-0 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                  style={{ animation: "scanLine 2s linear infinite alternate" }}
                ></div>
              </div>
            </div>
            <div className="z-10 mt-80 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
              <p className="font-semibold text-sm">Point camera at store's QR code</p>
            </div>
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes scanLine {
                0% { top: 0%; opacity: 0.5; }
                50% { opacity: 1; }
                100% { top: 100%; opacity: 0.5; }
              }
            `,
              }}
            />
          </>
        )}

        {scanState === "processing" && (
          <div className="z-10 bg-white text-black p-8 rounded-3xl w-full max-w-[320px] shadow-2xl animate-pop">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-4">
                🏪
              </div>
              <h2 className="text-2xl font-bold">{merchant}</h2>
              <p className="text-sm text-gray-500 mt-1">Verified Merchant ✅</p>
            </div>

            <div className="mt-8">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                Amount to pay
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-4xl font-bold bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#3b82f6] transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between mt-3 px-2 text-sm">
                <span className="text-gray-500">Available balance:</span>
                <span
                  className={`font-bold ${Number(amount) > c.wallet.spendable ? "text-red-500" : "text-green-600"}`}
                >
                  ₹{c.wallet.spendable}
                </span>
              </div>
            </div>

            <button
              disabled={!amount || Number(amount) <= 0 || Number(amount) > c.wallet.spendable}
              onClick={handlePay}
              className="mt-8 w-full bg-[#3b82f6] text-white font-bold text-lg py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
            >
              Pay Now
            </button>
          </div>
        )}

        {scanState === "success" && (
          <div className="z-10 text-center animate-pop">
            <div className="w-32 h-32 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(34,197,94,0.5)] mb-6">
              ✓
            </div>
            <h2 className="text-4xl font-black mb-2">Paid ₹{amount}</h2>
            <p className="text-lg opacity-80">to {merchant}</p>
          </div>
        )}
      </main>
    </div>
  );
}
